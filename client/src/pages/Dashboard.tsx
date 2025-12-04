import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { UtensilsCrossed, User, Calendar, Star, Bell, MessageSquare, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: dishwasherProfile, isLoading: loadingDishwasher } = trpc.dishwasher.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: hostProfile, isLoading: loadingHost } = trpc.host.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: hostSessions, isLoading: loadingHostSessions } = trpc.sessions.getMyHostSessions.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: dishwasherSessions, isLoading: loadingDishwasherSessions } = trpc.sessions.getMyDishwasherSessions.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: notifications } = trpc.notifications.getMyNotifications.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasProfiles = dishwasherProfile || hostProfile;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name || user.email}!</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Profile Setup Prompt */}
        {!hasProfiles && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Set up your profile to start using DishSwap. Choose whether you want to be a dishwasher, host, or both!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/setup-profile">Set Up Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {hasProfiles && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/browse">
                <Calendar className="w-5 h-5 mr-2" />
                Browse Sessions
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/messages">
                <MessageSquare className="w-5 h-5 mr-2" />
                Messages
              </Link>
            </Button>
            {(user.userType === 'host' || user.userType === 'both') && (
              <Button asChild className="h-auto py-4">
                <Link href="/create-session">
                  <UtensilsCrossed className="w-5 h-5 mr-2" />
                  Create Session
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Type</CardTitle>
              <User className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user.userType || 'Not Set'}</div>
            </CardContent>
          </Card>

          {dishwasherProfile && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dishes Done</CardTitle>
                <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dishwasherProfile.totalDishesDone}</div>
              </CardContent>
            </Card>
          )}

          {hostProfile && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions Hosted</CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hostProfile.totalSessionsHosted}</div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dishwasherProfile?.averageRating 
                  ? (dishwasherProfile.averageRating / 100).toFixed(1)
                  : hostProfile?.averageRating 
                  ? (hostProfile.averageRating / 100).toFixed(1)
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="sessions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="sessions">My Sessions</TabsTrigger>
                <TabsTrigger value="browse">Browse</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="space-y-4">
                {user.userType === 'host' || user.userType === 'both' ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Sessions I'm Hosting</CardTitle>
                        <Button asChild size="sm">
                          <Link href="/create-session">Create Session</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingHostSessions ? (
                        <div className="space-y-2">
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </div>
                      ) : hostSessions && hostSessions.length > 0 ? (
                        <div className="space-y-2">
                          {hostSessions.slice(0, 5).map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{session.mealDescription || 'Session'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.scheduledDate).toLocaleDateString()} • {session.status}
                                </p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/session/${session.id}`}>View</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No sessions yet</p>
                      )}
                    </CardContent>
                  </Card>
                ) : null}

                {user.userType === 'dishwasher' || user.userType === 'both' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Dishwashing Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingDishwasherSessions ? (
                        <div className="space-y-2">
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </div>
                      ) : dishwasherSessions && dishwasherSessions.length > 0 ? (
                        <div className="space-y-2">
                          {dishwasherSessions.slice(0, 5).map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{session.mealDescription || 'Session'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.scheduledDate).toLocaleDateString()} • {session.status}
                                </p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/session/${session.id}`}>View</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No sessions yet</p>
                      )}
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="browse">
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Available Sessions</CardTitle>
                    <CardDescription>Find dishwashing opportunities near you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/browse-sessions">Browse All Sessions</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif: any) => (
                      <div key={notif.id} className={`p-3 rounded-lg border ${notif.isRead ? 'bg-muted/30' : 'bg-primary/5'}`}>
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      </div>
                    ))}
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/notifications">View All</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                {(user.userType === 'host' || user.userType === 'both') && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/create-session">
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Session
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/browse-sessions">
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Browse Sessions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
