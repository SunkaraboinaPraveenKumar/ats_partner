"use client";

import { useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Briefcase, GraduationCap, Clock, IndianRupee, MessageSquare, ExternalLink } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface SwipeCardProps {
  type: "job" | "candidate";
  data: any;
  onSwipe: (direction: "left" | "right", type: "job" | "candidate") => void;
  blindMode?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ type, data, onSwipe, blindMode = false }) => {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [exitX, setExitX] = useState(0);
  
  const { user } = useAuthStore();
  const createApplication = useMutation(api.applications.createApplication);
  const application = useQuery(api.applications.getApplicationByUserAndJob, {
    userId: user?.userId as Id<"users">,
    jobPostId: data._id,
  });
  
  const router = useRouter();
  
  const getOrCreateMatch = useMutation(api.matching.getOrCreateMatch);

  console.log('Match data:', application);
  
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setSwipeDirection("right");
      setExitX(1000);
      onSwipe("right", type);
    } else if (info.offset.x < -threshold) {
      setSwipeDirection("left");
      setExitX(-1000);
      onSwipe("left", type);
    }
  };
  
  const handleApply = async () => {
    if (!user?.userId) {
      toast.error("Please log in to apply");
      return;
    }

    try {
      await createApplication({
        userId: user.userId as Id<"users">,
        jobPostId: data._id,
      });
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      if (error?.data?.message?.includes("already exists")) {
        toast.error("You have already applied for this position");
      } else {
        toast.error("You have already applied for this position!");
      }
    }
  };
  
  const handleChat = async () => {
    if (!application?._id || !user?.userId) return;
    
    try {
      const match = await getOrCreateMatch({
        jobPostId: data._id,
        userId: user.userId as Id<"users">
      });
      
      const matchId = typeof match === 'string' ? match : match._id;
      router.push(`/messages/${matchId}`);
    } catch (error) {
      console.error('Error getting/creating match:', error);
    }
  };
  
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: swipeDirection ? exitX : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative cursor-grab active:cursor-grabbing"
      onAnimationComplete={() => {
        if (swipeDirection) {
          setSwipeDirection(null);
          setExitX(0);
        }
      }}
    >
      <Card className="w-full h-[500px] overflow-hidden">
        <div 
          className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${
            data.matchPercentage >= 90 
              ? 'from-green-500/20 to-transparent' 
              : data.matchPercentage >= 80 
                ? 'from-amber-500/20 to-transparent' 
                : 'from-blue-500/20 to-transparent'
          }`}
        />
        
        <CardContent className="relative h-full flex flex-col p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1 flex-grow flex-shrink overflow-hidden max-w-[calc(100%-70px)]">
              {type === "job" ? (
                <>
                  <h2 className="text-xl font-bold flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{data.title}</span>
                    <Link href={`/dashboard/job-seeker/jobs/${data._id}`} className="text-primary hover:text-primary/80 flex-shrink-0">
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </h2>
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span>{data.company}</span>
                  </div>
                </>
              ) : (
                <>
                  {blindMode ? (
                    <h2 className="text-xl font-bold">Candidate #{data.id}</h2>
                  ) : (
                    <h2 className="text-xl font-bold">{data.name}</h2>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{data.title}</span>
                  </div>
                </>
              )}
            </div>
            {type === "job" && (
              <Badge variant="outline" className={`text-lg font-bold flex-shrink-0 ${
                (application && application.matchRatio >= 0.9) || (!application && data.matchPercentage >= 90) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                (application && application.matchRatio >= 0.8) || (!application && data.matchPercentage >= 80) ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {application
                  ? Math.round(application.matchRatio * 100)
                  : typeof data.matchPercentage === 'number'
                    ? data.matchPercentage
                    : '--'}%
              </Badge>
            )}
          </div>
          
          {type === "job" ? (
            <div className="space-y-4 mb-4">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{data.location}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{data.salary}</span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {!blindMode && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{data.experience} of experience</span>
                </div>
              )}
              
              {!blindMode && (
                <div className="flex items-center text-sm">
                  <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{data.education}</span>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Summary</h3>
                <p className="text-sm text-muted-foreground line-clamp-4">{data.summary}</p>
              </div>
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex gap-2">
              {application ? (
                <Link href={`/dashboard/job-seeker/applications/${application._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Already Applied
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={handleApply}
                  className="flex-1"
                  variant="default"
                >
                  Apply Now
                </Button>
              )}
              
              {application && !isNaN(application.matchRatio) && (
                <Button
                  onClick={handleChat}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Swipe indicators */}
      <div className={`absolute top-1/2 left-6 -translate-y-1/2 bg-red-500 text-white p-3 rounded-full transition-opacity ${
        swipeDirection === "left" ? "opacity-100" : "opacity-0"
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
      </div>
      
      <div className={`absolute top-1/2 right-6 -translate-y-1/2 bg-green-500 text-white p-3 rounded-full transition-opacity ${
        swipeDirection === "right" ? "opacity-100" : "opacity-0"
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
      </div>
    </motion.div>
  );
};

export default SwipeCard;