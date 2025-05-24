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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EyeIcon } from 'lucide-react';

function JobSeekerProfilePage() {
  const { user, isLoggedIn } = useAuthStore();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Fetch job seeker profile
  const jobSeekerProfile = useQuery(
    api.profiles.getJobSeekerProfile,
    user?.role === 'job-seeker' && user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );


  // Show loading state
  if (jobSeekerProfile === undefined) {
    return <div className="container py-8 text-center">Loading profile...</div>;
  }

  // Show message if user is not logged in or not a job seeker
  if (!isLoggedIn || user?.role !== 'job-seeker') {
    return <div className="container py-8 text-center">Access Denied: Only job seekers can view this page.</div>;
  }

  // Show message if job seeker profile not found (might need a flow to create it)
  if (!jobSeekerProfile) {
    return <div className="container py-8 text-center">Job seeker profile not found. Please create your profile.</div>; // TODO: Add link/button to create profile
  }

  // Display profile details
  return (
    <div className="container py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className='flex justify-between items-center'>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        {jobSeekerProfile?.fileUrl && (
            <div>
              <Label>Resume</Label>
              <div className="mt-1">
                <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={jobSeekerProfile?.fileUrl === undefined}>
                      {jobSeekerProfile?.fileUrl === undefined ? "Loading Resume..." : "View Resume"}
                      <EyeIcon className='h-5 w-5 ml-1'/>
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
              </div>
            </div>
          )}
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
    </div>
  );
}

export default JobSeekerProfilePage; 