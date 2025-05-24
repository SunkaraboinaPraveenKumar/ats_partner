import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge"; // Assuming for skills/values display
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { Id } from "@/convex/_generated/dataModel";



// Form schema based on createJobPost mutation args
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  salary: z.string().optional(), // Salary is optional in schema, but requiring string might be good practice depending on UI
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  requiredSkills: z.array(z.string()).min(1, { message: "Please add at least one required skill." }),
  attitudePreferences: z.array(z.string()).min(1, { message: "Please select at least one attitude preference." }),
});

interface JobPostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: { // Optional job prop for editing
    _id: Id<"jobPosts">; // Include _id for updates
    title: string;
    company: string;
    location: string;
    salary: string | undefined;
    description: string;
    requiredSkills: string[];
    attitudePreferences: string[];
  } | null; // job can be null or undefined initially
}

const JobPostFormModal: React.FC<JobPostFormModalProps> = ({ isOpen, onClose, job }) => {
  const { user } = useAuthStore();

  const recruiterProfile = useQuery(
    api.profiles.getRecruiterProfile,
    user?.role === 'recruiter' && user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isAddingAttitude, setIsAddingAttitude] = useState(false);
  const [attitudeInput, setAttitudeInput] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      requiredSkills: [],
      attitudePreferences: [],
    },
  });

  // Use useEffect to set form values when job prop changes (for editing)
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary || "", // Handle potential undefined salary
        description: job.description,
        requiredSkills: job.requiredSkills,
        attitudePreferences: job.attitudePreferences,
      });
    } else {
       // Reset to default values if modal is opened for creation after editing
       form.reset({
        title: "",
        company: recruiterProfile?.companyName || "", // Default from profile or empty
        location: "",
        salary: "",
        description: "",
        requiredSkills: [],
        attitudePreferences: [],
       });
    }
     // Also update company name if recruiterProfile loads later while creating
    if (!job && recruiterProfile) {
       form.setValue('company', recruiterProfile.companyName);
    }
  }, [job, form.reset, recruiterProfile, form.setValue]); // Add dependencies

  const createJobPost = useMutation(api.jobs.createJobPost);
  const updateJobPost = useMutation(api.jobs.updateJobPost); // Get update mutation
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (job) { // If job prop exists, update
        await updateJobPost({
          jobPostId: job._id,
          userId: user?.userId as Id<"users">, // Pass user ID for authorization
          ...values,
          salary: values.salary || '', // Ensure salary is string
        });
        toast.success("Job post updated successfully!");
      } else { // Otherwise, create
        await createJobPost({ ...values, salary: values.salary || '', userId: user?.userId as Id<"users"> }); // Ensure userId type is correct
        toast.success("Job post created successfully!");
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error(`${job ? "Failed to update" : "Failed to create"} job post:`, error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to add skills/attitude - basic implementation for now
  const handleAddSkill = () => {
    if (skillInput.trim() && !form.getValues().requiredSkills.includes(skillInput.trim())) {
      form.setValue('requiredSkills', [...form.getValues().requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    form.setValue('requiredSkills', form.getValues().requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleAddAttitude = () => {
    if (attitudeInput.trim() && !form.getValues().attitudePreferences.includes(attitudeInput.trim())) {
      form.setValue('attitudePreferences', [...form.getValues().attitudePreferences, attitudeInput.trim()]);
      setAttitudeInput('');
    }
    setIsAddingAttitude(false);
  };

  const handleRemoveAttitude = (attitudeToRemove: string) => {
    form.setValue('attitudePreferences', form.getValues().attitudePreferences.filter(attitude => attitude !== attitudeToRemove));
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full overflow-y-auto max-h-screen">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Post" : "Create New Job Post"}</DialogTitle>
          <DialogDescription>
            {job ? "Edit the details for this job posting." : "Fill in the details for your new job posting."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    {/* company name is defaulted and read-only for recruiters */}
                    <Input placeholder="Acme Corp" {...field} readOnly={user?.role === 'recruiter'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Remote or City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $100,000 - $120,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide a detailed job description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required Skills Input */}
            <FormField
               control={form.control}
               name="requiredSkills"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Required Skills</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 text-xs text-muted-foreground hover:text-foreground">
                           X
                          </button>
                        </Badge>
                      ))}
                    </div>
                   <div className="flex gap-2">
                     <Input
                       placeholder="Add a skill (e.g., React)"
                       value={skillInput}
                       onChange={(e) => setSkillInput(e.target.value)}
                       onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                     />
                     <Button type="button" onClick={handleAddSkill} variant="outline">Add</Button>
                   </div>
                   <FormMessage />
                 </FormItem>
               )}
            />

            {/* Attitude Preferences Input */}
             <FormField
                control={form.control}
                name="attitudePreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attitude Preferences</FormLabel>
                     <div className="flex flex-wrap gap-2">
                       {field.value.map((attitude, index) => (
                         <Badge key={index} variant="secondary" className="flex items-center gap-1">
                           {attitude}
                           <button type="button" onClick={() => handleRemoveAttitude(attitude)} className="ml-1 text-xs text-muted-foreground hover:text-foreground">
                            X
                           </button>
                         </Badge>
                       ))}
                     </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an attitude preference (e.g., Innovative)"
                        value={attitudeInput}
                        onChange={(e) => setAttitudeInput(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttitude(); }}}
                      />
                      <Button type="button" onClick={handleAddAttitude} variant="outline">Add</Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
             />

          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              job ? "Save Changes" : "Create Job Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostFormModal; 