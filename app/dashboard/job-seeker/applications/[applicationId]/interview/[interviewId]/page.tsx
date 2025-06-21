"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Mic, Phone, Timer, FileText, Percent, User, Star, MessageCircle, Brain, Laptop2, ThumbsUp, ThumbsDown, Info, Bot, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as Id<"applications">;
  const interviewId = params.interviewId as Id<"interviews">;

  // Fetch application, job post, and job seeker profile
  const application = useQuery(api.applications.getApplicationById, { applicationId });
  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    application?.userId ? { userId: application.userId } : "skip"
  );
  // Fetch the interview by interviewId
  const interview = useQuery(api.interviews.getInterviewById, { interviewId });

  // Interview state
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeUser, setActiveUser] = useState(false);
  
  // Refs for managing latest data
  const vapiRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);
  const autoSaveRef = useRef<any>(null);

  // Convex mutations
  const finalizeInterviewWithFeedback = useMutation(api.interviews.finalizeInterviewWithFeedback);
  const updateInterviewConversation = useMutation(api.interviews.updateInterviewConversation);

  // Log interview whenever it updates
  useEffect(() => {
    if (interview) {
      console.log('Interview from DB:', interview);
      
      // If interview already has conversation, load it
      if (interview.conversation && interview.conversation.length > 0) {
        setConversation(interview.conversation);
        conversationRef.current = interview.conversation;
      }
    }
  }, [interview]);

  // Format timer
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Start the interview with Vapi if not finished
  useEffect(() => {
    if (interview && !interview.feedback && !isInterviewStarted) {
      setIsInterviewStarted(true);
      startCall(interview.questions);
      timerRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    if (interview && interview.feedback) {
      setIsInterviewFinished(true);
      setFeedback(interview.feedback);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
    // eslint-disable-next-line
  }, [interview]);

  // Auto-save conversation during interview
  useEffect(() => {
    if (isInterviewStarted && !isInterviewFinished && interviewId) {
      autoSaveRef.current = setInterval(async () => {
        if (conversationRef.current.length > 0) {
          try {
            await updateInterviewConversation({
              interviewId,
              conversation: conversationRef.current,
            });
            console.log("Conversation auto-saved:", conversationRef.current.length, "messages");
          } catch (err) {
            console.error("Auto-save failed:", err);
          }
        }
      }, 10000); // Save every 10 seconds

      return () => {
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      };
    }
  }, [isInterviewStarted, isInterviewFinished, interviewId, updateInterviewConversation]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Save conversation on component unmount if interview is still in progress
      if (conversationRef.current.length > 0 && !isInterviewFinished && interviewId) {
        updateInterviewConversation({
          interviewId,
          conversation: conversationRef.current,
        }).catch(console.error);
      }
      
      // Clean up timers and Vapi
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {
          console.log("Vapi cleanup error:", e);
        }
      }
    };
  }, [interviewId, isInterviewFinished, updateInterviewConversation]);

  async function startCall(questionsToAsk: any[]) {
    if (!questionsToAsk.length) return;
    
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapiRef.current = vapi;
    
    let questionList = questionsToAsk.map(q => q.question).join(", ");
    
    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${application?.user?.name || "Candidate"}, how are you? Ready for your interview on ${application?.jobPost?.title || "the position"}?`,
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en-US" as const
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer"
      },
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        messages: [
          {
            role: "system" as const,
            content: `You are an AI voice assistant conducting interviews.\nYour job is to ask candidates provided interview questions, assess their responses.\nBegin the conversation with a friendly introduction, setting a relaxed yet professional tone.\nAsk one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise.\nBelow are the questions: ${questionList}\nIf the candidate struggles, offer hints or rephrase the question without giving away the answer.\nProvide brief, encouraging feedback after each answer.\nKeep the conversation natural and engaging.\nAfter all questions, wrap up the interview smoothly by summarizing their performance.\nKey Guidelines:\n* Be friendly, engaging, and witty 😉\n* Keep responses short and natural, like a real conversation\n* Adapt based on the candidate's confidence level\n* Ensure the interview remains focused on the job.`
          }
        ]
      },
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi-webhook`
    };

    // @ts-ignore
    vapi.start(assistantOptions);

    // Enhanced message handler with better conversation management
    vapi.on("message", (message: any) => {
      console.log("Vapi message received:", message);
      if (message?.conversation && Array.isArray(message.conversation)) {
        // Filter out system messages for cleaner conversation
        const filtered = message.conversation.filter(
          (msg: { role: string; content: string }) => msg.role !== 'system'
        );
        // Accumulate messages, avoiding duplicates
        setConversation((prev) => {
          // Only add new messages that aren't already present
          const newMessages = filtered.filter(
            (msg: { role: string; content: string }) =>
              !prev.some(
                (p) => p.role === msg.role && p.content === msg.content
              )
          );
          const updated = [...prev, ...newMessages];
          conversationRef.current = updated;
          return updated;
        });
      }
    });

    vapi.on("speech-start", () => {
      console.log("Speech started - AI speaking");
      setActiveUser(false);
    });

    vapi.on("speech-end", () => {
      console.log("Speech ended - User can speak");
      setActiveUser(true);
    });

    vapi.on("call-start", () => {
      console.log("Call started");
      toast.success("Interview Connected...");
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      toast.success("Interview Ended...");
      stopInterview();
    });

    vapi.on("error", (error: any) => {
      console.error("Vapi error:", error);
      toast.error("Interview connection error: " + error.message);
    });
  }

  // Stop interview and generate feedback
  async function stopInterview() {
    console.log("Stopping interview...");
    
    // Stop Vapi and timers
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (e) {
        console.log("Error stopping Vapi:", e);
      }
    }
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    
    setIsInterviewFinished(true);
    setSeconds(0);
    
    // Use the ref to get the latest conversation
    const latestConversation = conversationRef.current;
    console.log("Latest conversation to save:", latestConversation);
    
    if (!latestConversation || latestConversation.length === 0) {
      console.warn("No conversation to save");
      toast.warning("No conversation recorded during the interview");
      return;
    }
    
    try {
      console.log("Saving conversation to database...");
      await updateInterviewConversation({
        interviewId,
        conversation: latestConversation,
      });
      console.log("Conversation saved successfully");
      toast.success("Interview conversation saved");
    } catch (err) {
      console.error("Failed to save conversation:", err);
      toast.error("Failed to save conversation: " + (err as Error).message);
    }
    
    // Generate feedback with the latest conversation
    await generateFeedback(latestConversation);
  }

  // Generate feedback after interview
  async function generateFeedback(conversationData?: { role: string; content: string }[]) {
    setLoading(true);
    const conversationToUse = conversationData || conversationRef.current;
    
    console.log("Generating feedback with conversation:", conversationToUse);
    
    if (!conversationToUse || conversationToUse.length === 0) {
      console.error("No conversation data for feedback generation");
      toast.error("Cannot generate feedback without conversation data");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        body: JSON.stringify({
          conversation: conversationToUse
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to generate feedback: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Feedback generated:", data.feedback);
      
      setFeedback(data.feedback);
      
      if (interviewId) {
        await finalizeInterviewWithFeedback({
          interviewId,
          conversation: conversationToUse,
          feedback: data.feedback,
        });
        await updateInterviewConversation({
          interviewId,
          conversation: conversationToUse,
        });
        console.log("Feedback and conversation saved together");
      }
      
      toast.success("Interview feedback generated successfully");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Manual save function for debugging
  const manualSave = async () => {
    try {
      await updateInterviewConversation({
        interviewId,
        conversation: conversationRef.current,
      });
      toast.success("Conversation saved manually");
      console.log("Manual save successful");
    } catch (err) {
      console.error("Manual save failed:", err);
      toast.error("Manual save failed");
    }
  };

  if (!application || !jobSeekerProfile || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted px-4">
        <Card className="p-4 sm:p-8 shadow-lg rounded-lg flex flex-col items-center max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-primary text-center">Loading Interview</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">Please wait while we fetch your interview data...</p>
        </Card>
      </div>
    );
  }

  const fb = feedback?.feedback ?? feedback;

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl px-4">
      <BlurFade delay={0.1} duration={0.5} inView={true}>
        <Card className="p-4 sm:p-6 shadow-lg rounded-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="break-words">Interview for {application.jobPost.title}</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 dark:text-gray-300 mt-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium break-words">{application.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-mono font-medium">{formatTime(seconds)}</span>
              </div>
              {/* Debug info */}
              <div className="flex items-center gap-2 text-xs">
                <span>Messages: {conversationRef.current.length}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 sm:space-y-8">
            {!isInterviewFinished && (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center justify-center gap-2 mb-2">
                    <div className="relative flex items-center">
                      <Mic className="h-5 w-5 text-primary" />
                      <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse"></div>
                    </div>
                    Interview in Progress
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your conversation is being recorded for evaluation
                  </p>
                </div>

                {/* Interview Participants - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center mb-6">
                  {/* AI Recruiter */}
                  <div className="relative flex justify-center">
                    <div className={`bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                      h-40 w-36 sm:h-48 sm:w-40 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-3 sm:p-4 gap-3
                      ${!activeUser ? 'border-blue-400 shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                      
                      {/* Speaking indicator for AI */}
                      {!activeUser && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg">
                          <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <img 
                          src="/ai.png" 
                          alt="AI Recruiter" 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-white shadow-md" 
                        />
                        {!activeUser && (
                          <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-400 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">AI Recruiter</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {!activeUser ? 'Speaking...' : 'Listening'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate */}
                  <div className="relative flex justify-center">
                    <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
                      h-40 w-36 sm:h-48 sm:w-40 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-3 sm:p-4 gap-3
                      ${activeUser ? 'border-green-400 shadow-lg shadow-green-200 dark:shadow-green-900/30' : 'border-gray-200 dark:border-gray-600'}`}>
                      
                      {/* Speaking indicator for user */}
                      {activeUser && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg">
                          <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-md">
                          {application?.user?.name?.[0]?.toUpperCase()}
                        </div>
                        {activeUser && (
                          <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-green-400 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm break-words">{application?.user?.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activeUser ? 'Speaking...' : 'Listening'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button 
                      onClick={stopInterview} 
                      className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Ending Interview...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          End Interview
                        </>
                      )}
                    </Button>
                    
                    {/* Debug: Manual save button */}
                    <Button 
                      onClick={manualSave}
                      variant="outline"
                      className="px-4 py-2 text-sm"
                    >
                      Save Progress
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Interview in progress ({conversationRef.current.length} messages recorded)
                  </div>
                </div>
              </div>
            )}

            {isInterviewFinished && (
              <BlurFade delay={0.3} duration={0.5} inView={true}>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Percent className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Interview Feedback
                  </h3>
                  
                  {fb ? (
                    <div className="space-y-6">
                      {interview?.recordingUrl && (
                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 dark:text-white">Interview Recording</h4>
                          <audio controls src={interview.recordingUrl} className="w-full rounded-md">
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {/* Recommendation Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Badge 
                          variant={fb.Recommendation === 'Recommended' ? 'default' : 'destructive'}
                          className="text-sm px-2 py-1 w-fit"
                        >
                          {fb.Recommendation === 'Recommended' ? (
                            <ThumbsUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-1" />
                          )}
                          {fb.Recommendation}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{fb.RecommendationMsg}</span>
                      </div>

                      {/* Ratings Grid */}
                      <div className="flex flex-col sm:grid sm:grid-cols-1 gap-4">
                        {[
                          { icon: MessageCircle, label: 'Communication', value: fb.rating?.communication },
                          { icon: Laptop2, label: 'Technical Skills', value: fb.rating?.technicalSkills },
                          { icon: Brain, label: 'Problem Solving', value: fb.rating?.problemSolving },
                          { icon: Star, label: 'Experience', value: fb.rating?.experience }
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="w-20 sm:w-24 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                            </div>
                            <Progress value={value * 10} className="w-full h-2 mt-2 sm:mt-0" />
                            <span className="font-semibold text-sm w-8 text-right">{value}/10</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Summary</div>
                            <div className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{fb.summary}</div>
                          </div>
                        </div>
                      </div>

                      {/* Conversation Transcript as Chat */}
                      {(interview.conversation?.length > 0 || conversationRef.current.length > 0) && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            Conversation Transcript ({interview.conversation?.length || conversationRef.current.length} messages)
                          </h4>
                          <div className="max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                            {(interview.conversation || conversationRef.current)?.map((msg: { role: string; content: string }, idx: number) => {
                              if (msg.role === 'assistant') {
                                return (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-2 rounded-lg font-medium text-sm max-w-[85%] break-words flex items-start gap-2">
                                      <Bot className="h-4 w-4 text-primary flex-shrink-0 self-start" />
                                      {msg.content}
                                    </div>
                                  </div>
                                );
                              } else if (msg.role === 'user') {
                                return (
                                  <div key={idx} className="flex items-end justify-end gap-2">
                                    <div className="bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100 px-3 py-2 rounded-lg font-medium text-sm max-w-[85%] break-words flex items-start gap-2">
                                      <UserIcon className="h-4 w-4 text-primary flex-shrink-0 self-start" />
                                      {msg.content}
                                    </div>
                                  </div>
                                );
                              } else {
                                return null;
                              }
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                      <span className="text-gray-600 dark:text-gray-400 text-center">Generating detailed feedback...</span>
                    </div>
                  )}
                </div>
              </BlurFade>
            )}
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}