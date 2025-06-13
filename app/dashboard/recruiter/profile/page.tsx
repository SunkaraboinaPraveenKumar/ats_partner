"use client"

import React, { useEffect } from 'react'
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSession } from 'next-auth/react';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from 'next/navigation';
import { BlurFade } from "@/components/magicui/blur-fade";
import { Building2, Users, Factory, ClipboardList, Smile } from 'lucide-react';

function RecruiterProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session === null) {
      router.push('/login');
    }
  }, [session, status, router]);

  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    session?.user?.role === 'recruiter' && session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  if (status === 'loading' || recruiterProfile === undefined) {
    return <div className=" py-8 text-center">Loading profile...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'recruiter') {
    return <div className=" py-8 text-center">Access Denied: Only recruiters can view this page.</div>;
  }

  if (!recruiterProfile) {
    return <div className=" py-8 text-center">Recruiter profile not found.</div>;
  }

  return (
    <div className=" py-8">
      <BlurFade delay={0.1} duration={0.3} inView={true}>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Recruiter Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BlurFade delay={0.2} duration={0.5} inView={true}>
              <div>
                <Label htmlFor="companyName" className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Company Name</Label>
                <Input id="companyName" value={recruiterProfile.companyName} readOnly className="mt-1" />
              </div>
            </BlurFade>

            <BlurFade delay={0.3} duration={0.5} inView={true}>
              <div>
                <Label htmlFor="companySize" className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Company Size</Label>
                <Input id="companySize" value={recruiterProfile.companySize} readOnly className="mt-1" />
              </div>
            </BlurFade>

            <BlurFade delay={0.4} duration={0.5} inView={true}>
              <div>
                <Label htmlFor="industry" className="flex items-center gap-2"><Factory className="h-5 w-5 text-primary" />Industry</Label>
                <Input id="industry" value={recruiterProfile.industry} readOnly className="mt-1" />
              </div>
            </BlurFade>

            <BlurFade delay={0.5} duration={0.5} inView={true}>
              <div>
                <Label htmlFor="companyDescription" className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Company Description</Label>
                <p id="companyDescription" className="mt-1 min-h-[100px]">{recruiterProfile.companyDescription}</p>
              </div>
            </BlurFade>

            <BlurFade delay={0.6} duration={0.5} inView={true}>
              <div>
                <Label className="flex items-center gap-2"><Smile className="h-5 w-5 text-primary" />Attitude Preferences</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {recruiterProfile.attitudePreferences.map((pref, index) => (
                    <Badge key={index} variant="secondary">{pref}</Badge>
                  ))}
                </div>
              </div>
            </BlurFade>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}

export default RecruiterProfilePage;