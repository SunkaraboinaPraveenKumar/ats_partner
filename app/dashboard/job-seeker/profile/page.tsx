"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
// Import UI components for displaying profile and modal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, EyeIcon, Loader2, Upload, Calendar, User, Mail, Phone, MapPin, Briefcase, DollarSign, ListChecks, GraduationCap } from 'lucide-react';
import { useMutation } from "convex/react";
import { useAction } from "convex/react";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { toast } from "sonner";
import { generateUploadUrl } from '@/convex/files';
import Link from 'next/link';
import { BlurFade } from '@/components/magicui/blur-fade';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";

function JobSeekerProfilePage() {
  const { data: session, status } = useSession();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch job seeker profile
  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    session?.user?.role === 'job-seeker' && session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Add this query
  const applications = useQuery(
    api.applications.getApplicationsByUser,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Add these mutations and actions
  const updateJobSeekerProfile = useMutation(api.profiles.updateJobSeekerProfile);
  const ingestResume = useAction(api.action.ingest);
  const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);

  // Add this function to handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL and upload file
      const postUrl = await generateUploadUrlMutation();
      const uploadResult = await fetch(postUrl, { method: "POST", body: file });
      const jsonResult = await uploadResult.json();
      const storageId = jsonResult.storageId as Id<"_storage">;

      // 2. Process resume through API
      const resumeProcessingResponse = await fetch("/api/resume-loader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId }),
      });

      if (!resumeProcessingResponse.ok) {
        throw new Error("Failed to process resume");
      }

      const { resumeText, extractedSkills, fileUrl } = await resumeProcessingResponse.json();

      // 3. Update profile with new resume data
      await updateJobSeekerProfile({
        userId: session?.user?.id as Id<"users">,
        fileUrl,
        resumeText,
        extractedSkills,
        resumeIngested: true,
      });

      // 4. Process the resume text for embeddings
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([resumeText]);
      const splitText = docs.map(doc => doc.pageContent);

      // 5. Generate and store embeddings
      await ingestResume({
        splitText,
        userId: session?.user?.id as Id<"users">,
      });

      toast.success("Resume updated successfully!");
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error("Failed to update resume");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to determine badge variant based on application status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary"; // For "Pending", "Under Review", "Interviewing", etc.
    }
  };

  // Show loading state
  if (jobSeekerProfile === undefined) {
    return <div className=" py-8 text-center">Loading profile...</div>;
  }

  // Show message if user is not logged in or not a job seeker
  if (status === 'unauthenticated' || session?.user?.role !== 'job-seeker') {
    return <div className=" py-8 text-center">Access Denied: Only job seekers can view this page.</div>;
  }

  // Show message if job seeker profile not found (might need a flow to create it)
  if (!jobSeekerProfile) {
    return <div className=" py-8 text-center">Job seeker profile not found. Please create your profile.</div>; // TODO: Add link/button to create profile
  }

  // Display profile details
  return (
    <div className=" py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className='flex justify-between items-center'>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Resume</Label>
            <div className="mt-1 flex items-center gap-4">
              {jobSeekerProfile?.fileUrl && (
                <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={isUploading}>
                      <EyeIcon className='h-5 w-5 mr-2' />
                      View Current Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full h-full flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Your Resume</DialogTitle>
                      <DialogDescription>
                        Displaying your uploaded resume.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-hidden">
                      {jobSeekerProfile?.fileUrl ? (
                        <iframe
                          src={jobSeekerProfile?.fileUrl}
                          width="100%"
                          height="100%"
                          className="border rounded-md"
                          title="Resume PDF"
                        >
                          Your browser does not support iframes. Please download the PDF to view it.
                        </iframe>
                      ) : jobSeekerProfile?.fileUrl === "skip" ? (
                        <div className="text-center text-muted-foreground">Resume URL not available.</div>
                      ) : (
                        <div className="text-center text-muted-foreground">Loading resume...</div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      {jobSeekerProfile?.fileUrl ? "Update Resume" : "Upload Resume"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <BlurFade delay={0.1} duration={0.5} inView={true}>
            <div className="grid gap-4">
              <Label>Name</Label>
              <div className="flex items-center gap-2 text-md font-medium"><User className="h-5 w-5 text-primary" /> {session?.user?.name || ''}</div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} duration={0.5} inView={true}>
            <div className="grid gap-4">
              <Label>Email</Label>
              <div className="flex items-center gap-2 text-md font-medium"><Mail className="h-5 w-5 text-primary" /> {session?.user?.email || ''}</div>
            </div>
          </BlurFade>

          <div>
            <Label htmlFor="profileTitle">Title</Label>
            <div id="profileTitle" className="mt-1 p-2 border rounded-md bg-muted/40 text-sm break-words">{jobSeekerProfile?.title || 'N/A'}</div>
          </div>
          <div>
            <Label htmlFor="profileSummary">Summary</Label>
            <div id="profileSummary" className="mt-1 p-2 border rounded-md bg-muted/40 text-sm break-words whitespace-pre-wrap">{jobSeekerProfile?.summary || 'N/A'}</div>
          </div>
          <div>
            <Label>Skills</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {jobSeekerProfile?.extractedSkills && jobSeekerProfile.extractedSkills.length > 0 ? (
                jobSeekerProfile.extractedSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary"><ListChecks className="h-4 w-4 mr-1" />{skill}</Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No skills extracted yet.</span>
              )}
            </div>
          </div>
          {jobSeekerProfile?.attitudeQuizResults && (
            <div>
              <Label>Attitude Assessment Results</Label>
              <div className="mt-1 p-2 border rounded-md bg-muted/40 text-sm space-y-2">
                <p><strong>Work Style:</strong> {jobSeekerProfile.attitudeQuizResults.workStyle}</p>
                <p><strong>Problem Solving:</strong> {jobSeekerProfile.attitudeQuizResults.problemSolving}</p>
                <p><strong>Team Dynamics:</strong> {jobSeekerProfile.attitudeQuizResults.teamDynamics}</p>
                {jobSeekerProfile.attitudeQuizResults.workEnvironment && (
                  <p><strong>Work Environment:</strong> {jobSeekerProfile.attitudeQuizResults.workEnvironment}</p>
                )}
              </div>
            </div>
          )}

          {jobSeekerProfile.resumeIngested && (
            <BlurFade delay={0.3} duration={0.3} inView={true}>
              <div className="grid gap-4">
                <Label>Resume Status</Label>
                <div className="flex items-center gap-2 text-md font-medium">
                  <Badge variant="default">
                    Resume Ingested
                  </Badge>
                  <span className="text-sm text-muted-foreground">Your resume has been successfully processed for AI matching.</span>
                </div>
              </div>
            </BlurFade>
          )}

          {applications && applications.length > 0 && (
            <BlurFade delay={0.4} duration={0.3} inView={true}>
              <div>
                <h3 className="text-xl font-semibold mb-3">Your Applications</h3>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app._id} className="p-4 flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-lg">{app.jobPost?.title} at {app.jobPost?.company}</p>
                        <div className="text-sm text-muted-foreground">Status: <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge></div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Applied on: {new Date(app._creationTime).toLocaleDateString()}</div>
                      </div>
                      <Link href={`/dashboard/job-seeker/applications/${app._id}`} passHref>
                        <Button variant="outline">
                          View Application
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            </BlurFade>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default JobSeekerProfilePage; 