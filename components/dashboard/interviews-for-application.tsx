import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ThumbsUp, ThumbsDown, FileText, Eye } from "lucide-react";
import Link from "next/link";

interface InterviewsForApplicationProps {
  applicationId: Id<"applications">;
}

const InterviewsForApplication: React.FC<InterviewsForApplicationProps> = ({ applicationId }) => {
  const interviews = useQuery(api.interviews.getInterviewsByApplicationId, { applicationId });

  if (!interviews) return <div className="text-xs text-muted-foreground mt-2">Loading interviews...</div>;
  if (interviews.length === 0) return <div className="text-xs text-muted-foreground mt-2">No interviews yet</div>;

  return (
    <div className="mt-4 space-y-2">
      <div className="font-semibold text-sm mb-1">Interviews:</div>
      {interviews.map((interview, idx) => (
        <Card key={interview._id} className="p-3 bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Interview #{idx + 1}</span>
              {interview.feedback ? (
                <Badge 
                  variant={interview.feedback.feedback.Recommendation === 'Recommended' ? 'default' : 'destructive'}
                  className="text-xs px-2 py-1 flex items-center gap-1"
                >
                  {interview.feedback.feedback.Recommendation === 'Recommended' ? (
                    <ThumbsUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ThumbsDown className="h-3 w-3 mr-1" />
                  )}
                  {interview.feedback.feedback.Recommendation === 'Recommended' ? 'Recommended' : 'Not Recommended'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Pending</Badge>
              )}
            </div>
            <Link
              href={`/dashboard/recruiter/interview/${interview._id}`}
              className="text-primary hover:text-primary/80 ml-2"
              title="View Details"
            >
              <Eye className="h-5 w-5" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewsForApplication; 