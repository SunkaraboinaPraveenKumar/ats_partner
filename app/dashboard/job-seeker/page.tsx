"use client";

import React, { useEffect } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/authStore'; // Assuming we might need user info later
import SwipeCard from "@/components/dashboard/swipe-card";
import { Id } from '@/convex/_generated/dataModel'; // Import Id
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { toast } from "sonner"; // Assuming you have sonner toasts set up
// Removed UI components for displaying profile
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";

function JobSeekerDashboardPage() {
  const { user, isLoggedIn } = useAuthStore(); // Get user from store

  // Fetch active job posts (adjust query arguments as needed)
  const jobPosts = useQuery(api.jobs.getJobPosts, { status: "active" });

  // Fetch the current user's job seeker profile
  // Assuming you have a query like `profiles.getJobSeekerProfileByUserId`
  // that fetches the profile based on the authenticated user's ID.
  const jobSeekerProfile = useQuery(api.profiles.getJobSeekerProfile, user ? { userId: user.userId as Id<"users"> } : "skip");

  // Get the ingest action
  const ingestResume = useAction(api.action.ingest);

  // Effect to trigger resume ingestion when the profile and resumeText are available
  useEffect(() => {
    if (jobSeekerProfile && jobSeekerProfile.resumeText) {
      // TODO: Add a check here to see if embeddings have already been ingested
      // For now, we'll trigger ingestion if resumeText exists

      console.log("Attempting to ingest resume embeddings...");

      // Split the resume text into chunks
      const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000, // Adjust chunk size as needed
          chunkOverlap: 200, // Adjust chunk overlap as needed
      });

      splitter.createDocuments([jobSeekerProfile.resumeText])
          .then(docs => {
              const splitText = docs.map(doc => doc.pageContent);
               if (splitText.length > 0 && user?.userId) {
                 // Call the ingest action
                 ingestResume({
                     splitText: splitText,
                     userId: user.userId as Id<"users">, // Pass the user's Convex ID
                 })
                 .then(() => {
                     console.log("Resume ingestion action triggered successfully.");
                     // TODO: Set a flag on the profile here to indicate ingestion is complete
                 })
                 .catch(error => {
                     console.error("Failed to trigger resume ingestion action:", error);
                     toast.error("Failed to process resume embeddings.");
                 });
               } else {
                    console.warn("No text chunks to ingest or user ID not available.");
               }
          })
          .catch(error => {
              console.error("Error splitting resume text:", error);
              toast.error("Failed to split resume text for processing.");
          });
    }
  }, [jobSeekerProfile, user?.userId, ingestResume]); // Rerun effect if profile, user ID, or ingestResume changes

  // Show loading state for job posts only
  if (jobPosts === undefined) {
    return <div className="container py-8 text-center">Loading job posts...</div>;
  }

  // Show message if user is not logged in or not a job seeker
  if (!isLoggedIn || user?.role !== 'job-seeker') {
     return <div className="container py-8 text-center">Access Denied: Only job seekers can view this page.</div>;
  }

  if (jobPosts.length === 0) {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold mb-6">Available Job Posts</h1>
        <div className="text-center text-muted-foreground">No active job posts found at the moment.</div>
      </div>
    );
  }

  // Basic onSwipe handler (will need to be implemented with mutations later)
  const handleSwipe = (direction: "left" | "right", type: "job" | "candidate") => {
    console.log(`Swiped ${type} to the ${direction}`);
    // TODO: Implement mutation calls for liking/disliking jobs
  };

  // Display job posts using SwipeCard
  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-3">Available Job Posts</h1>
      <div className="flex justify-center items-center min-h-[600px]">
        {/* Assuming you want to swipe through jobs one by one */}
        {/* This is a basic implementation, you'd likely manage which card is visible */}
        {/* For now, rendering all in a stack - may need adjustment based on SwipeCard usage pattern */}
        {jobPosts.map((job) => (
          <SwipeCard 
            key={job._id}
            type="job" // Specify type as 'job'
            data={{ 
              // Map job data to SwipeCard's expected job data structure
              ...job,
              skills: job.requiredSkills, // Map requiredSkills to skills
              // Add a placeholder/dummy match percentage for now
              matchPercentage: 75, // Replace with actual match logic later
            }}
            onSwipe={handleSwipe}
            // blindMode is not typically used for jobs
          />
        ))}
      </div>
    </div>
  );
}

export default JobSeekerDashboardPage; 