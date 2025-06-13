"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle, BriefcaseBusiness, LogIn, Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ScrollProgress } from "../magicui/scroll-progress";
import { useSession, signOut } from "next-auth/react";

interface NavItemsProps {
  isLoggedIn: boolean;
  user: any; // This will now be the session.user object
  recruiterProfile: any;
}

const NavItems: React.FC<NavItemsProps> = ({ isLoggedIn, user, recruiterProfile }) => (
  <>
    {isLoggedIn ? (
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
          <DropdownMenuItem onClick={() => { signOut(); }}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="https://ai-career-coach-agent-livid.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button size={"sm"} className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Career Coach
              </Button>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-1">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        </Link>
        <Link href="/signup/recruiter" className="hidden sm:inline-block">
          <Button variant="outline" size="sm" className="gap-1">
            <BriefcaseBusiness className="h-4 w-4" />
            <span>For Recruiters</span>
          </Button>
        </Link>
        <Link href="/signup/job-seeker" className="hidden sm:inline-block">
          <Button variant="default" size="sm" className="gap-1">
            <UserCircle className="h-4 w-4" />
            <span>For Job Seekers</span>
          </Button>
        </Link>
      </>
    )}
  </>
);

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    session?.user?.role === 'recruiter' && session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  console.log(session?.user);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background p-3">
      <div className=" flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">
            swipe<span className="text-primary">it</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/about" 
            className={cn(
              "text-sm font-medium hover:text-primary",
              pathname === "/about" && "text-primary"
            )}
            passHref
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={cn(
              "text-sm font-medium hover:text-primary",
              pathname === "/contact" && "text-primary"
            )}
            passHref
          >
            Contact
          </Link>
          <Link 
            href="/privacy" 
            className={cn(
              "text-sm font-medium hover:text-primary",
              pathname === "/privacy" && "text-primary"
            )}
            passHref
          >
            Privacy
          </Link>
          <Link 
            href="/terms" 
            className={cn(
              "text-sm font-medium hover:text-primary",
              pathname === "/terms" && "text-primary"
            )}
            passHref
          >
            Terms
          </Link>
          <NavItems 
            isLoggedIn={status === 'authenticated'} 
            user={session?.user} 
            recruiterProfile={recruiterProfile} 
          />
          <ModeToggle />
        </nav>

        {/* Mobile Navigation - directly show avatar/buttons */}
        <div className="md:hidden flex items-center gap-2">
          <NavItems 
            isLoggedIn={status === 'authenticated'} 
            user={session?.user} 
            recruiterProfile={recruiterProfile} 
          />
          <ModeToggle />
        </div>
      </div>
      <ScrollProgress className="h-0.5 bg-blue-600 dark:bg-blue-400" />
    </header>
  );
};

export default Header;