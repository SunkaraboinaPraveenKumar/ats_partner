"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Building2, Loader2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  companySize: z.string({
    required_error: "Please select a company size.",
  }),
  industry: z.string({
    required_error: "Please select an industry.",
  }),
  companyDescription: z.string().min(20, {
    message: "Company description must be at least 20 characters.",
  }),
  companyValues: z.array(z.string()).min(1, {
    message: "Please select at least one company value.",
  })
});

export default function RecruiterSignup() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      companySize: "",
      industry: "",
      companyDescription: "",
      companyValues: [],
    },
  });

  const signup = useMutation(api.auth.signup);
  const createProfile = useMutation(api.profiles.createRecruiterProfile);
  const login = useMutation(api.auth.login);
  const router = useRouter();
  const authStore = useAuthStore();

  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger(["name", "email", "password"]);
    } else if (step === 2) {
      isValid = await form.trigger(["companyName", "companySize", "industry"]);
    } else if (step === 3) {
      isValid = await form.trigger(["companyDescription"]);
    }

    if (isValid && step < 3) {
      setStep(step + 1);
      setProgress(step === 1 ? 66 : 100);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger(["companyDescription"]);

    if (!isValid) return;

    const values = form.getValues();
    console.log("Attempting signup and profile creation with:", values);

    setIsLoading(true);

    try {
      const userId = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        role: "recruiter",
      });
      console.log("Signup successful! User ID:", userId);

      const result = await login({
        email: values.email,
        password: values.password,
      });
      console.log("User logged in successfully after signup.", result);

      authStore.login({ ...result, role: result.role as "job-seeker" | "recruiter" });

      const profileId = await createProfile({
        userId: result?.userId,
        companyName: values.companyName,
        companySize: values.companySize,
        industry: values.industry,
        companyDescription: values.companyDescription,
        attitudePreferences: values.companyValues,
      });
      console.log("Profile creation successful! Profile ID:", profileId);

      toast.success("Account and profile created successfully!");
      router.push("/dashboard/recruiter");
    } catch (error) {
      console.error("Signup or profile creation failed:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(step === 2 ? 33 : 66);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Recruiter Account</CardTitle>
          <CardDescription>
            Find the perfect candidates with AI-powered matching
          </CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" {...field} />
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
                          <Input placeholder="jane.smith@company.com" type="email" {...field} />
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
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1001+">1001+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your company, culture, and values"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="companyValues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Culture & Values</FormLabel>
                          <p className="text-sm text-muted-foreground mb-4">
                            Select the values that best represent your company culture. This helps match you with candidates who will thrive in your environment.
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: "innovation", label: "Innovation", description: "Creative problem-solving" },
                              { value: "teamwork", label: "Teamwork", description: "Collaborative approach" },
                              { value: "excellence", label: "Excellence", description: "High standards" },
                              { value: "autonomy", label: "Autonomy", description: "Self-directed work" },
                              { value: "workLifeBalance", label: "Work-Life Balance", description: "Flexible scheduling" },
                              { value: "growthMindset", label: "Growth Mindset", description: "Continuous learning" },
                            ].map((value) => (
                              <Button
                                key={value.value}
                                type="button"
                                variant={field.value.includes(value.value) ? "default" : "outline"}
                                className="justify-start h-auto py-2"
                                onClick={() => {
                                  const newValues = field.value.includes(value.value)
                                    ? field.value.filter((v) => v !== value.value)
                                    : [...field.value, value.value];
                                  field.onChange(newValues);
                                }}
                              >
                                <span className="flex flex-col items-start">
                                  <span className="font-medium">{value.label}</span>
                                  <span className="text-xs text-muted-foreground">{value.description}</span>
                                </span>
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              )}

              <div className="flex justify-between pt-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={step < 3 ? handleNext : handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step < 3 ? "Next" : "Create Account"}
                </Button>
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