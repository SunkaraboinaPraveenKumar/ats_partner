"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  MessageSquare, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  GraduationCap,
  CheckCircle,
  Info
} from "lucide-react";

// Mock data - in a real app this would come from the backend
const mockJobMatches = [
  {
    id: "match1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    matchDate: "2023-04-15",
    matchPercentage: 94,
    status: "New Match",
    logo: "TC"
  },
  {
    id: "match2",
    jobTitle: "UX/UI Designer",
    company: "DesignHub",
    location: "New York, NY",
    matchDate: "2023-04-10",
    matchPercentage: 91,
    status: "In Progress",
    logo: "DH"
  },
];

const mockCandidateMatches = [
  {
    id: "cand1",
    name: "Alex Chen",
    title: "Full Stack Developer",
    experience: "5 years",
    education: "M.S. Computer Science",
    matchDate: "2023-04-14",
    matchPercentage: 92,
    status: "New Match",
    jobTitle: "Senior Frontend Developer"
  },
  {
    id: "cand2",
    name: "Sarah Johnson",
    title: "UX Designer",
    experience: "4 years",
    education: "B.A. Design",
    matchDate: "2023-04-08",
    matchPercentage: 88,
    status: "In Progress",
    jobTitle: "UX/UI Designer"
  },
];

export default function Matches() {
  // In a real app, we would detect user type from authentication
  const [userType, setUserType] = useState<"job-seeker" | "recruiter">("job-seeker");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Matches</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="mb-6">
            <p className="text-muted-foreground mb-2">
              These are your mutual matches. Both parties have expressed interest.
            </p>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Info className="h-4 w-4 mr-1" />
              <span>Select a match to view details</span>
            </div>
          </div>

          <div className="space-y-3">
            {(userType === "job-seeker" ? mockJobMatches : mockCandidateMatches).map((match) => (
              <div
                key={match.id}
                className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedMatch === match.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedMatch(match.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  {userType === "job-seeker" ? (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {match.logo}
                      </div>
                      <div>
                        <h3 className="font-medium">{match.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{match.company}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{match.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.title}</p>
                      </div>
                    </div>
                  )}
                  <Badge variant="outline" className={`${
                    match.matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                    {match.matchPercentage}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(match.matchDate)}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {match.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedMatch ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                {userType === "job-seeker" ? (
                  <JobMatchDetails 
                    match={mockJobMatches.find(m => m.id === selectedMatch)!} 
                  />
                ) : (
                  <CandidateMatchDetails 
                    match={mockCandidateMatches.find(m => m.id === selectedMatch)!} 
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg p-12 bg-muted/30">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Select a Match</h2>
                <p className="text-muted-foreground max-w-md">
                  Click on a match from the list to view detailed information and AI-powered match insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface JobMatchDetailsProps {
  match: {
    jobTitle: string;
    company: string;
    location: string;
    matchDate: string;
    matchPercentage: number;
  };
}

const JobMatchDetails: React.FC<JobMatchDetailsProps> = ({ match }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{match.jobTitle}</h2>
          <div className="flex items-center text-muted-foreground">
            <Building2 className="h-4 w-4 mr-1" />
            <span>{match.company}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-lg font-bold mt-2 sm:mt-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {match.matchPercentage}% Match
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{match.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Matched on {new Date(match.matchDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium mb-2">Key Skills Matched</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>React</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Frontend Development</Badge>
            <Badge>UI/UX</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="match-report">
        <TabsList className="w-full">
          <TabsTrigger value="match-report" className="flex-1">AI Match Report</TabsTrigger>
          <TabsTrigger value="job-details" className="flex-1">Job Details</TabsTrigger>
        </TabsList>
        <TabsContent value="match-report" className="p-4 border rounded-lg mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Why You're a Great Match</h3>
              <p className="text-muted-foreground">
                Based on our AI analysis, your expertise in React and TypeScript perfectly aligns with the technical requirements for this role. Your 3+ years of experience with modern frontend frameworks is exactly what {match.company} is looking for in their Senior Frontend Developer position.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Skills Alignment</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">React Proficiency</span>
                    <span className="text-sm text-muted-foreground">95% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">TypeScript Experience</span>
                    <span className="text-sm text-muted-foreground">90% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Frontend Architecture</span>
                    <span className="text-sm text-muted-foreground">85% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Cultural Fit</h3>
              <p className="text-muted-foreground">
                Your preference for a collaborative environment with autonomy to make technical decisions aligns well with {match.company}'s engineering culture. Your approach to problem-solving and focus on user experience also match their team values.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="job-details" className="p-4 border rounded-lg mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Job Description</h3>
              <p className="text-muted-foreground">
                {match.company} is looking for a Senior Frontend Developer to join our growing team. You'll work on building and maintaining our web applications, collaborating with designers, backend developers, and product managers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Requirements</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>3+ years experience with React</li>
                <li>Strong TypeScript skills</li>
                <li>Experience with modern frontend tooling</li>
                <li>Understanding of responsive design and accessibility</li>
                <li>Experience with state management solutions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Benefits</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Competitive salary</li>
                <li>Remote-first work environment</li>
                <li>Flexible working hours</li>
                <li>Health insurance</li>
                <li>Professional development budget</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button variant="outline">View Company Profile</Button>
        <Link href="/messages">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Start Chat
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface CandidateMatchDetailsProps {
  match: {
    name: string;
    title: string;
    experience: string;
    education: string;
    matchDate: string;
    matchPercentage: number;
    jobTitle: string;
  };
}

const CandidateMatchDetails: React.FC<CandidateMatchDetailsProps> = ({ match }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{match.name}</h2>
          <div className="flex items-center text-muted-foreground">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{match.title}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-lg font-bold mt-2 sm:mt-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {match.matchPercentage}% Match
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{match.experience} of experience</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{match.education}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Matched on {new Date(match.matchDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium mb-2">Matched for Position</h3>
          <div className="p-3 border rounded-lg">
            <p className="font-medium">{match.jobTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Posted 14 days ago • 8 matches
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="match-report">
        <TabsList className="w-full">
          <TabsTrigger value="match-report" className="flex-1">AI Match Report</TabsTrigger>
          <TabsTrigger value="candidate-profile" className="flex-1">Candidate Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="match-report" className="p-4 border rounded-lg mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Why They're a Great Match</h3>
              <p className="text-muted-foreground">
                Based on our AI analysis, {match.name}'s expertise in frontend development makes them an excellent candidate for your {match.jobTitle} position. Their experience with React and TypeScript closely matches your requirements, and their portfolio demonstrates strong UI/UX sensibilities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Skills Alignment</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Technical Skills</span>
                    <span className="text-sm text-muted-foreground">92% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Experience Level</span>
                    <span className="text-sm text-muted-foreground">88% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cultural Fit</span>
                    <span className="text-sm text-muted-foreground">95% match</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Potential Interview Focus Areas</h3>
              <div className="space-y-2">
                <div className="p-2 border rounded-lg">
                  <p className="font-medium">Frontend Architecture Experience</p>
                  <p className="text-sm text-muted-foreground">
                    Explore their experience with larger-scale applications and component design.
                  </p>
                </div>
                <div className="p-2 border rounded-lg">
                  <p className="font-medium">Team Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Discuss their experience working with designers and backend developers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="candidate-profile" className="p-4 border rounded-lg mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Professional Summary</h3>
              <p className="text-muted-foreground">
                {match.name} is a {match.title} with {match.experience} of experience building modern web applications. They specialize in React, TypeScript, and responsive design with a focus on creating intuitive user experiences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>React</Badge>
                <Badge>TypeScript</Badge>
                <Badge>NextJS</Badge>
                <Badge>GraphQL</Badge>
                <Badge>CSS/SASS</Badge>
                <Badge>User Experience</Badge>
                <Badge>Frontend Testing</Badge>
                <Badge>Responsive Design</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Work Style</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Collaborative</p>
                  <p className="text-sm text-muted-foreground">
                    Enjoys working in cross-functional teams
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Problem Solver</p>
                  <p className="text-sm text-muted-foreground">
                    Takes initiative to resolve complex issues
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">User-Focused</p>
                  <p className="text-sm text-muted-foreground">
                    Prioritizes usability and experience
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Quality-Driven</p>
                  <p className="text-sm text-muted-foreground">
                    Values testing and code quality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button variant="outline">View Resume</Button>
        <Link href="/messages">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Start Chat
          </Button>
        </Link>
      </div>
    </div>
  );
};