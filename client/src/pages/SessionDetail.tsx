import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, MapPin, ChefHat, AlertCircle, User, CheckCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserLink } from "@/components/UserLink";

export default function SessionDetail() {
  const [, params] = useRoute("/sessions/:id");
  const sessionId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const { data: session, isLoading, refetch } = trpc.sessions.getById.useQuery(
    { id: sessionId },
    { enabled: sessionId > 0 }
  );

  // For now, we'll skip host profile details since the router doesn't expose it
  // In production, add a hostProfiles router or include host info in session query
  const hostProfile = null;

  const applyMutation = trpc.sessions.applyForSession.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply for session");
    },
  });

  const updateStatusMutation = trpc.sessions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Session status updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const confirmMutation = trpc.sessions.confirmSession.useMutation({
    onSuccess: () => {
      toast.success("Session confirmed!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to confirm session");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view session details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>The session you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/browse")} className="w-full">
              Browse Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = session.hostId === user?.id;
  const isDishwasher = session.dishwasherId === user?.id;
  const canApply = !isHost && !isDishwasher && session.status === "open";
  const canConfirm = isHost && session.status === "matched";
  const canUpdateStatus = isHost || isDishwasher;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "matched":
        return "bg-blue-500";
      case "confirmed":
        return "bg-purple-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleApply = () => {
    applyMutation.mutate({ sessionId: session.id });
  };

  const handleConfirm = () => {
    confirmMutation.mutate({ sessionId: session.id });
  };

  const handleStatusUpdate = (status: "in_progress" | "completed" | "cancelled") => {
    updateStatusMutation.mutate({ sessionId: session.id, status });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => setLocation("/browse")} className="mb-4">
          ← Back to Browse
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">Dishwashing Session</CardTitle>
                <CardDescription className="text-base">
                  Hosted by {isHost ? "You" : <UserLink userId={session.hostId} name="Host" />}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(session.status)}>
                {session.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Date and Time */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.scheduledDate), "PPP 'at' p")}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Estimated Duration</p>
                <p className="text-sm text-muted-foreground">
                  {session.estimatedDurationMinutes} minutes
                </p>
              </div>
            </div>

            {/* Location - would need host profile data */}

            {/* Meal Description */}
            {session.mealDescription && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <ChefHat className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium mb-1">Meal Description</p>
                    <p className="text-sm text-muted-foreground">{session.mealDescription}</p>
                  </div>
                </div>
              </>
            )}

            {/* Dish Count */}
            {session.dishCount && (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Approximate Dish Count</p>
                  <p className="text-sm text-muted-foreground">{session.dishCount} dishes</p>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {session.specialInstructions && (
              <>
                <Separator />
                <div>
                  <p className="font-medium mb-2">Special Instructions</p>
                  <p className="text-sm text-muted-foreground">{session.specialInstructions}</p>
                </div>
              </>
            )}

            {/* Dishwasher Info */}
            {session.dishwasherId && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dishwasher</p>
                    <p className="text-sm text-muted-foreground">
                      {isDishwasher ? "You" : "Assigned"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex flex-wrap gap-3">
              {canApply && (
                <Button
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                  className="flex-1"
                >
                  {applyMutation.isPending ? "Applying..." : "Apply for This Session"}
                </Button>
              )}

              {canConfirm && (
                <Button
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {confirmMutation.isPending ? "Confirming..." : "Confirm Session"}
                </Button>
              )}

              {canUpdateStatus && session.status === "confirmed" && (
                <Button
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={updateStatusMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  Mark In Progress
                </Button>
              )}

              {canUpdateStatus && session.status === "in_progress" && (
                <Button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1"
                >
                  Mark Completed
                </Button>
              )}

              {canUpdateStatus &&
                (session.status === "open" ||
                  session.status === "matched" ||
                  session.status === "confirmed") && (
                  <Button
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={updateStatusMutation.isPending}
                    variant="destructive"
                  >
                    Cancel Session
                  </Button>
                )}

              {session.status === "completed" && canUpdateStatus && (
                <Button
                  onClick={() =>
                    setLocation(
                      `/rate/${isDishwasher ? session.hostId : session.dishwasherId}/${session.id}`
                    )
                  }
                  className="flex-1"
                >
                  Rate {isDishwasher ? "Host" : "Dishwasher"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
