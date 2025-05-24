import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import JobPostFormModal from "./create-job-post-modal";
import { FileText, Download, RefreshCw } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);

  // Fetch applications for this job
  const applications = useQuery(api.applications.getApplicationsByJobPost, {
    jobPostId: job._id,
  });

  const updateStatus = useMutation(api.applications.updateApplicationStatus);
  const updateMatchRatio = useMutation(api.applications.updateApplicationMatchRatio);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    if (refetchJobs) {
      refetchJobs();
    }
  };

  const handleStatusChange = async (applicationId: Id<"applications">, newStatus: string) => {
    try {
      await updateStatus({
        applicationId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleUpdateMatchRatio = async (applicationId: Id<"applications">) => {
    try {
      await updateMatchRatio({ applicationId });
    } catch (error) {
      console.error("Failed to update match ratio:", error);
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
          <div className="text-sm font-medium">₹ {job.salary}</div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <FileText className="mr-1 h-4 w-4" />
          {applications?.length || 0} Applications
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEditClick}>Edit</Button>
          <Dialog open={isApplicationsOpen} onOpenChange={setIsApplicationsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">View Applications</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Applications for {job.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {applications?.map((app) => (
                  <Card key={app._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{app.profile?.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="flex items-center gap-2">
                            Resume Match: {isNaN(app.matchRatio) ? "Not calculated" : `${Math.round(app.matchRatio * 100)}%`}
                          </p>
                          <p className="flex items-center gap-2">
                            Attitude Match: {isNaN(app?.attitudeMatch ?? 0) ? "Not calculated" : `${Math.round((app?.attitudeMatch ?? 0) * 100)}%`}
                          </p>
                          <p className="flex items-center gap-2">
                            Overall Match: {isNaN(app?.overallMatch ?? 0) ? "Not calculated" : `${Math.round((app?.overallMatch ?? 0) * 100)}%`}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleUpdateMatchRatio(app._id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app._id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        {app.profile?.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(app.profile?.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">{app.profile?.summary}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {app.profile?.extractedSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
                {applications?.length === 0 && (
                  <p className="text-center text-muted-foreground">No applications yet</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
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