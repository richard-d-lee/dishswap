import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, Star, Calendar, UtensilsCrossed, User, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dishwasherProfile, isLoading: loadingDishwasher } = trpc.dishwasher.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: hostProfile, isLoading: loadingHost } = trpc.host.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  // Ratings feature to be implemented
  const ratings: any[] = [];

  if (authLoading || loadingDishwasher || loadingHost) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-4xl py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const averageRating = ratings && ratings.length > 0
    ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
    : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/setup-profile">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-8 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {user.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.name || "Profile"}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{user.name || "User"}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {user.userType && (
                      <Badge variant="secondary">{user.userType}</Badge>
                    )}
                    {user.emailVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </CardHeader>
        </Card>

        {/* Dishwasher Profile */}
        {dishwasherProfile && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                <CardTitle>Dishwasher Profile</CardTitle>
              </div>
              <CardDescription>Your dishwashing service information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{dishwasherProfile.isAvailable ? "Available" : "Not available"}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Work Range</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{dishwasherProfile.workRangeKm ? `${Math.round(dishwasherProfile.workRangeKm * 0.621371)} miles` : "Not specified"}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Host Profile */}
        {hostProfile && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                <CardTitle>Host Profile</CardTitle>
              </div>
              <CardDescription>Your hosting information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {hostProfile.addressLine1 || "Address not set"}
                    {hostProfile.city && `, ${hostProfile.city}`}
                    {hostProfile.state && `, ${hostProfile.state}`}
                    {hostProfile.postalCode && ` ${hostProfile.postalCode}`}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Ratings & Reviews */}
        {ratings && ratings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>What others are saying about you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratings.slice(0, 5).map((rating: any) => (
                <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rating.raterName || "Anonymous"}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-muted-foreground">{rating.review}</p>
                  )}
                </div>
              ))}
              {ratings.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Reviews ({ratings.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Profile Setup */}
        {!dishwasherProfile && !hostProfile && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-muted-foreground text-center mb-6">
                Set up your profile to start using DishSwap
              </p>
              <Button asChild>
                <Link href="/setup-profile">Set Up Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
