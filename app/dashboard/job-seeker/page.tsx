"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import SwipeCard from "@/components/dashboard/swipe-card";
import { Id } from '@/convex/_generated/dataModel';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  X,
  SlidersHorizontal,
  Building2,
  CheckCircle,
  Clock,
  RotateCcw,
  FileText
} from "lucide-react";
import { useRouter } from 'next/navigation';

// Salary ranges for filtering
const SALARY_RANGES = [
  { label: "Any Salary", value: "any" },
  { label: "₹0 - ₹3 LPA", value: "0-300000" },
  { label: "₹3 - ₹6 LPA", value: "300000-600000" },
  { label: "₹6 - ₹10 LPA", value: "600000-1000000" },
  { label: "₹10 - ₹15 LPA", value: "1000000-1500000" },
  { label: "₹15 - ₹25 LPA", value: "1500000-2500000" },
  { label: "₹25+ LPA", value: "2500000-999999999" }
];

// Application status options
const APPLICATION_STATUS = [
  { label: "All Jobs", value: "all" },
  { label: "Not Applied", value: "not-applied" },
  { label: "Already Applied", value: "applied" }
];

interface FilterState {
  search: string;
  salaryRange: string;
  selectedSkills: string[];
  location: string;
  applicationStatus: string;
  company: string;
}

function JobSeekerDashboardPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    salaryRange: 'any',
    selectedSkills: [],
    location: '',
    applicationStatus: 'all',
    company: ''
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch data
  const jobPosts = useQuery(api.jobs.getJobPosts, { status: "active" });
  const jobSeekerProfile = useQuery(api.profiles.getJobSeekerProfile, 
    user ? { userId: user.userId as Id<"users"> } : "skip"
  );
  const applications = useQuery(api.applications.getApplicationsByUser, 
    user ? { userId: user.userId as Id<"users"> } : "skip"
  );

  // Actions and mutations
  const ingestResume = useAction(api.action.ingest);
  const updateJobSeekerProfile = useMutation(api.profiles.updateJobSeekerProfile);

  // Extract unique values for filter options
  const { uniqueSkills, uniqueLocations, uniqueCompanies } = useMemo(() => {
    if (!jobPosts) return { uniqueSkills: [], uniqueLocations: [], uniqueCompanies: [] };
    
    const skills = new Set<string>();
    const locations = new Set<string>();
    const companies = new Set<string>();
    
    jobPosts.forEach(job => {
      job.requiredSkills?.forEach((skill: string) => skills.add(skill));
      if (job.location) locations.add(job.location);
      if (job.company) companies.add(job.company);
    });
    
    return {
      uniqueSkills: Array.from(skills).sort(),
      uniqueLocations: Array.from(locations).sort(),
      uniqueCompanies: Array.from(companies).sort()
    };
  }, [jobPosts]);

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    if (!jobPosts) return [];
    
    const appliedJobIds = new Set(applications?.map(app => app.jobPostId) || []);
    
    return jobPosts.filter(job => {
      // Search filter (job title or company)
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(searchLower);
        const companyMatch = job.company?.toLowerCase().includes(searchLower);
        if (!titleMatch && !companyMatch) return false;
      }
      
      // Company filter
      if (filters.company && filters.company.trim() && job.company !== filters.company) {
        return false;
      }
      
      // Location filter
      if (filters.location && filters.location.trim() && job.location !== filters.location) {
        return false;
      }
      
      // Salary range filter
      if (filters.salaryRange !== 'any') {
        const [min, max] = filters.salaryRange.split('-').map(Number);
        const jobSalary = Number(job?.salary);
        
        // Handle "25+ LPA" case
        if (filters.salaryRange === '2500000-999999999') {
          if (jobSalary < 2500000) return false;
        } else {
          if (jobSalary < min || jobSalary > max) return false;
        }
      }
      
      // Skills filter
      if (filters.selectedSkills && filters.selectedSkills.length > 0) {
        const jobSkills = job.requiredSkills || [];
        const hasMatchingSkill = filters.selectedSkills.some(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().trim() === skill.toLowerCase().trim()
          )
        );
        if (!hasMatchingSkill) return false;
      }
      
      // Application status filter
      if (filters.applicationStatus === 'applied' && !appliedJobIds.has(job._id)) {
        return false;
      }
      if (filters.applicationStatus === 'not-applied' && appliedJobIds.has(job._id)) {
        return false;
      }
      
      return true;
    });
  }, [jobPosts, applications, filters]);

  // Resume ingestion effect (keeping existing logic)
  useEffect(() => {
    if (jobSeekerProfile && jobSeekerProfile.resumeText && !jobSeekerProfile.resumeIngested) {
      console.log("Attempting to ingest resume embeddings...");
      
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      splitter.createDocuments([jobSeekerProfile.resumeText])
        .then(docs => {
          const splitText = docs.map(doc => doc.pageContent);
          if (splitText.length > 0 && user?.userId) {
            ingestResume({
              splitText: splitText,
              userId: user.userId as Id<"users">,
            })
            .then(() => {
              console.log("Resume ingestion action triggered successfully.");
              updateJobSeekerProfile({
                userId: user.userId as Id<"users">,
                resumeIngested: true,
              }).catch(error => {
                console.error("Failed to update resumeIngested flag:", error);
              });
            })
            .catch(error => {
              console.error("Failed to trigger resume ingestion action:", error);
              toast.error("Failed to process resume embeddings.");
            });
          }
        })
        .catch(error => {
          console.error("Error splitting resume text:", error);
          toast.error("Failed to split resume text for processing.");
        });
    }
  }, [jobSeekerProfile, user?.userId, ingestResume, updateJobSeekerProfile]);

  // Handle filter updates
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      salaryRange: 'any',
      selectedSkills: [],
      location: '',
      applicationStatus: 'all',
      company: ''
    });
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(s => s !== skill)
    }));
  };

  // Loading and access control
  if (jobPosts === undefined) {
    return (
      <div className=" py-8 text-center">
        <div className="animate-pulse">Loading job posts...</div>
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== 'job-seeker') {
    return (
      <div className=" py-8 text-center">
        <div className="text-lg text-muted-foreground">
          Access Denied: Only job seekers can view this page.
        </div>
      </div>
    );
  }

  const activeFiltersCount = [
    filters.search,
    filters.company,
    filters.location,
    filters.salaryRange !== 'any' ? filters.salaryRange : '',
    filters.applicationStatus !== 'all' ? filters.applicationStatus : '',
    ...filters.selectedSkills
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className=" mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Available Job Opportunities
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discover your next career opportunity with {filteredJobs.length} matching positions
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/job-seeker/recommended')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Recommendations
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 border-0 shadow-sm bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs or companies..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <Select value={filters.applicationStatus} onValueChange={(value) => updateFilter('applicationStatus', value)}>
                  <SelectTrigger className="w-[140px] bg-white dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.salaryRange} onValueChange={(value) => updateFilter('salaryRange', value)}>
                  <SelectTrigger className="w-[130px] bg-white dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Advanced Filters Sheet */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="relative bg-white dark:bg-slate-700">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 h-5 w-5 p-1.5 text-xs rounded-full bg-blue-500">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between">
                        Advanced Filters
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      </SheetTitle>
                      <SheetDescription>
                        Refine your job search with detailed filtering options
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 mt-6">
                      {/* Company Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          <Building2 className="h-4 w-4 inline mr-2" />
                          Company
                        </Label>
                        <Select value={filters.company || ""} onValueChange={(value) => updateFilter('company', value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {uniqueCompanies.map(company => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Location Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          <MapPin className="h-4 w-4 inline mr-2" />
                          Location
                        </Label>
                        <Select value={filters.location || ""} onValueChange={(value) => updateFilter('location', value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {uniqueLocations.map(location => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Skills Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          <Briefcase className="h-4 w-4 inline mr-2" />
                          Required Skills
                        </Label>
                        
                        {/* Selected Skills */}
                        {filters.selectedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {filters.selectedSkills.map(skill => (
                              <Badge 
                                key={skill} 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                                onClick={() => removeSkill(skill)}
                              >
                                {skill}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Skills Checklist */}
                        <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-slate-50 dark:bg-slate-800">
                          <div className="space-y-2">
                            {uniqueSkills.map(skill => (
                              <div key={skill} className="flex items-center space-x-2">
                                <Checkbox
                                  id={skill}
                                  checked={filters.selectedSkills.includes(skill)}
                                  onCheckedChange={() => toggleSkill(skill)}
                                />
                                <Label htmlFor={skill} className="text-sm cursor-pointer">
                                  {skill}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Active filters:</span>
                  {filters.search && (
                    <Badge variant="outline" className="gap-1">
                      Search: {filters.search}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('search', '')} />
                    </Badge>
                  )}
                  {filters.company && (
                    <Badge variant="outline" className="gap-1">
                      Company: {filters.company}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('company', '')} />
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="outline" className="gap-1">
                      Location: {filters.location}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('location', '')} />
                    </Badge>
                  )}
                  {filters.salaryRange !== 'any' && (
                    <Badge variant="outline" className="gap-1">
                      Salary: {SALARY_RANGES.find(r => r.value === filters.salaryRange)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('salaryRange', 'any')} />
                    </Badge>
                  )}
                  {filters.applicationStatus !== 'all' && (
                    <Badge variant="outline" className="gap-1">
                      Status: {APPLICATION_STATUS.find(s => s.value === filters.applicationStatus)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('applicationStatus', 'all')} />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {filteredJobs.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No jobs match your criteria
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Try adjusting your filters to see more opportunities
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id}>
                <SwipeCard
                  type="job"
                  data={{
                    ...job,
                    skills: job.requiredSkills,
                  }}
                  onSwipe={() => {}} // No swipe needed, can be a no-op
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSeekerDashboardPage;