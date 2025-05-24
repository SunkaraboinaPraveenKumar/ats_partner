"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

// Mock data for animation
const jobSeekers = [
  { name: "Alex Chen", title: "Full Stack Developer", skills: ["React", "Node.js", "TypeScript"], matchPercentage: 92 },
  { name: "Sarah Johnson", title: "UX Designer", skills: ["Figma", "User Research", "UI Design"], matchPercentage: 88 },
  { name: "Michael Park", title: "Data Scientist", skills: ["Python", "ML", "TensorFlow"], matchPercentage: 95 },
];

const jobs = [
  { title: "Senior React Developer", company: "TechCorp", location: "Remote", matchPercentage: 94 },
  { title: "UX/UI Designer", company: "DesignHub", location: "New York, NY", matchPercentage: 91 },
  { title: "Machine Learning Engineer", company: "AI Solutions", location: "San Francisco, CA", matchPercentage: 89 },
];

const HeroAnimation = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(true);
  const [showMatched, setShowMatched] = useState(false);
  
  useEffect(() => {
    // Animation cycle
    const intervalId = setInterval(() => {
      if (showMatched) {
        setShowMatched(false);
        setTimeout(() => {
          setIsRecruiter(!isRecruiter);
          setActiveIndex((activeIndex + 1) % 3);
        }, 500);
      } else {
        setShowMatched(true);
      }
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [activeIndex, isRecruiter, showMatched]);
  
  const data = isRecruiter ? jobSeekers : jobs;
  const currentItem = data[activeIndex];
  
  return (
    <div className="relative h-[400px] w-full max-w-[350px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isRecruiter}-${activeIndex}-${showMatched}`}
          initial={{ 
            x: showMatched ? 0 : 20, 
            y: 0, 
            opacity: showMatched ? 1 : 0,
            scale: showMatched ? 1 : 0.9,
          }}
          animate={{ 
            x: showMatched ? 0 : 20, 
            y: 0, 
            opacity: 1,
            scale: 1,
          }}
          exit={{ 
            x: showMatched ? 0 : -300, 
            opacity: 0,
            scale: 0.9,
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="absolute inset-0"
        >
          <Card className="w-full h-full shadow-lg">
            <CardContent className="flex flex-col h-full p-6">
              {isRecruiter ? (
                // Job Seeker Card
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{jobSeekers[activeIndex].name}</h3>
                      <p className="text-muted-foreground">{jobSeekers[activeIndex].title}</p>
                    </div>
                    <Badge variant="outline" className={`text-lg font-bold ${
                      jobSeekers[activeIndex].matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      jobSeekers[activeIndex].matchPercentage >= 80 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {jobSeekers[activeIndex].matchPercentage}%
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {jobSeekers[activeIndex].skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {showMatched && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded-lg"
                    >
                      <div className="text-center text-primary-foreground">
                        <CheckCircle className="mx-auto h-16 w-16 mb-2" />
                        <h3 className="text-2xl font-bold">Perfect Match!</h3>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                // Job Card
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{jobs[activeIndex].title}</h3>
                      <p className="text-muted-foreground">{jobs[activeIndex].company}</p>
                    </div>
                    <Badge variant="outline" className={`text-lg font-bold ${
                      jobs[activeIndex].matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      jobs[activeIndex].matchPercentage >= 80 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {jobs[activeIndex].matchPercentage}%
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm mb-4">{jobs[activeIndex].location}</p>
                  </div>
                  
                  {showMatched && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded-lg"
                    >
                      <div className="text-center text-primary-foreground">
                        <CheckCircle className="mx-auto h-16 w-16 mb-2" />
                        <h3 className="text-2xl font-bold">Perfect Match!</h3>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HeroAnimation;