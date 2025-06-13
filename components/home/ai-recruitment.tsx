import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { User, Shield, FileText, Bot, MessageCircle, Target, CheckCircle, Clock } from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; size?: "sm" | "md" | "lg" }
>(({ className, children, size = "md" }, ref) => {
  const sizeClasses = {
    sm: "size-10",
    md: "size-12", 
    lg: "size-16"
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center rounded-full border-2 bg-white dark:bg-gray-800 p-2 shadow-lg",
        "backdrop-blur-sm",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AIRecruitmentFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // References for all nodes
  const userRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const jobSeekerAuthRef = useRef<HTMLDivElement>(null);
  const recruiterAuthRef = useRef<HTMLDivElement>(null);
  const jobSeekerProfileRef = useRef<HTMLDivElement>(null);
  const recruiterProfileRef = useRef<HTMLDivElement>(null);
  const jobApplicationRef = useRef<HTMLDivElement>(null);
  const postJobRef = useRef<HTMLDivElement>(null);
  const resumeAIRef = useRef<HTMLDivElement>(null);
  const jobAIRef = useRef<HTMLDivElement>(null);
  const resumeEmbeddingsRef = useRef<HTMLDivElement>(null);
  const jobEmbeddingsRef = useRef<HTMLDivElement>(null);
  const semanticMatchingRef = useRef<HTMLDivElement>(null);
  const matchedCandidatesRef = useRef<HTMLDivElement>(null);
  const recruiterReviewRef = useRef<HTMLDivElement>(null);
  const statusReplyRef = useRef<HTMLDivElement>(null);
  const realTimeChatRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI-Powered Recruitment Platform</h2>
        <p className="text-gray-600 dark:text-gray-300">Real-time matching and communication between job seekers and recruiters</p>
      </div>
      
      <div
        className="relative flex h-[1200px] w-full items-start justify-center overflow-hidden"
        ref={containerRef}
      >
        {/* Row 1: User Entry - Y: 20px */}
        <div className="absolute" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={userRef} className="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm min-w-16">
              User
            </span>
          </div>
        </div>

        {/* Row 2: Authentication - Y: 120px */}
        <div className="absolute" style={{ top: '120px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={authRef} className="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Authentication
            </span>
          </div>
        </div>

        {/* Row 3: Auth Branches - Y: 220px */}
        <div className="absolute" style={{ top: '220px', left: '20%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={jobSeekerAuthRef} className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600">
              <User className="w-5 h-5 text-green-600 dark:text-green-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Job Seeker Auth
            </span>
          </div>
        </div>
        <div className="absolute" style={{ top: '220px', left: '80%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={recruiterAuthRef} className="bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Recruiter Auth
            </span>
          </div>
        </div>

        {/* Row 4: Profiles - Y: 340px */}
        <div className="absolute" style={{ top: '340px', left: '20%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={jobSeekerProfileRef} className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Job Seeker Profile
            </span>
          </div>
        </div>
        <div className="absolute" style={{ top: '340px', left: '80%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={recruiterProfileRef} className="bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Recruiter Profile
            </span>
          </div>
        </div>

        {/* Row 5: Actions - Y: 460px */}
        <div className="absolute" style={{ top: '460px', left: '20%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={jobApplicationRef} className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Real-time Apply
            </span>
          </div>
        </div>
        <div className="absolute" style={{ top: '460px', left: '80%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={postJobRef} className="bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Post Job
            </span>
          </div>
        </div>

        {/* Row 6: AI Analysis - Y: 580px */}
        <div className="absolute" style={{ top: '580px', left: '20%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={resumeAIRef} className="bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-600">
              <Bot className="w-5 h-5 text-red-600 dark:text-red-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              AI Resume Processing
            </span>
          </div>
        </div>
        <div className="absolute" style={{ top: '580px', left: '80%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={jobAIRef} className="bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-600">
              <Bot className="w-5 h-5 text-red-600 dark:text-red-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              AI Job Processing
            </span>
          </div>
        </div>

        {/* Row 7: Embeddings - Y: 700px */}
        <div className="absolute" style={{ top: '700px', left: '25%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={resumeEmbeddingsRef} size="sm" className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-600">
              <div className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded"></div>
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Resume Embeddings
            </span>
          </div>
        </div>
        <div className="absolute" style={{ top: '700px', left: '75%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={jobEmbeddingsRef} size="sm" className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-600">
              <div className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded"></div>
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Job Embeddings
            </span>
          </div>
        </div>

        {/* Row 8: Semantic Matching - Y: 820px */}
        <div className="absolute" style={{ top: '820px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={semanticMatchingRef} size="lg" className="bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-600">
              <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Semantic Matching
            </span>
          </div>
        </div>

        {/* Row 9: Matched Candidates - Y: 940px */}
        <div className="absolute" style={{ top: '940px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={matchedCandidatesRef} className="bg-teal-100 dark:bg-teal-900 border-teal-300 dark:border-teal-600">
              <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Matched Candidates
            </span>
          </div>
        </div>

        {/* Bottom Row: Final Actions */}
        <div className="absolute" style={{ top: '1060px', left: '15%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={recruiterReviewRef} className="bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-600">
              <Target className="w-5 h-5 text-pink-600 dark:text-pink-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Recruiter Review
            </span>
          </div>
        </div>
        
        <div className="absolute" style={{ top: '1060px', left: '40%' }}>
          <div className="flex flex-col items-center">
            <Circle ref={statusReplyRef} size="sm" className="bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-600">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Status Reply
            </span>
          </div>
        </div>

        <div className="absolute" style={{ top: '1060px', left: '85%', transform: 'translateX(-100%)' }}>
          <div className="flex flex-col items-center">
            <Circle ref={realTimeChatRef} className="bg-cyan-100 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-600">
              <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
            </Circle>
            <span className="text-xs font-medium mt-3 text-center text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
              Real-Time Chat
            </span>
          </div>
        </div>

        {/* Animated Beams - Main Flow */}
        <AnimatedBeam containerRef={containerRef} fromRef={userRef} toRef={authRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={authRef} toRef={jobSeekerAuthRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={authRef} toRef={recruiterAuthRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={jobSeekerAuthRef} toRef={jobSeekerProfileRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={recruiterAuthRef} toRef={recruiterProfileRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={jobSeekerProfileRef} toRef={jobApplicationRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={recruiterProfileRef} toRef={postJobRef} />
        
        {/* AI Processing Beams */}
        <AnimatedBeam containerRef={containerRef} fromRef={jobApplicationRef} toRef={resumeAIRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={postJobRef} toRef={jobAIRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={resumeAIRef} toRef={resumeEmbeddingsRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={jobAIRef} toRef={jobEmbeddingsRef} />
        
        {/* Semantic Matching Beams */}
        <AnimatedBeam containerRef={containerRef} fromRef={resumeEmbeddingsRef} toRef={semanticMatchingRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={jobEmbeddingsRef} toRef={semanticMatchingRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={semanticMatchingRef} toRef={matchedCandidatesRef} />
        
        {/* Final Actions Beams */}
        <AnimatedBeam containerRef={containerRef} fromRef={matchedCandidatesRef} toRef={recruiterReviewRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={matchedCandidatesRef} toRef={realTimeChatRef} />
        <AnimatedBeam containerRef={containerRef} fromRef={recruiterReviewRef} toRef={statusReplyRef} />
      </div>
      
      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <div className="w-4 h-4 bg-blue-200 dark:bg-blue-700 rounded-full border border-blue-300 dark:border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">User Interface</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <div className="w-4 h-4 bg-red-200 dark:bg-red-700 rounded-full border border-red-300 dark:border-red-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">AI Processing</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <div className="w-4 h-4 bg-orange-200 dark:bg-orange-700 rounded-full border border-orange-300 dark:border-orange-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Data Embeddings</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
          <div className="w-4 h-4 bg-teal-200 dark:bg-teal-700 rounded-full border border-teal-300 dark:border-teal-600"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Matching & Results</span>
        </div>
      </div>
    </div>
  );
}