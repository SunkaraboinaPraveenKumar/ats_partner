"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Briefcase, MapPin, IndianRupee, Calendar, Lightbulb, User, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { BlurFade } from "@/components/magicui/blur-fade";
import React, { useEffect } from 'react';

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.jobId as Id<"jobPosts">;

    const jobPost = useQuery(api.jobs.getJobPostById, { jobId });
    const { user, isLoggedIn } = useAuthStore();
    const createApplication = useMutation(api.applications.createApplication);
    const application = useQuery(api.applications.getApplicationByUserAndJob, {
        userId: user?.userId as Id<"users">,
        jobPostId: jobId,
    });

    const router = useRouter();
    const getOrCreateMatch = useMutation(api.matching.getOrCreateMatch);

    useEffect(() => {
      if (!isLoggedIn) {
        router.push('/login');
      }
    }, [isLoggedIn, router]);

    const handleApply = async () => {
        if (!user?.userId) {
            toast.error("Please log in to apply");
            return;
        }

        try {
            await createApplication({
                userId: user.userId as Id<"users">,
                jobPostId: jobId,
            });
            toast.success("Application submitted successfully!");
        } catch (error: any) {
            if (error?.data?.message?.includes("already exists")) {
                toast.error("You have already applied for this position");
            } else {
                toast.error("Failed to submit application. Please try again.");
            }
        }
    };

    const handleChat = async () => {
        if (!user?.userId) {
            toast.error("Please log in to start a chat.");
            return;
        }

        try {
            const match = await getOrCreateMatch({
                jobPostId: jobId,
                userId: user.userId as Id<"users">,
            });

            const matchId = typeof match === 'string' ? match : match._id;
            router.push(`/messages/${matchId}`);
        } catch (error) {
            console.error('Error getting/creating match:', error);
            toast.error("Failed to start chat. Please try again.");
        }
    };

    if (jobPost === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (jobPost === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-semibold mb-2">Job Post Not Found</h2>
                    <p>The job post you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    const { title, company, location, description, salary, requiredSkills, attitudePreferences, _creationTime } = jobPost;

    return (
        <div className="container mx-auto py-8">
          <BlurFade delay={0.1} duration={0.5} inView={true}>
            <Card className="p-6 shadow-lg rounded-lg">
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold mb-2">
                        <Briefcase className="h-5 w-5 text-primary" /> {title}
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                        {company}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-5 w-5 text-primary" /> {location}
                        </span>
                        {salary && (
                            <span className="flex items-center gap-1">
                                <IndianRupee className="h-5 w-5 text-primary" /> {salary}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="h-5 w-5 text-primary" /> Posted on {new Date(_creationTime).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="absolute top-6 right-6 flex gap-3">
                        {application ? (
                            <Link href={`/dashboard/job-seeker/applications/${application._id}`}>
                                <Button variant="outline">
                                    Already Applied
                                    <ExternalLink className="ml-2 h-5 w-5 text-primary" />
                                </Button>
                            </Link>
                        ) : (
                            <Button 
                              onClick={handleApply}
                              variant="default"
                            >
                                Apply Now
                            </Button>
                        )}
                        <Button
                            onClick={handleChat}
                            variant="outline"
                        >
                            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                            Chat with AI
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <BlurFade delay={0.2} duration={0.5} inView={true}>
                      <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-primary" /> Job Description
                          </h3>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{description}</p>
                      </div>
                    </BlurFade>

                    {requiredSkills && requiredSkills.length > 0 && (
                        <BlurFade delay={0.3} duration={0.5} inView={true}>
                            <>
                                <Separator className="mb-3"/>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-primary" /> Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {requiredSkills.map((skill: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        </BlurFade>
                    )}

                    {attitudePreferences && attitudePreferences.length > 0 && (
                        <BlurFade delay={0.4} duration={0.5} inView={true}>
                            <>
                                <Separator className="mb-3"/>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" /> Attitude Preferences
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {attitudePreferences.map((pref: string, index: number) => (
                                            <Badge key={index} variant="outline">
                                                {pref}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        </BlurFade>
                    )}
                </CardContent>
            </Card>
          </BlurFade>
        </div>
    );
} 