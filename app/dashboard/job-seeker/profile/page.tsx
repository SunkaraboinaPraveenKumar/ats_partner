"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
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
import { ExternalLink, EyeIcon, Loader2, Upload } from 'lucide-react';
import { useMutation } from "convex/react";
import { useAction } from "convex/react";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { toast } from "sonner";
import { generateUploadUrl } from '@/convex/files';
import Link from 'next/link';

function JobSeekerProfilePage() {
  const { user, isLoggedIn } = useAuthStore();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch job seeker profile
  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    user?.role === 'job-seeker' && user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  // Add this query
  const applications = useQuery(
    api.applications.getApplicationsByUser,
    user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  // Add these mutations and actions
  const updateJobSeekerProfile = useMutation(api.profiles.updateJobSeekerProfile);
  const ingestResume = useAction(api.action.ingest);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Add this function to handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL and upload file
      const postUrl = await generateUploadUrl();
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
        userId: user?.userId as Id<"users">,
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
        userId: user?.userId as Id<"users">,
      });

      toast.success("Resume updated successfully!");
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error("Failed to update resume");
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state
  if (jobSeekerProfile === undefined) {
    return <div className=" py-8 text-center">Loading profile...</div>;
  }

  // Show message if user is not logged in or not a job seeker
  if (!isLoggedIn || user?.role !== 'job-seeker') {
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
          <div>
            <Label htmlFor="profileTitle">Title</Label>
            <div id="profileTitle" className="mt-1 p-2 border rounded-md bg-muted/40 text-sm break-words">{jobSeekerProfile.title}</div>
          </div>
          <div>
            <Label htmlFor="profileSummary">Summary</Label>
            <div id="profileSummary" className="mt-1 p-2 border rounded-md bg-muted/40 text-sm break-words whitespace-pre-wrap">{jobSeekerProfile.summary}</div>
          </div>
          <div>
            <Label>Skills</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {jobSeekerProfile.extractedSkills && jobSeekerProfile.extractedSkills.length > 0 ? (
                jobSeekerProfile.extractedSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No skills extracted yet.</span>
              )}
            </div>
          </div>
          {/* Display Attitude Quiz Results */}
          {jobSeekerProfile.attitudeQuizResults && (
            <div>
              <Label>Attitude Assessment Results</Label>
              <div className="mt-1 p-2 border rounded-md bg-muted/40 text-sm space-y-2">
                <p><strong>Work Style:</strong> {jobSeekerProfile.attitudeQuizResults.workStyle}</p>
                <p><strong>Problem Solving:</strong> {jobSeekerProfile.attitudeQuizResults.problemSolving}</p>
                <p><strong>Team Dynamics:</strong> {jobSeekerProfile.attitudeQuizResults.teamDynamics}</p>
                {/* Ensure workEnvironment is displayed if it exists */}
                {jobSeekerProfile.attitudeQuizResults.workEnvironment && (
                  <p><strong>Work Environment:</strong> {jobSeekerProfile.attitudeQuizResults.workEnvironment}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="max-w-3xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications?.length === 0 ? (
            <p className="text-center text-muted-foreground">No applications yet</p>
          ) : (
            applications?.map((app) => (
              <Card key={app._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex gap-2 items-center justify-start">
                      {app.jobPost?.title}
                      <Link href={`/dashboard/job-seeker/applications/${app._id}`}>
                        <ExternalLink className='h-4 w-4 text-primary' />
                      </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {app.jobPost?.company} - {app.jobPost?.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      app.status === "accepted" ? "default" :
                        app.status === "rejected" ? "destructive" :
                          "outline"
                    }>
                      {app.status}
                    </Badge>
                    <Badge variant="secondary">
                      Match: {Math.round(app.matchRatio * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default JobSeekerProfilePage; 