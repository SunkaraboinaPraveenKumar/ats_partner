"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import MessageList from "../_components/MessageList";
import MessageInput from "../_components/MessageInput";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Bot, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

// Helper function to make the API call to the Groq route
export async function callGroqApi({
  job,
  messages,
  application,
  recruiterProfile,
  jobSeekerProfile,
  onNewMessage,
  onError,
  onComplete,
  aiUserId,
}: {
  job: Doc<"jobPosts">;
  messages: { role: "user" | "assistant"; content: string }[];
  application?: Doc<"applications"> | null;
  recruiterProfile?: Doc<"recruiterProfiles"> | null;
  jobSeekerProfile?: Doc<"jobSeekerProfiles"> | null;
  onNewMessage: (content: string) => void;
  onError: (error: string) => void;
  onComplete: (finalContent: string, aiUserId: Id<"users">) => void; // Pass final content and aiUserId to onComplete
  aiUserId: Id<"users">;
}) {
  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job,
        messages,
        application,
        recruiterProfile,
        jobSeekerProfile,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch from Groq API");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let streamingContent = ""; // Track content locally in this function
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            onComplete(streamingContent, aiUserId); // Pass the accumulated content and aiUserId
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              streamingContent += parsed.content; // Accumulate locally
              onNewMessage(parsed.content);
            } else if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch (e) {
            // Try parsing as plain text if JSON parsing fails
            if (data.trim() !== '') {
              streamingContent += data;
              onNewMessage(data);
            }
          }
        }
      }
    }
    
    // Final completion with accumulated content
    onComplete(streamingContent, aiUserId);
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    onError(error.message || "An error occurred while fetching AI response.");
    onComplete("", aiUserId); // Pass empty string on error and aiUserId
  }
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchIdString = params.matchId as string;
  const matchId = matchIdString as Id<"matches">;

  // Fetch authenticated user
  const { data: session, status } = useSession();

  // Fetch messages and job post
  const messagesAndJob = useQuery(api.messages.getMessages, { 
    matchId,
    userId: session?.user?.id as Id<"users">
  });
  const messages = messagesAndJob?.messages;
  const jobPost = messagesAndJob?.jobPost;

  // Fetch recruiter profile (company details)
  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    jobPost?.recruiterId ? { userId: jobPost.recruiterId as Id<"users"> } : "skip"
  );

  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Fetch user's application
  const application = useQuery(api.applications.getApplicationForMatch, { 
    matchId,
    userId: session?.user?.id as Id<"users">
  });

  // Send message mutation
  const sendMessage = useMutation(api.messages.sendMessage);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Redirect if no match is found or not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (messagesAndJob === null) {
      router.push('/dashboard/job-seeker'); // or a more generic dashboard
    }
  }, [messagesAndJob, router, status]);

  const handleAskAi = async (userMessageContent?: string) => {
    if (!jobPost || !messages || !session?.user?.id) return;

    setIsAiLoading(true);
    setIsStreaming(true);
    setAiError(null);
    setStreamingContent("");

    // Use existing messages + the potential user message triggering this AI call
    const messagesForApi = userMessageContent
      ? [...messages.map(msg => ({
          role: (msg.senderId === session.user.id ? 'user' : 'assistant') as "user" | "assistant",
          content: msg.content
        })), { role: 'user' as "user", content: userMessageContent }]
      : messages.map(msg => ({
          role: (msg.senderId === session.user.id ? 'user' : 'assistant') as "user" | "assistant",
          content: msg.content
        }));

    try {
      await callGroqApi({
        job: jobPost,
        messages: messagesForApi,
        application,
        recruiterProfile,
        jobSeekerProfile,
        onNewMessage: (content) => {
          setStreamingContent(prev => prev + content);
        },
        onError: (error) => {
          setAiError(error);
          setIsStreaming(false);
        },
        onComplete: async (finalContent, aiUserIdInCallback) => {
          if (finalContent) {
            // Save the complete AI response to Convex
            await sendMessage({
              matchId: matchId,
              userId: aiUserIdInCallback, // Corrected to use the AI user ID from callback
              content: finalContent,
              isAiResponse: true,
            });
          }
          setIsAiLoading(false);
          setIsStreaming(false);
        },
        aiUserId: session.user.id as Id<"users">, // Ensure this is the actual AI user ID
      });
    } catch (error: any) {
      console.error("Error in handleAskAi:", error);
      setAiError(error.message || "Failed to get AI response.");
      setIsAiLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !session?.user?.id) return;

    try {
      await sendMessage({
        matchId: matchId,
        userId: session.user.id as Id<"users">,
        content,
      });

      // After user sends a message, trigger AI response
      // Make sure the AI user ID is correctly passed here
      await handleAskAi(content); // Pass the user's message content to the AI handler

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)]">
      {/* Header for Chat UI */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">
            Chat with {jobPost?.title}
          </h2>
        </div>
        {application && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/dashboard/job-seeker/applications/${application._id}`)}
          >
            View Application
          </Button>
        )}
      </div>

      {/* Main chat area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {aiError && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-md flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {aiError}</span>
          </div>
        )}
        <MessageList 
          messages={messages || []}
          currentUserId={session?.user?.id as Id<"users">}
          application={application}
          messagesEndRef={messagesEndRef}
        />
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">
                AI Assistant
              </div>
              <div className="inline-block max-w-full rounded-lg px-4 py-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                <div 
                  className="text-sm leading-relaxed text-gray-900 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: streamingContent.replace(/\n/g, '<br>') }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input fixed at bottom */}
      <div className="sticky bottom-0 z-10 bg-background border-t p-4">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isAiLoading} />
      </div>
    </div>
  );
}