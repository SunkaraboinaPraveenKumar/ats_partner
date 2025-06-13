"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Database, LineChart, Lock } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BlurFade delay={0.1} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Introduction</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Welcome to SwipeIt. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>
          </BlurFade>
          
          <Separator />

          <BlurFade delay={0.2} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Database className="h-6 w-6 text-primary" /> Information We Collect</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Personal Data:</strong> We may collect personally identifiable information, such as your name, email address, and resume when you register for an account or apply for a job.</li>
                <li><strong>Usage Data:</strong> We automatically collect information on how the Service is accessed and used. This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                <li><strong>Matching Data:</strong> Information related to your job preferences, skills, and interactions with job postings or candidate profiles to facilitate our AI-powered matching.</li>
              </ul>
            </section>
          </BlurFade>

          <Separator />

          <BlurFade delay={0.3} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><LineChart className="h-6 w-6 text-primary" /> How We Use Your Information</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We use the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer support</li>
                <li>To provide AI-powered semantic matching services</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>
          </BlurFade>

          <Separator />

          <BlurFade delay={0.4} duration={0.8} inView={true}>
            <section>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Lock className="h-6 w-6 text-primary" /> Security of Data</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>
          </BlurFade>
        </CardContent>
      </Card>
    </div>
  );
} 