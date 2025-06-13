"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, User, Award } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BlurFade delay={0.1} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Welcome to SwipeIt. These Terms of Service (\"Terms\") govern your use of our website and services. By accessing or using our Service, you agree to be bound by these Terms.
              </p>
            </section>
          </BlurFade>
          
          <Separator />

          <BlurFade delay={0.2} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><CheckCircle className="h-6 w-6 text-primary" /> Acceptance of Terms</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Please read these Terms carefully before using our Service. If you do not agree to these Terms, you may not use our Service. These Terms apply to all visitors, users, and others who wish to access or use our Service.
              </p>
            </section>
          </BlurFade>

          <Separator />

          <BlurFade delay={0.3} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><User className="h-6 w-6 text-primary" /> User Accounts</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</li>
                <li>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account.</li>
                <li>You agree to accept responsibility for any and all activities or actions that occur under your account and/2or password.</li>
              </ul>
            </section>
          </BlurFade>

          <Separator />

          <BlurFade delay={0.4} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Intellectual Property</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SwipeIt and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
              </p>
            </section>
          </BlurFade>
        </CardContent>
      </Card>
    </div>
  );
} 