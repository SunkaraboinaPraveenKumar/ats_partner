"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

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
  const login = useMutation(api.auth.login);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const router = useRouter();
  const {user, isLoggedIn} = useAuthStore();
  const authStore = useAuthStore();
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

          const result = await login({
            email: form.getValues().email,
            password: form.getValues().password,
          });
          console.log("User logged in successfully after signup.", result);

          authStore.login({
              ...result,
              role: result.role as "job-seeker" | "recruiter"
           });

          if (!result?.userId) {
              throw new Error("User not authenticated as job seeker after login.");
          }
          
          const authenticatedUserId = result?.userId;

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

          toast.success("Account and profile created successfully!");
          router.push("/dashboard/job-seeker");
        } catch (error) {
          console.error("Signup, login, upload, processing, or profile creation failed:", error);
          toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        setResumeFile(null);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and DOCX files are allowed.");
        setResumeFile(null);
        return;
      }

      setResumeFile(file);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(step === 2 ? 33 : 66);
    }
  };

  const isStepComplete = () => {
      if (step === 1) {
          return form.formState.isValid;
      } else if (step === 2) {
          return form.formState.isValid;
      } else if (step === 3) {
          return resumeFile !== null && Object.values(attitudeResults).every(result => result !== "");
      }
      return false;
  }

  return (
    <div className="py-12 flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Job Seeker Account</CardTitle>
          <CardDescription>
            Find your dream job with AI-powered matching
          </CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
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
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
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
                            placeholder="Brief description of your experience and skills"
                            className="min-h-32"
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Resume Upload</FormLabel>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF or DOCX (MAX. 5MB)
                          </p>
                          {resumeFile && (
                            <p className="mt-2 text-sm font-medium text-primary">
                              {resumeFile.name}
                            </p>
                          )}
                        </div>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.docx"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Attitude Assessment</FormLabel>
                    <p className="text-sm text-muted-foreground mb-4">
                      This short quiz helps match you with companies that share your work values.
                    </p>

                    <Tabs defaultValue="q1" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="q1">Q1</TabsTrigger>
                        <TabsTrigger value="q2">Q2</TabsTrigger>
                        <TabsTrigger value="q3">Q3</TabsTrigger>
                        <TabsTrigger value="q4">Q4</TabsTrigger>
                      </TabsList>
                      <TabsContent value="q1" className="p-4 border rounded-md mt-2">
                        <h4 className="font-medium mb-2">I prefer working:</h4>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant={attitudeResults.workStyle === "structured" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workStyle: "structured"})}>In a structured environment</Button>
                          <Button type="button" variant={attitudeResults.workStyle === "flexibility" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workStyle: "flexibility"})}>With flexibility and autonomy</Button>
                          <Button type="button" variant={attitudeResults.workStyle === "balance" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workStyle: "balance"})}>A balance of both</Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="q2" className="p-4 border rounded-md mt-2">
                        <h4 className="font-medium mb-2">When faced with a challenge, I typically:</h4>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant={attitudeResults.problemSolving === "procedures" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, problemSolving: "procedures"})}>Follow established procedures</Button>
                          <Button type="button" variant={attitudeResults.problemSolving === "innovative" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, problemSolving: "innovative"})}>Look for innovative solutions</Button>
                          <Button type="button" variant={attitudeResults.problemSolving === "consult" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, problemSolving: "consult"})}>Consult with team members first</Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="q3" className="p-4 border rounded-md mt-2">
                        <h4 className="font-medium mb-2">My ideal work culture is:</h4>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant={attitudeResults.teamDynamics === "competitive" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, teamDynamics: "competitive"})}>Competitive and fast-paced</Button>
                          <Button type="button" variant={attitudeResults.teamDynamics === "collaborative" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, teamDynamics: "collaborative"})}>Collaborative and supportive</Button>
                          <Button type="button" variant={attitudeResults.teamDynamics === "independent" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, teamDynamics: "independent"})}>Independent and goal-oriented</Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="q4" className="p-4 border rounded-md mt-2">
                        <h4 className="font-medium mb-2">I thrive in a work environment that is:</h4>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant={attitudeResults.workEnvironment === "fast-paced" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workEnvironment: "fast-paced"})}>Fast-paced and dynamic</Button>
                          <Button type="button" variant={attitudeResults.workEnvironment === "stable" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workEnvironment: "stable"})}>Stable and predictable</Button>
                          <Button type="button" variant={attitudeResults.workEnvironment === "innovative" ? "default" : "outline"} className="justify-start" onClick={() => setAttitudeResults({...attitudeResults, workEnvironment: "innovative"})}>Innovative and open to change</Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
                    Previous
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" asChild disabled={isLoading}>
                    <Link href="/">Cancel</Link>
                  </Button>
                )}
                {step < 3 ? (
                    <Button
                       type="button"
                       onClick={handleNext}
                       disabled={isLoading}
                    >
                       Next
                    </Button>
                ) : (
                    <Button
                       type="submit"
                       disabled={isLoading}
                    >
                       {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}