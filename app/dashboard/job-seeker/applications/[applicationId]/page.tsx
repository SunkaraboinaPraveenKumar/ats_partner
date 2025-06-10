"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Briefcase, User, Percent, Mail, MapPin, Calendar, FileText, ExternalLink, IndianRupee } from "lucide-react";
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
      <Card className="p-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold mb-2">
            <FileText className="h-6 w-6 text-primary" /> Application for {jobPost.title}
            <Badge className={`ml-auto capitalize ${status === "accepted" ? "bg-green-500 text-white" : status === "rejected" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}>{status}</Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-md text-gray-700 dark:text-gray-300">
            <User className="h-4 w-4 text-primary" /> Applied by {jobSeeker.name}
            <Calendar className="h-4 w-4 text-primary ml-4" /> on {new Date(application._creationTime).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-4 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Job Post Details
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p className="flex items-center gap-2"><strong>Company:</strong> {jobPost.company}</p>
              <p className="flex items-center gap-2"><strong>Location:</strong> <MapPin className="h-4 w-4 text-primary" /> {jobPost.location}</p>
              {jobPost.salary && <p className="flex items-center gap-2"><strong>Salary:</strong> <IndianRupee className="h-4 w-4 text-primary" /> {jobPost.salary}</p>}
              <p><strong>Description:</strong> {jobPost.description}</p>
              <Link href={`/dashboard/job-seeker/jobs/${jobPost._id}`} className="text-primary hover:underline flex items-center gap-1 mt-2">
                View Original Job Post
              </Link>
            </div>
          </div>
          <Separator />
          <div className="p-4 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Applicant Details
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p className="flex items-center gap-2"><strong>Name:</strong> {jobSeeker.name}</p>
              <p className="flex items-center gap-2"><strong>Email:</strong> <Mail className="h-4 w-4 text-primary" /> {jobSeeker.email}</p>
            </div>
          </div>
          <Separator />
          <div className="p-4 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" /> Match Details
            </h3>
            <p className="text-gray-700 dark:text-gray-300"><strong>Match Ratio:</strong> {(matchRatio * 100).toFixed(2)}%</p>
            {/* You can add more detailed match information here if available */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 