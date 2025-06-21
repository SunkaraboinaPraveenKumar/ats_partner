"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Mic, Phone, Timer, FileText, Percent, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { BlurFade } from "@/components/magicui/blur-fade";

// --- Vapi SDK import (replace with actual import) ---
// import Vapi from "vapi-sdk"; // Example, adjust as needed

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
    const data = await res.json();
    console.log(data);
    const newQuestions = data.interviewQuestions || [];
    if (!application) return;
    const id = await createInterview({
      applicationId,
      jobSeekerId: application.userId,
      questions: newQuestions,
    });
    setLoading(false);
    // Redirect to the new interview detail page
    router.push(`/dashboard/job-seeker/applications/${applicationId}/interview/${id}`);
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
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Card className="p-8 shadow-lg rounded-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-primary">Loading Interview</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your interview data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <BlurFade delay={0.1} duration={0.5} inView={true}>
        <Card className="p-6 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold mb-2">
              <FileText className="h-6 w-6 text-primary" /> Interview for {application.jobPost.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-md text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4 text-primary" /> {application.user.name}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Show all previous interviews as cards */}
            {interviews && interviews.length > 0 && (
              <div className="space-y-4">
                {interviews.map((interview: any,index) => (
                  <Card key={interview._id} className="relative p-4 border shadow-md">
                    <Button
                      size="sm"
                      className="absolute top-4 right-4 bg-primary text-white"
                      onClick={() => goToInterview(interview)}
                    >
                      View / Continue
                    </Button>
                    <div className="mb-2 font-semibold">Interview #{index}</div>
                    <div className="mb-2 text-sm text-gray-600">Questions: {interview.questions.length}</div>
                    <div className="mb-2 text-sm text-gray-600">Feedback: {interview.feedback ? "Available" : "Not yet generated"}</div>
                    <div className="mb-2 text-xs text-gray-400">Started: {new Date(interview.createdAt).toLocaleString()}</div>
                  </Card>
                ))}
              </div>
            )}
            {/* Button to generate a new interview */}
            <Button
              className="w-full mt-4 bg-green-600 text-white"
              onClick={generateNewInterview}
              disabled={loading}
            >
              {loading ? "Generating New Interview..." : "Generate New Interview"}
            </Button>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}