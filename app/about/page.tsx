"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Rocket, Lightbulb, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">About Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Rocket className="h-6 w-6 text-primary" /> Our Mission</h3>
            <p className="text-gray-700 dark:text-gray-300">
              At SwipeIt, our mission is to revolutionize the recruitment process by connecting job seekers and employers with unprecedented efficiency and accuracy. We leverage cutting-edge AI to semantically match candidates with the right opportunities, ensuring a perfect fit for both sides.
            </p>
          </section>
          
          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary" /> What We Offer</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>AI-Powered Matching:</strong> Our advanced algorithms analyze job descriptions and candidate profiles to find the most relevant matches, saving time and effort.</li>
              <li><strong>Streamlined Application Process:</strong> Apply for jobs or review candidates with ease through our intuitive interface.</li>
              <li><strong>Direct Communication:</strong> Once a match is made, communicate directly through our integrated chat feature.</li>
              <li><strong>Comprehensive Dashboards:</strong> Track your applications, job postings, and match progress with detailed insights.</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Our Vision</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We envision a future where talent acquisition is seamless, fair, and incredibly effective. By reducing the noise and focusing on true compatibility, we empower individuals to find their dream careers and companies to build exceptional teams.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
} 