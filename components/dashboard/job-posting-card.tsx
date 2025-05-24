import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import JobPostFormModal from "./create-job-post-modal";
import { FileText } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface JobPostingCardProps {
  job: {
    _id: Id<"jobPosts">;
    title: string;
    status: string;
    _creationTime: number;
    company: string;
    location: string;
    salary: string | undefined;
    requiredSkills: string[];
    attitudePreferences: string[];
    description: string;
    applicationCount?: number;
  };
  refetchJobs?: () => void;
}

const JobPostingCard: React.FC<JobPostingCardProps> = ({ job, refetchJobs }) => {
  // Format the date
  const formatDate = (dateTimestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateTimestamp).toLocaleDateString('en-US', options);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (refetchJobs) {
      refetchJobs();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">{job.title}</h3>
              <Badge 
                variant={job.status === "active" ? "outline" : "secondary"}
                className={job.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
              >
                {job.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Posted on {formatDate(job._creationTime)}
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {job.company} - {job.location}
          </div>
          <div className="text-sm font-medium">{job.salary}</div>
        </div>
        {job.applicationCount !== undefined && (
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-1 h-4 w-4" />
            {job.applicationCount} Applications
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleEditClick}>Edit</Button>
        </div>
      </CardFooter>

      <JobPostFormModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        job={job}
      />
    </Card>
  );
};

export default JobPostingCard;