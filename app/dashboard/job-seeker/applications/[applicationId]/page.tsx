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
import { BlurFade } from "@/components/magicui/blur-fade";
import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.applicationId as Id<"applications">;

  const application = useQuery(api.applications.getApplicationById, { applicationId });
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  const { jobPost, user: jobSeeker, matchRatio, status: applicationStatus } = application;

  return (
    <div className="container mx-auto py-8">
      <BlurFade delay={0.1} duration={0.5} inView={true}>
        <Card className="p-6 shadow-lg rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 mb-2">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <FileText className="h-6 w-6 text-primary" /> Application for {jobPost.title}
              </CardTitle>
              <Badge className={`capitalize ${applicationStatus === "accepted" ? "bg-green-500 text-white" : applicationStatus === "rejected" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}>{applicationStatus}</Badge>
            </div>
            <CardDescription className="flex items-center gap-2 text-md text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4 text-primary" /> Applied by {jobSeeker.name}
              <Calendar className="h-4 w-4 text-primary ml-4" /> on {new Date(application._creationTime).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <BlurFade delay={0.2} duration={0.5} inView={true}>
              <div className="p-4 rounded-lg shadow-md border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Job Post Details
                  </h3>
                  <Link
                    href={`/dashboard/job-seeker/applications/${applicationId}/interview`}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition ml-4"
                  >
                    Start Interview
                  </Link>
                </div>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><strong>Company:</strong> {jobPost.company}</p>
                  <p className="flex items-center gap-2"><strong>Location:</strong> <MapPin className="h-4 w-4 text-primary" /> {jobPost.location}</p>
                  {jobPost.salary && <p className="flex items-center gap-2"><strong>Salary:</strong> <IndianRupee className="h-4 w-4 text-primary" /> {jobPost.salary}</p>}
                  <p><strong>Description:</strong> {jobPost.description}</p>
                  <div className="mt-4">
                    <Link href={`/dashboard/job-seeker/jobs/${jobPost._id}`} passHref>
                      <Button variant="outline">
                        View Original Job Post
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </BlurFade>
            <Separator />
            <BlurFade delay={0.3} duration={0.5} inView={true}>
              <div className="p-4 rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Applicant Details
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><strong>Name:</strong> {jobSeeker.name}</p>
                  <p className="flex items-center gap-2"><strong>Email:</strong> <Mail className="h-4 w-4 text-primary" /> {jobSeeker.email}</p>
                </div>
              </div>
            </BlurFade>
            <Separator />
            <BlurFade delay={0.4} duration={0.5} inView={true}>
              <div className="p-4 rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" /> Match Details
                </h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>Match Ratio:</strong> {(matchRatio * 100).toFixed(2)}%</p>
                {/* You can add more detailed match information here if available */}
              </div>
            </BlurFade>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
} 