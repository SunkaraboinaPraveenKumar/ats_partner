"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.applicationId as Id<"applications">;

  const application = useQuery(api.applications.getApplicationById, { applicationId });

  if (application === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (application === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
          <p>The application you are looking for does not exist or you do not have access to it.</p>
        </div>
      </div>
    );
  }

  const { jobPost, user: jobSeeker, matchRatio, status } = application;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Application for {jobPost.title}
            <Badge className={`capitalize ${status === "accepted" ? "bg-green-500 text-white" : status === "rejected" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}>{status}</Badge>
          </CardTitle>
          <CardDescription>
            Applied by {jobSeeker.name} on {new Date(application._creationTime).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 shadow-lg rounded-lg">
          <div className="p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-2">Job Post Details</h3>
            <p><strong>Company:</strong> {jobPost.company}</p>
            <p><strong>Location:</strong> {jobPost.location}</p>
            <p><strong>Description:</strong> {jobPost.description}</p>
            <Link href={`/dashboard/job-seeker/jobs/${jobPost._id}`} className="text-primary hover:underline flex items-center gap-1 mt-2">
              View Original Job Post <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <Separator />
          <div className="p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-2">Applicant Details</h3>
            <p><strong>Name:</strong> {jobSeeker.name}</p>
            <p><strong>Email:</strong> {jobSeeker.email}</p>
          </div>
          <Separator />
          <div className="p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-2">Match Details</h3>
            <p><strong>Match Ratio:</strong> {(matchRatio * 100).toFixed(2)}%</p>
            {/* You can add more detailed match information here if available */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 