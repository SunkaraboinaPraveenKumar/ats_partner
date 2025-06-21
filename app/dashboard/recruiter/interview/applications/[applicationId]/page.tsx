"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { FileText, Eye } from "lucide-react";

export default function ApplicationInterviewsPage() {
  const params = useParams();
  const applicationId = params.applicationId as Id<"applications">;
  const interviews = useQuery(api.interviews.getInterviewsByApplicationId, { applicationId });

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-3xl px-4">
      <Card className="p-4 sm:p-6 shadow-lg rounded-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="break-words">Interviews for Application</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interviews === undefined ? (
            <div className="text-center text-muted-foreground">Loading interviews...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center text-muted-foreground">No interviews yet for this application.</div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview, idx) => (
                <Card key={interview._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-white">Interview #{idx + 1}</span>
                    <span className="text-xs text-gray-500">{new Date(interview.createdAt).toLocaleString()}</span>
                    <Badge
                      className="ml-2 text-xs"
                      variant={
                        interview.feedback?.feedback?.Recommendation === "Recommended"
                          ? "success"
                          : interview.feedback?.feedback?.Recommendation === "Not Recommended"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {interview.feedback?.feedback?.Recommendation || "Pending"}
                    </Badge>
                  </div>
                  <Link href={`/dashboard/recruiter/interview/${interview._id}`} className="text-primary hover:text-primary/80 ml-2" title="View Details">
                    <Eye className="h-5 w-5" />
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 