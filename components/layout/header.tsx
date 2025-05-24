"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle, BriefcaseBusiness, LogIn, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, user } = useAuthStore();
  const router = useRouter();

  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    user?.role === 'recruiter' && user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  console.log(user);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3">
      <div className=" flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">
            swipe<span className="text-primary">it</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.name ? user.name.charAt(0) : ''}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      {user?.role === 'recruiter' && recruiterProfile && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {recruiterProfile.companyName}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user?.role === 'recruiter' ? "/dashboard/recruiter" : "/dashboard/job-seeker"}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'recruiter' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/recruiter/profile">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'job-seeker' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/job-seeker/profile">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { useAuthStore.getState().logout(); router.push('/'); }}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link href="/signup/recruiter">
                <Button variant="outline" size="sm" className="gap-1">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="hidden sm:inline">For Recruiters</span>
                </Button>
              </Link>
              <Link href="/signup/job-seeker">
                <Button variant="default" size="sm" className="gap-1">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">For Job Seekers</span>
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
        isMobileMenuOpen ? "block" : "hidden"
      )}>
        <nav className="flex flex-col items-start gap-4 p-4">
          {isLoggedIn ? (
            <>
              <Link href={user?.role === 'recruiter' ? "/dashboard/recruiter" : "/dashboard/job-seeker"} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>My Dashboard</span>
                </Button>
              </Link>
              {user?.role === 'recruiter' && (
                <Link href="/dashboard/recruiter/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
              )}
              {user?.role === 'job-seeker' && (
                <Link href="/dashboard/job-seeker/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => { useAuthStore.getState().logout(); setIsMobileMenuOpen(false); router.push('/'); }}
              >
                <LogIn className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="gap-1 w-full justify-start">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/signup/recruiter" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="gap-1 w-full justify-start">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span>For Recruiters</span>
                </Button>
              </Link>
              <Link href="/signup/job-seeker" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="gap-1 w-full justify-start">
                  <UserCircle className="h-4 w-4" />
                  <span>For Job Seekers</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;