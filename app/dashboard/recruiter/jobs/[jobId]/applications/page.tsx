"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { User, FileText, ArrowRight } from "lucide-react";

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.jobId as Id<"jobPosts">;
  const applications = useQuery(api.applications.getApplicationsByJobPost, { jobPostId: jobId });

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-3xl px-4">
      <Card className="p-4 sm:p-6 shadow-lg rounded-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="break-words">Applications for Job</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications === undefined ? (
            <div className="text-center text-muted-foreground">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center text-muted-foreground">No applications yet for this job.</div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium text-gray-800 dark:text-white">{app.profile?.title || app.userId}</span>
                    <Badge
                      className="ml-2 text-xs"
                      variant={
                        app.status === "accepted"
                          ? "success"
                          : app.status === "rejected"
                          ? "destructive"
                          : app.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  <Link href={`/dashboard/recruiter/interview/applications/${app._id}`} className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                    View Interviews <ArrowRight className="h-4 w-4" />
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