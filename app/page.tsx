"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, BriefcaseBusiness, UserCircle, Bot } from "lucide-react";
import HeroAnimation from "@/components/home/hero-animation";
import AIRecruitmentFlow from "@/components/home/ai-recruitment";
import { BorderBeam } from "@/components/magicui/border-beam";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  const features = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Semantic Matching",
      description: "Our AI goes beyond keywords to understand the context and meaning of resumes and job descriptions.",
    },
    {
      icon: <UserCircle className="h-6 w-6 text-primary" />,
      title: "Job Seeker Profiles",
      description: "Create comprehensive profiles that highlight your skills, experience, and career aspirations.",
    },
    {
      icon: <BriefcaseBusiness className="h-6 w-6 text-primary" />,
      title: "Recruiter Dashboards",
      description: "Manage job postings, track applications, and communicate with candidates through an intuitive dashboard.",
    },
    {
      icon: <ArrowRight className="h-6 w-6 text-primary" />,
      title: "Streamlined Applications",
      description: "Apply for jobs with ease and receive real-time updates on your application status.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "AI-Powered Analytics",
      description: "Gain insights into talent pools and recruitment trends with our advanced AI analytics.",
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Real-time Chat",
      description: "Communicate directly with matched candidates or recruiters through our integrated chat feature.",
    },
  ];

  const steps = [
    {
      title: "Create Profile",
      description: "Job seekers create detailed profiles, and recruiters post job descriptions.",
    },
    {
      title: "AI Analysis",
      description: "Our AI analyzes resumes and job descriptions, generating embeddings for semantic understanding.",
    },
    {
      title: "Semantic Matching",
      description: "The AI intelligently matches job seekers with relevant opportunities based on semantic similarity.",
    },
    {
      title: "Real-time Interaction",
      description: "Matched parties can communicate directly through our real-time chat.",
    },
    {
      title: "Hiring Success",
      description: "Efficiently connect with the best talent or secure your dream job.",
    },
  ];

  const isLoggedIn = status === 'authenticated';
  const userRole = session?.user?.role;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <BlurFade delay={0.1} duration={0.3} inView>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className=" px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Find your perfect match with AI
                  </h1>
                  <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground md:text-xl">
                    SwipeIt revolutionizes recruitment with semantic understanding of resumes and job descriptions, going beyond keywords to find true matches.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={isLoggedIn && userRole === 'job-seeker' ? "/dashboard/job-seeker" : "/signup/job-seeker"}>
                    <Button size="lg" className="gap-1">
                      <UserCircle className="h-5 w-5" />
                      For Job Seekers
                    </Button>
                  </Link>
                  <Link href={isLoggedIn && userRole === 'recruiter' ? "/dashboard/recruiter" : "/signup/recruiter"}>
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
      </BlurFade>

      {/* AI Recruitment Section */}
      <BlurFade delay={0.2} duration={0.3} inView>
        <AIRecruitmentFlow />
      </BlurFade>

      {/* Features Section */}
      <BlurFade delay={0.3} duration={0.3} inView>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Elevate Your Recruitment</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SwipeIt offers a suite of powerful features designed to streamline and enhance your hiring process.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md relative overflow-hidden h-full">
                  <BorderBeam size={80} duration={15} delay={6} />
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
      </BlurFade>

      {/* How It Works Section */}
      <BlurFade delay={0.4} duration={0.3} inView>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  How SwipeIt Works
                </h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
      </BlurFade>

      {/* CTA Section */}
      <BlurFade delay={0.5} duration={0.3} inView>
        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-muted/30">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Transform Your Hiring?</h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join SwipeIt today and connect with top talent or exciting job opportunities powered by AI.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href={isLoggedIn ? (userRole === 'recruiter' ? "/dashboard/recruiter" : "/dashboard/job-seeker") : "/signup/job-seeker"}>
                  <Button size="lg" className="gap-1">
                    Get Started <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </BlurFade>
    </div>
  );
}