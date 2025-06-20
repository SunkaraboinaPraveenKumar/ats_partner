import React from 'react';
import { Home, ArrowRight, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const InterviewComplete = () => {
  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center space-y-8 py-16">
        {/* Success Icon */}
        <div className="rounded-full bg-seaGreen-p-4">
          <Image src={"/check.png"} width={100} height={100} alt='check'/>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-center">Interview Complete!</h1>

        {/* Subheading */}
        <p className="text-lg text-gray-500 text-center">
          Thank you for participating in the AI-driven interview with Alcruiter
        </p>

        {/* Image */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src="/login.png"
            alt="Interview Illustration"
            className="w-full h-auto object-cover max-w-4xl p-3 rounded-3xl"
          />
        </div>

        {/* Next Steps */}
        <div className="bg-midnightLighter rounded-xl p-8 shadow-md w-full max-w-xl space-y-4">
          <div className="flex items-center justify-center rounded-full bg-midnightLighter w-12 h-12 mx-auto">
            <Send className='bg-blue-500 rounded-xl p-2 h-10 w-10'/>
          </div>
          <h2 className="text-2xl font-semibold text-center">What's Next?</h2>
          {/* You would likely add more content for the "Next Steps" section here */}
          <p className="text-gray-500 text-center">
            The recruiter will review your interview responses and will contact you soon regarding the next steps.
          </p>
          <p className="text-gray-500 text-sm text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 inline-block mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Response within 2-3 business days
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-5 md:flex-row space-x-4">
          <Link href={"/dashboard"}>
            <Button className="cursor-pointer rounded-lg py-3 px-6 flex items-center space-x-2 transition duration-300 ease-in-out">
              <Home className="h-5 w-5" />
              <span>Return to Homepage</span>
            </Button>
          </Link>
          <Link href={"/dashboard/create-interview"}>
          <Button className="cursor-pointer">
            <span>View Other Opportunities</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-midnightLighter text-gray-400 text-center py-4">
        <p>&copy; 2025 Alcruiter. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InterviewComplete;