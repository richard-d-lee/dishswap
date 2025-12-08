// Public user profile showcase page
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeList } from "@/components/Badge";
import { FlagPhotoDialog } from "@/components/FlagPhotoDialog";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Award, Users, ChefHat, Sparkles, Image as ImageIcon, Flag } from "lucide-react";
import { format } from "date-fns";

export default function UserProfile() {
  const params = useParams();
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const userId = params.id ? parseInt(params.id) : 0;

  const flagPhotoMutation = trpc.sessions.flagPhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo reported successfully. Our team will review it.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to report photo");
    },
  });

  const handleFlagPhoto = async (reason: string, description?: string) => {
    if (!selectedPhotoId) return;
    await flagPhotoMutation.mutateAsync({
      photoId: selectedPhotoId,
      reason: reason as any,
      description,
    });
  };

  const { data: profile, isLoading } = trpc.profiles.getPublicProfile.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </Card>
      </div>
    );
  }

  const { user, hostProfile, dishwasherProfile, statistics, recentSessions, reviews, badges, sessionPhotos } = profile;
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.name?.[0] || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="text-2xl bg-primary/20">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-3">
                {user.userType === "host" && (
                  <Badge variant="secondary" className="gap-1">
                    <ChefHat className="h-3 w-3" />
                    Host
                  </Badge>
                )}
                {user.userType === "dishwasher" && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Dishwasher
                  </Badge>
                )}
                {user.userType === "both" && (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <ChefHat className="h-3 w-3" />
                      Host
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Dishwasher
                    </Badge>
                  </>
                )}
              </div>

              {/* Achievement Badges */}
              {badges && badges.length > 0 && (
                <div className="mb-3">
                  <BadgeList badges={badges} size="md" showLabels={false} maxDisplay={8} />
                </div>
              )}

              {user.bio && (
                <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                </div>
                {hostProfile?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {hostProfile.city}, {hostProfile.state}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Display */}
            {statistics.averageRating > 0 && (
              <Card className="p-6 text-center min-w-[140px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-3xl font-bold">{statistics.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {statistics.totalRatings} {statistics.totalRatings === 1 ? "review" : "reviews"}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(user.userType === "host" || user.userType === "both") && (
                <>
                  <Card className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{statistics.completedHostSessions}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Meals Hosted</p>
                  </Card>
                </>
              )}

              {(user.userType === "dishwasher" || user.userType === "both") && (
                <Card className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{statistics.completedDishwasherSessions}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </Card>
              )}

              {statistics.averageRating > 0 && (
                <Card className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </Card>
              )}
            </div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Recent Meals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentSessions.map((session) => (
                    <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{session.mealDescription || "Meal Session"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.scheduledDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant="outline">{session.dishCount || 0} dishes</Badge>
                      </div>
                      {session.specialInstructions && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.specialInstructions}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Photo Gallery */}
            {sessionPhotos && sessionPhotos.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Meal Gallery ({sessionPhotos.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sessionPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={photo.photoUrl}
                        alt={photo.caption || "Meal photo"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => {
                          setSelectedPhotoId(photo.id);
                          setFlagDialogOpen(true);
                        }}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {review.rater?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{review.rater?.name || "Anonymous"}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{review.rating.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {format(new Date(review.rating.createdAt), "MMM d, yyyy")}
                          </p>
                          {review.rating.reviewText && (
                            <p className="text-sm">{review.rating.reviewText}</p>
                          )}
                          {review.rating.wouldRecommend && (
                            <Badge variant="secondary" className="mt-2">
                              Would Recommend
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {reviews.length === 0 && (
              <Card className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reviews yet</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Profile Info */}
            {hostProfile && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Host Details
                </h3>
                <div className="space-y-3 text-sm">
                  {hostProfile.typicalDishCount && (
                    <div>
                      <p className="text-muted-foreground">Typical Dish Count</p>
                      <p className="font-medium">{hostProfile.typicalDishCount} dishes</p>
                    </div>
                  )}
                  {hostProfile.kitchenSize && (
                    <div>
                      <p className="text-muted-foreground">Kitchen Size</p>
                      <p className="font-medium capitalize">{hostProfile.kitchenSize}</p>
                    </div>
                  )}
                  {hostProfile.hasDishwasherMachine !== null && (
                    <div>
                      <p className="text-muted-foreground">Dishwasher Machine</p>
                      <p className="font-medium">{hostProfile.hasDishwasherMachine ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Dishwasher Profile Info */}
            {dishwasherProfile && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Dishwasher Details
                </h3>
                <div className="space-y-3 text-sm">
                  {dishwasherProfile.experienceYears && (
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium">{dishwasherProfile.experienceYears} years</p>
                    </div>
                  )}
                  {dishwasherProfile.workRangeKm && (
                    <div>
                      <p className="text-muted-foreground">Travel Distance</p>
                      <p className="font-medium">Up to {dishwasherProfile.workRangeKm} km</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <FlagPhotoDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        onSubmit={handleFlagPhoto}
      />
    </div>
  );
}
