import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, UtensilsCrossed, Clock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseSessions() {
  const { data: sessions, isLoading } = trpc.sessions.getOpen.useQuery();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Browse Available Sessions</h1>
          <p className="text-muted-foreground">
            Find dishwashing opportunities near you and earn free meals!
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">
                      {session.mealDescription || 'Dishwashing Session'}
                    </CardTitle>
                    <Badge variant="secondary">{session.status}</Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {session.estimatedDurationMinutes} minutes
                    </div>
                    {session.dishCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <UtensilsCrossed className="w-4 h-4" />
                        ~{session.dishCount} dishes
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.specialInstructions && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.specialInstructions}
                    </p>
                  )}
                  <Button asChild className="w-full">
                    <Link href={`/session/${session.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Sessions Available</h3>
              <p className="text-muted-foreground mb-6">
                There are no open dishwashing sessions at the moment. Check back later!
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
