"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Briefcase, User2 } from "lucide-react";
import SwipeCard from "@/components/dashboard/swipe-card";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app this would come from the backend
const mockJobs = [
  {
    id: "job1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    salary: "$120k - $150k",
    skills: ["React", "TypeScript", "GraphQL"],
    matchPercentage: 94,
    description: "We're looking for a senior frontend developer to join our team. You'll be responsible for building and maintaining our web applications."
  },
  {
    id: "job2",
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "New York, NY",
    salary: "$90k - $120k",
    skills: ["Figma", "User Research", "UI Design"],
    matchPercentage: 91,
    description: "Join our creative team to design beautiful and functional user interfaces for our clients."
  },
  {
    id: "job3",
    title: "Machine Learning Engineer",
    company: "AI Solutions",
    location: "San Francisco, CA",
    salary: "$130k - $160k",
    skills: ["Python", "TensorFlow", "PyTorch"],
    matchPercentage: 89,
    description: "Help us build the next generation of AI-powered products that will change the world."
  },
];

const mockCandidates = [
  {
    id: "cand1",
    name: "Alex Chen",
    title: "Full Stack Developer",
    experience: "5 years",
    education: "M.S. Computer Science",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    matchPercentage: 92,
    summary: "Experienced full stack developer with a passion for building scalable web applications.",
  },
  {
    id: "cand2",
    name: "Sarah Johnson",
    title: "UX Designer",
    experience: "4 years",
    education: "B.A. Design",
    skills: ["Figma", "User Research", "UI Design", "Prototyping"],
    matchPercentage: 88,
    summary: "Creative UX designer with a user-centered approach and a portfolio of successful projects.",
  },
  {
    id: "cand3",
    name: "Michael Park",
    title: "Data Scientist",
    experience: "6 years",
    education: "Ph.D. Statistics",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
    matchPercentage: 95,
    summary: "Data scientist with expertise in machine learning and statistical analysis.",
  },
];

export default function Dashboard() {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  
  const { toast } = useToast();

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // Like
      const item = mockJobs[currentJobIndex];
      const itemId = item.id;
      
      if (!matches.includes(itemId)) {
        setMatches([...matches, itemId]);
        
        // Show match notification with randomized "mutual" matches
        if (Math.random() > 0.7) {
          toast({
            title: "New Match!",
            description: `You matched with ${mockJobs[currentJobIndex].company}!`, 
            duration: 5000,
          });
        }
      }
    }
    
    // Move to next item
      setCurrentJobIndex((currentJobIndex + 1) % mockJobs.length);
  };

  return (
    <div className="container py-8">
      <Tabs defaultValue="swipe" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="swipe">
            Swipe
          </TabsTrigger>
          <TabsTrigger value="manage">
            My Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="swipe" className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Find Jobs
            </h1>
          </div>
          
          <div className="mb-8">
              <SwipeCard
                type="job"
                data={mockJobs[currentJobIndex]}
                onSwipe={handleSwipe}
              />
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-14 w-14 rounded-full border-2"
              onClick={() => handleSwipe("left")}
            >
              <ThumbsDown className="h-6 w-6" />
            </Button>
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full"
              onClick={() => handleSwipe("right")}
            >
              <ThumbsUp className="h-6 w-6" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="manage">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">My Profile</h1>
              
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center justify-center bg-muted rounded-full h-24 w-24 text-4xl font-medium text-muted-foreground">
                      <User2 className="h-12 w-12" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">Alex Chen</h2>
                      <p className="text-muted-foreground">Full Stack Developer</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                        <Badge variant="secondary">AWS</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-6 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Resume</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your resume is visible to recruiters when you match.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                        </div>
                        <div>
                          <p className="font-medium">Alex_Chen_Resume.pdf</p>
                          <p className="text-xs text-muted-foreground">Uploaded 30 days ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Attitude Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <p className="font-medium">Work Style</p>
                        <p className="text-sm text-muted-foreground">Values autonomy with some structure</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="font-medium">Problem Solving</p>
                        <p className="text-sm text-muted-foreground">Innovative solution-finder</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="font-medium">Team Dynamics</p>
                        <p className="text-sm text-muted-foreground">Collaborative with independent streaks</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="font-medium">Work Environment</p>
                        <p className="text-sm text-muted-foreground">Prefers flexible, goal-oriented culture</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}