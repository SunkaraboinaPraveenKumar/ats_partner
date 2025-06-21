"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Percent, MessageCircle, Laptop2, Brain, Star, Info, Bot, User as UserIcon, FileText } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function RecruiterInterviewDetailPage() {
  const params = useParams();
  const interviewId = params.interviewId as Id<"interviews">;
  const interview = useQuery(api.interviews.getInterviewById, { interviewId });
  const application = useQuery(
    api.applications.getApplicationById,
    interview ? { applicationId: interview.applicationId } : "skip"
  );

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted px-4">
        <Card className="p-4 sm:p-8 shadow-lg rounded-lg flex flex-col items-center max-w-md w-full">
          <FileText className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-primary text-center">Loading Interview</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">Please wait while we fetch the interview data...</p>
        </Card>
      </div>
    );
  }

  const fb = interview.feedback?.feedback;

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl px-4">
      <Card className="p-4 sm:p-6 shadow-lg rounded-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <span className="break-words">Interview Details</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 dark:text-gray-300 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-medium break-words">{application?.jobPost?.title || "Job Title"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium break-words">Candidate: {application?.user?.name || interview?.jobSeekerId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{new Date(interview.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fb ? (
            <div className="space-y-6">
              {/* Recommendation Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Badge 
                  variant={fb.Recommendation === 'Recommended' ? 'success' : 'destructive'}
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
                    <Progress value={(value ?? 0) * 10} className="w-full h-2 mt-2 sm:mt-0" />
                    <span className="font-semibold text-sm w-8 text-right">{value ?? "N/A"}/10</span>
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
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No feedback available yet.</div>
          )}

          {/* Conversation Transcript as Chat */}
          {(interview.conversation?.length > 0) && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Conversation Transcript ({interview.conversation.length} messages)
              </h4>
              <div className="max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                {interview.conversation.map((msg: { role: string; content: string }, idx: number) => {
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
        </CardContent>
      </Card>
    </div>
  );
} 