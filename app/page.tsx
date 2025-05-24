import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, BriefcaseBusiness, UserCircle } from "lucide-react";
import HeroAnimation from "@/components/home/hero-animation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className=" px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Find your perfect match with AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  SwipeIt revolutionizes recruitment with semantic understanding of resumes and job descriptions, going beyond keywords to find true matches.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup/job-seeker">
                  <Button size="lg" className="gap-1">
                    <UserCircle className="h-5 w-5" />
                    For Job Seekers
                  </Button>
                </Link>
                <Link href="/signup/recruiter">
                  <Button size="lg" variant="outline" className="gap-1">
                    <BriefcaseBusiness className="h-5 w-5" />
                    For Recruiters
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className=" px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                AI-Powered Recruitment
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our semantic matching technology understands the context behind job descriptions and resumes, creating perfect matches.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className=" px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How SwipeIt Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Streamlined recruitment process powered by AI and semantic understanding.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-muted/30">
        <div className=" px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Recruitment?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join SwipeIt today and experience the future of recruitment with AI-powered semantic matching.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup/job-seeker">
                <Button size="lg" className="gap-1">
                  Get Started <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Semantic Matching",
    description: "Our AI understands the context in job descriptions and resumes, not just keywords, creating more meaningful matches.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-2-2H7.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H9a2.5 2.5 0 0 0 0-5H6a.5.5 0 0 0-.5.5v14a.5.5 0 0 0 .5.5h2.5Z"/><path d="M15 21V8"/><path d="M18 21V8"/><path d="M21 21V8"/><path d="M12 17v4"/></svg>,
  },
  {
    title: "Swipe-Based Interface",
    description: "Intuitive swipe interface for both job seekers and recruiters, making the matching process engaging and efficient.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 19-7-7 7-7"/><path d="m19 19-7-7 7-7"/></svg>,
  },
  {
    title: "Attitude Matching",
    description: "Find candidates that fit not just the skills, but also the company culture and work environment.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    title: "Blind Hiring Mode",
    description: "Reduce bias in your recruitment process with our unique blind hiring mode that focuses on skills, not demographics.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="m21 21-6-6"/><path d="m17 17-6-6"/></svg>,
  },
  {
    title: "Real-Time Chat",
    description: "Connect with matched candidates or recruiters instantly through our integrated real-time messaging system.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
];

const steps = [
  {
    title: "Create Your Profile",
    description: "Upload your resume or create a job posting with our easy-to-use interface.",
  },
  {
    title: "AI Analysis",
    description: "Our AI analyzes and understands the context behind your skills or job requirements.",
  },
  {
    title: "Start Matching",
    description: "Swipe through AI-recommended matches and connect with your perfect fit.",
  },
];