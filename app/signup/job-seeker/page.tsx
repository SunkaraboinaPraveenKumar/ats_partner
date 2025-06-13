"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  summary: z.string().min(20, {
    message: "Summary must be at least 20 characters.",
  }),
});

export default function JobSeekerSignup() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(33);
  const [attitudeResults, setAttitudeResults] = useState({
    workStyle: "",
    problemSolving: "",
    teamDynamics: "",
    workEnvironment: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      title: "",
      summary: "",
    },
  });

  const signup = useMutation(api.auth.signup);
  const createProfile = useMutation(api.profiles.createJobSeekerProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const router = useRouter();
  const ingestResume = useAction(api.action.ingest);

  const handleNext = async () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = await form.trigger(["name", "email", "password"]);
    } else if (step === 2) {
      isValid = await form.trigger(["title", "summary"]);
    } else if (step === 3) {
      isValid = true;
      if (!resumeFile) {
        toast.error("Please upload your resume.");
        isValid = false;
      } else if (Object.values(attitudeResults).some(result => result === "")) {
         toast.error("Please complete the attitude assessment.");
         isValid = false;
      }
    }

    if (isValid && step < 3) {
      setStep(step + 1);
      setProgress(step === 1 ? 66 : 100);
    }
  };

  const handleSubmit = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["name", "email", "password"]);
    } else if (step === 2) {
      isValid = await form.trigger(["title", "summary"]);
    } else if (step === 3) {
      isValid = true;
      if (!resumeFile) {
        toast.error("Please upload your resume.");
        isValid = false;
      } else if (Object.values(attitudeResults).some(result => result === "")) {
         toast.error("Please complete the attitude assessment.");
         isValid = false;
      }
    }

    if (isValid) {
      if (step < 3) {
        handleNext();
      } else {
        console.log("Attempting signup and profile creation with:", form.getValues(), resumeFile);
        setIsLoading(true);
        try {
          const userId = await signup({
            name: form.getValues().name,
            email: form.getValues().email,
            password: form.getValues().password,
            role: "job-seeker",
          });
          console.log("Signup successful! User ID:", userId);

          const signInResult = await signIn("credentials", {
            redirect: false,
            email: form.getValues().email,
            password: form.getValues().password,
          });

          if (signInResult?.error) {
            throw new Error(signInResult.error);
          }
          
          // After successful signIn, the session will be available globally
          // No need to manually set authStore.login anymore.
          // We can proceed with profile creation using the userId from signup.
          const authenticatedUserId = userId.userId;

          let storageId: Id<"_storage"> | undefined;
          if (resumeFile) {
              const postUrl = await generateUploadUrl();
              const uploadResult = await fetch(postUrl, { method: "POST", body: resumeFile });
              const jsonResult = await uploadResult.json();
              storageId = jsonResult.storageId as Id<"_storage">;
              console.log("Resume uploaded successfully! Storage ID:", storageId);
          } else {
               throw new Error("Resume file is required.");
          }

          console.log("Sending storageId to /api/resume-loader:", storageId);
          const resumeProcessingResponse = await fetch("/api/resume-loader", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ storageId }),
          });

          if (!resumeProcessingResponse.ok) {
              const errorData = await resumeProcessingResponse.json();
              throw new Error(errorData.error || "Failed to process resume via API.");
          }

          const { resumeText, extractedSkills, fileUrl } = await resumeProcessingResponse.json();
          console.log("Resume processed. Text length:", resumeText.length, "Skills:", extractedSkills);

          const attitudeQuizResults = attitudeResults;

          const profileId = await createProfile({
            userId: authenticatedUserId,
            storageId: storageId,
            title: form.getValues().title,
            summary: form.getValues().summary,
            resumeText: resumeText,
            fileUrl:fileUrl,
            resumeIngested:true,
            extractedSkills: extractedSkills,
            attitudeQuizResults: attitudeQuizResults,
          });
          console.log("Profile creation successful! Profile ID:", profileId);

          // Immediately trigger resume embedding ingestion
          const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });

          const docs = await splitter.createDocuments([resumeText]);
          const splitText = docs.map(doc => doc.pageContent);

          await ingestResume({
            splitText,
            userId: authenticatedUserId,
          });

          toast.success("Signup and profile created successfully!");
          router.push("/dashboard/job-seeker");
        } catch (error) {
          console.error("Signup or profile creation failed:", error);
          toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(step === 3 ? 66 : 33);
    }
  };

  const isStepComplete = () => {
    if (step === 1) {
      return form.formState.dirtyFields.name && form.formState.dirtyFields.email && form.formState.dirtyFields.password;
    } else if (step === 2) {
      return form.formState.dirtyFields.title && form.formState.dirtyFields.summary;
    } else if (step === 3) {
      return resumeFile !== null && Object.values(attitudeResults).every(result => result !== "");
    }
    return false;
  };

  return (
    <div className="py-12 flex items-center justify-center min-h-screen">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Job Seeker Signup</CardTitle>
          <CardDescription>Join SwipeIt and find your dream job.</CardDescription>
          <Progress value={progress} className="w-full mt-4" />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="********" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current or Desired Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer, Data Scientist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A concise overview of your skills, experience, and career goals."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="resume-upload" className="mb-2 block">Upload Resume (PDF, DOCX)</Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-50 file:text-violet-700
                      hover:file:bg-violet-100"
                  />
                  {resumeFile && <p className="mt-2 text-sm text-gray-600">Selected file: {resumeFile.name}</p>}
                </div>

                <div>
                  <Label className="mb-2 block">Attitude Assessment</Label>
                  <p className="text-sm text-muted-foreground mb-4">Answer a few questions to help us understand your work preferences.</p>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>How do you approach problem-solving?</Label>
                      <Tabs defaultValue="analytical" onValueChange={(value) => setAttitudeResults(prev => ({ ...prev, problemSolving: value }))}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="analytical">Analytical</TabsTrigger>
                          <TabsTrigger value="creative">Creative</TabsTrigger>
                          <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="grid gap-2">
                      <Label>What is your preferred work style?</Label>
                      <Tabs defaultValue="independent" onValueChange={(value) => setAttitudeResults(prev => ({ ...prev, workStyle: value }))}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="independent">Independent</TabsTrigger>
                          <TabsTrigger value="team-oriented">Team-Oriented</TabsTrigger>
                          <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="grid gap-2">
                      <Label>How do you prefer to interact within a team?</Label>
                      <Tabs defaultValue="direct" onValueChange={(value) => setAttitudeResults(prev => ({ ...prev, teamDynamics: value }))}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="direct">Direct</TabsTrigger>
                          <TabsTrigger value="supportive">Supportive</TabsTrigger>
                          <TabsTrigger value="leading">Leading</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="grid gap-2">
                      <Label>What kind of work environment do you thrive in?</Label>
                      <Tabs defaultValue="structured" onValueChange={(value) => setAttitudeResults(prev => ({ ...prev, workEnvironment: value }))}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="structured">Structured</TabsTrigger>
                          <TabsTrigger value="flexible">Flexible</TabsTrigger>
                          <TabsTrigger value="fast-paced">Fast-Paced</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext} disabled={isLoading || !isStepComplete()}>
                  Next {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || !isStepComplete()}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}