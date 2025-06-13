"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function Login() {
  const [userType, setUserType] = useState<"job-seeker" | "recruiter">("job-seeker");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      if (session.user.role === "job-seeker") {
        router.push("/dashboard/job-seeker");
      } else if (session.user.role === "recruiter") {
        router.push("/dashboard/recruiter");
      }
    }
  }, [session, status, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Attempting login with:", values, userType);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Login successful!");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Logging in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log in to SwipeIt</CardTitle>
          <CardDescription>
            Welcome back! Log in to continue your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="job-seeker" 
            className="w-full mb-6" 
            onValueChange={(value) => setUserType(value as "job-seeker" | "recruiter")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="job-seeker">Job Seeker</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
            </TabsList>
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
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
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log in
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href={userType === "job-seeker" ? "/signup/job-seeker" : "/signup/recruiter"} 
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}