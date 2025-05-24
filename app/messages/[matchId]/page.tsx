"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import MessageList from "../_components/MessageList";
import MessageInput from "../_components/MessageInput";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Bot, AlertCircle } from "lucide-react";

// Helper function to make the API call to the Groq route
export async function callGroqApi({
  job,
  messages,
  application,
  onNewMessage,
  onError,
  onComplete,
  aiUserId,
}: {
  job: Doc<"jobPosts">;
  messages: { role: "user" | "assistant"; content: string }[];
  application?: Doc<"applications"> | null;
  onNewMessage: (content: string) => void;
  onError: (error: string) => void;
  onComplete: (finalContent: string) => void; // Pass final content to onComplete
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
            onComplete(streamingContent); // Pass the accumulated content
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
    onComplete(streamingContent);
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    onError(error.message || "An error occurred while fetching AI response.");
    onComplete(""); // Pass empty string on error
  }
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchIdString = params.matchId as string;
  const matchId = matchIdString as Id<"matches">;

  // Fetch authenticated user
  const { user } = useAuthStore();

  // Fetch messages and job post
  const messagesAndJob = useQuery(api.messages.getMessages, { 
    matchId,
    userId: user?.userId as Id<"users">
  });
  const messages = messagesAndJob?.messages;
  const jobPost = messagesAndJob?.jobPost;

  // Fetch user's application
  const application = useQuery(api.applications.getApplicationForMatch, { 
    matchId,
    userId: user?.userId as Id<"users">
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

  // Redirect if no match is found
  useEffect(() => {
    if (messagesAndJob === null) {
      router.push('/dashboard/job-seeker');
    }
  }, [messagesAndJob, router]);

  const handleAskAi = async (userMessageContent?: string) => {
    if (!jobPost || !messages || !user) return;

    setIsAiLoading(true);
    setIsStreaming(true);
    setAiError(null);
    setStreamingContent("");

    // Use existing messages + the potential user message triggering this AI call
    const messagesForApi = userMessageContent
      ? [...messages.map(msg => ({
          role: (msg.senderId === user.userId ? 'user' : 'assistant') as "user" | "assistant",
          content: msg.content
        })), { role: 'user' as "user", content: userMessageContent }]
      : messages.map(msg => ({
          role: (msg.senderId === user.userId ? 'user' : 'assistant') as "user" | "assistant",
          content: msg.content
        }));

    try {
      await callGroqApi({
        job: jobPost,
        messages: messagesForApi,
        application,
        onNewMessage: (content) => {
          setStreamingContent(prev => prev + content);
        },
        onError: (error) => {
          setAiError(error);
          setIsStreaming(false);
          setIsAiLoading(false);
        },
        onComplete: async (finalContent) => {
          console.log("AI streaming complete. Final content:", finalContent);
          
          // Save the complete AI response as a message
          if (finalContent.trim()) {
            try {
              const messageResult = await sendMessage({
                matchId,
                content: finalContent.trim(),
                userId: user?.userId as Id<"users">, // Use consistent AI user ID
                isAiResponse: true,
                messageType: "ai"
              });
              console.log("AI message saved successfully:", messageResult);
            } catch (error) {
              console.error("Error saving AI response:", error);
              setAiError("Failed to save AI response");
            }
          } else {
            console.warn("No content to save from AI stream.");
          }
          
          setIsStreaming(false);
          setIsAiLoading(false);
          setStreamingContent(""); // Clear streaming content after saving
        },
        aiUserId: user?.userId as Id<"users">,
      });
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "An error occurred");
      setIsStreaming(false);
      setIsAiLoading(false);
      setStreamingContent("");
    }
  };

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!messages || !jobPost) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat and job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (messagesAndJob === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Error loading chat details</p>
          <p className="text-sm mt-2 text-gray-500">Please make sure you have access to this conversation.</p>
          <Button 
            onClick={() => router.push('/dashboard/job-seeker')} 
            className="mt-4"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {jobPost.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {jobPost.company} • Chat with AI Assistant
            </p>
          </div>
          <Button 
            onClick={() => handleAskAi()} 
            disabled={isAiLoading || isStreaming}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bot className="h-4 w-4 mr-2" />
            {isAiLoading ? "AI Thinking..." : "Ask AI"}
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList 
          messages={messages} 
          currentUserId={user.userId as Id<"users">}
          application={application}
        />
        
        {/* Streaming AI Response */}
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                AI Assistant
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: streamingContent.replace(/\n/g, '<br>') 
                  }} 
                />
                <div className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></div>
              </div>
            </div>
          </div>
        )}

        {/* AI Loading State */}
        {isAiLoading && !isStreaming && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium">AI is analyzing your conversation...</span>
            </div>
          </div>
        )}

        {/* AI Error State */}
        {aiError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">AI Error</span>
            </div>
            <p className="mt-1 text-sm">{aiError}</p>
            <Button 
              onClick={() => setAiError(null)} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-gray-800 p-4 shadow-lg">
        {application !== undefined && (
          <MessageInput
            matchId={matchId}
            user={user}
            messages={messages}
            jobPost={jobPost}
            application={application}
            onTriggerAi={handleAskAi}
          />
        )}
      </div>
    </div>
  );
}