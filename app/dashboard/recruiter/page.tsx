"use client"
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Briefcase, User2, Loader2 } from "lucide-react";
import SwipeCard from "@/components/dashboard/swipe-card";
import JobPostingCard from "@/components/dashboard/job-posting-card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateJobPostModal from "@/components/dashboard/create-job-post-modal";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Id } from "@/convex/_generated/dataModel";

export default function RecruiterDashboard() {
  const [isLoading, setIsLoading] = useState(false); // Example loading state for actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const jobPostings = useQuery(
    api.jobs.getRecruiterJobs,
    user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  const handleNewJobPost = () => {
    if (!user) {
      // Should not happen if routed correctly, but defensive check
      toast.error("User not logged in to create job post.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <Button onClick={handleNewJobPost} disabled={isLoading || jobPostings === undefined}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Briefcase className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Creating..." : "New Job Post"}
          </Button>
        </div>

        {jobPostings === undefined ? (
          // Loading state
          <div className="text-center text-muted-foreground">Loading job postings...</div>
        ) : jobPostings.length === 0 ? (
          // Empty state
          <div className="text-center text-muted-foreground space-y-4">
            <p>You haven't posted any jobs yet.</p>
            <Button onClick={handleNewJobPost} disabled={isLoading || jobPostings === undefined}>
              <Briefcase className="mr-2 h-4 w-4" />
              Create First Job Post
            </Button>
          </div>
        ) : (
          // Display job postings
          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <JobPostingCard key={job._id} job={job} />
            ))}
          </div>
        )}

        <CreateJobPostModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
} 