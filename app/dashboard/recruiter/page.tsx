"use client"
import { useState, useEffect } from "react";
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
import { Id } from "@/convex/_generated/dataModel";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function RecruiterDashboard() {
  const [isLoading, setIsLoading] = useState(false); // Example loading state for actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const jobPostings = useQuery(
    api.jobs.getRecruiterJobs,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  const handleNewJobPost = () => {
    if (status === 'unauthenticated' || !session?.user?.id) {
      // Should not happen if routed correctly, but defensive check
      toast.error("User not logged in to create job post.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'recruiter') {
    return <div className="py-8 text-center">Access Denied: Only recruiters can view this page.</div>;
  }

  return (
    <div className=" py-8">
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
              <BlurFade key={job._id} delay={0.2} duration={0.4} inView={true}>
                <JobPostingCard  job={job} />
              </BlurFade>
            ))}
          </div>
        )}

        <CreateJobPostModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
} 