"use client"

import React from 'react'
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function RecruiterProfilePage() {
  const { user, isLoggedIn } = useAuthStore();

  // Fetch recruiter profile, skip if user is not logged in or not a recruiter
  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    user?.role === 'recruiter' && user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  // Show loading state
  if (recruiterProfile === undefined) {
    return <div className="container py-8 text-center">Loading profile...</div>;
  }

  // Show message if user is not a recruiter or profile not found
  if (!isLoggedIn || user?.role !== 'recruiter') {
    return <div className="container py-8 text-center">Access Denied: Only recruiters can view this page.</div>;
  }

  if (!recruiterProfile) {
     return <div className="container py-8 text-center">Recruiter profile not found.</div>;
  }

  // Display profile details
  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Recruiter Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" value={recruiterProfile.companyName} readOnly className="mt-1" />
          </div>

          <div>
            <Label htmlFor="companySize">Company Size</Label>
            <Input id="companySize" value={recruiterProfile.companySize} readOnly className="mt-1" />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={recruiterProfile.industry} readOnly className="mt-1" />
          </div>

          <div>
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea id="companyDescription" value={recruiterProfile.companyDescription} readOnly className="mt-1 min-h-[100px]" />
          </div>

          <div>
            <Label>Attitude Preferences</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {recruiterProfile.attitudePreferences.map((pref, index) => (
                <Badge key={index} variant="secondary">{pref}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecruiterProfilePage;