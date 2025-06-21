"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Mic, Phone, Timer, FileText, Percent, User, Calendar, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as Id<"applications">;

  // Fetch application, job post, and job seeker profile
  const application = useQuery(api.applications.getApplicationById, { applicationId });
  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    application?.userId ? { userId: application.userId } : "skip"
  );
  // Fetch all interviews for this application
  const interviews = useQuery(api.interviews.getInterviewsByApplicationId, { applicationId });

  // Interview state
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [interviewId, setInterviewId] = useState<Id<"interviews"> | null>(null);
  const [conversation, setConversation] = useState<string>("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeUser, setActiveUser] = useState(false);
  const vapiRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Convex mutations
  const createInterview = useMutation(api.interviews.createInterview);
  const addInterviewAnswer = useMutation(api.interviews.addInterviewAnswer);
  const finalizeInterviewWithFeedback = useMutation(api.interviews.finalizeInterviewWithFeedback);

  // Format timer
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Generate new questions and start a new interview
  async function generateNewInterview() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: JSON.stringify({
          jobTitle: application?.jobPost?.title,
          jobDescription: application?.jobPost?.description,
          duration: 10,
          type: "Technical",
          skills: jobSeekerProfile?.extractedSkills,
          resumeText: jobSeekerProfile?.resumeText,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);
      
      const newQuestions = data.interviewQuestions || [];
      
      if (!newQuestions || newQuestions.length === 0) {
        throw new Error("No questions were generated");
      }

      if (!application) {
        throw new Error("Application data not available");
      }

      const id = await createInterview({
        applicationId,
        jobSeekerId: application.userId,
        questions: newQuestions,
      });

      setLoading(false);
      router.push(`/dashboard/job-seeker/applications/${applicationId}/interview/${id}`);
      
    } catch (error) {
      console.error("Error generating interview:", error);
      setLoading(false);
      toast.error("Failed to generate interview questions. Please try again.");
    }
  }

  // Redirect to the interview detail page for the selected interview
  function goToInterview(interview: any) {
    router.push(`/dashboard/job-seeker/applications/${applicationId}/interview/${interview._id}`);
  }

  // Select an existing interview to view or continue
  function selectInterview(interview: any) {
    setSelectedInterview(interview);
    setQuestions(interview.questions);
    setInterviewId(interview._id);
    setIsInterviewStarted(false);
    setIsInterviewFinished(!!interview.feedback);
    setFeedback(interview.feedback || null);
    setConversation(interview.conversation || "");
    setSeconds(0);
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // --- UI ---
  if (!application || !jobSeekerProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted p-4">
        <Card className="p-6 md:p-8 shadow-lg rounded-lg flex flex-col items-center max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-primary text-center">Loading Interview</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">Please wait while we fetch your interview data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4">
      <BlurFade delay={0.1} duration={0.5} inView={true}>
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-start gap-2 text-xl md:text-2xl font-bold mb-2">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-1" /> 
              <span className="leading-tight">Interview for {application.jobPost.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4 text-primary flex-shrink-0" /> 
              <span>{application.user.name}</span>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 md:p-6 space-y-6">
            {/* Show all previous interviews as cards */}
            {interviews && interviews.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Previous Interviews
                </h3>
                {interviews.map((interview: any, index: number) => (
                  <Card key={interview._id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Mobile-first layout */}
                      <div className="space-y-3">
                        {/* Header with title and index */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-200">
                            Interview #{index + 1}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {interview.feedback ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        
                        {/* Interview details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>Questions: {interview.questions?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>Feedback: {interview.feedback ? "Available" : "Pending"}</span>
                          </div>
                        </div>
                        
                        {/* Start date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
                          <span>Started: {new Date(interview.createdAt).toLocaleString()}</span>
                        </div>
                        
                        {/* Action button */}
                        <div className="pt-2">
                          <Button
                            size="sm"
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                            onClick={() => goToInterview(interview)}
                          >
                            View / Continue
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Empty state when no interviews */}
            {interviews && interviews.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  No interviews yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Generate your first interview to get started with the assessment process.
                </p>
              </div>
            )}
            
            {/* Generate new interview button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 text-sm md:text-base"
                onClick={generateNewInterview}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating New Interview...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Generate New Interview</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}