// Admin moderation dashboard for reviewing flagged photos
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, X, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminModeration() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Redirect if not admin
  if (user && user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const { data: flaggedPhotos, isLoading, refetch } = trpc.admin.getFlaggedPhotos.useQuery();

  const moderateMutation = trpc.admin.moderatePhoto.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Photo ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to moderate photo");
    },
  });

  const handleModerate = (photoId: number, action: "approve" | "reject") => {
    moderateMutation.mutate({ photoId, action });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading flagged photos...</div>
      </div>
    );
  }

  const REASON_LABELS: Record<string, string> = {
    inappropriate: "Inappropriate Content",
    spam: "Spam or Misleading",
    violence: "Violence or Harmful",
    copyright: "Copyright Violation",
    other: "Other",
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Photo Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate flagged photos to maintain community standards
        </p>
      </div>

      {!flaggedPhotos || flaggedPhotos.length === 0 ? (
        <Card className="p-12 text-center">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">All Clear!</h2>
          <p className="text-muted-foreground">
            No flagged photos to review at this time.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {flaggedPhotos.map((item) => (
            <Card key={item.flag.id} className="p-6">
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Photo Preview */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={item.photo.photoUrl}
                      alt="Flagged photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.photo.caption && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Caption:</strong> {item.photo.caption}
                    </div>
                  )}
                </div>

                {/* Flag Details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h3 className="font-semibold">
                          {REASON_LABELS[item.flag.reason] || item.flag.reason}
                        </h3>
                      </div>
                      <Badge variant="destructive">
                        {item.photo.flagCount} {item.photo.flagCount === 1 ? 'report' : 'reports'}
                      </Badge>
                    </div>
                  </div>

                  {item.flag.description && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Reporter's comments:</p>
                      <p className="text-sm text-muted-foreground">{item.flag.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        Reported by
                      </div>
                      <div className="font-medium">{item.reporter.name}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Reported on
                      </div>
                      <div className="font-medium">
                        {format(new Date(item.flag.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleModerate(item.photo.id, "approve")}
                      disabled={moderateMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Photo
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleModerate(item.photo.id, "reject")}
                      disabled={moderateMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Photo
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
