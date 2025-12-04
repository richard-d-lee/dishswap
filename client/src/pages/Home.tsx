import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { UtensilsCrossed, Users, Star, MapPin, Shield, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <UtensilsCrossed className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DishSwap
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground">
              Trade Dishwashing for Delicious Meals
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with local food lovers. Dishwashers get free meals, hosts get clean kitchens. 
              A community built on sharing, trust, and great food.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <a href={getLoginUrl()}>Get Started</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#how-it-works">Learn More</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Create Your Profile</CardTitle>
                <CardDescription>
                  Sign up as a dishwasher, host, or both. Set your preferences, location, and availability.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Find Matches</CardTitle>
                <CardDescription>
                  Browse nearby opportunities or get matched based on food preferences, location, and ratings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Swap & Enjoy</CardTitle>
                <CardDescription>
                  Complete the session, rate your experience, and build your reputation in the community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">For Dishwashers</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Free Delicious Meals</h3>
                    <p className="text-muted-foreground">Enjoy home-cooked food from talented local chefs</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Set Your Range</h3>
                    <p className="text-muted-foreground">Choose how far you're willing to travel</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Manage Allergies</h3>
                    <p className="text-muted-foreground">List your dietary restrictions and allergies</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold">For Hosts</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Clean Kitchen</h3>
                    <p className="text-muted-foreground">Get help with dishes after cooking</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Share Your Cooking</h3>
                    <p className="text-muted-foreground">Showcase your food specialties and get rated</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Flexible Scheduling</h3>
                    <p className="text-muted-foreground">Post sessions when it works for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground">
              Join our community of food lovers and dishwashers today. It's completely free!
            </p>
            {!isAuthenticated && (
              <Button asChild size="lg">
                <a href={getLoginUrl()}>Sign Up Now</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                DishSwap
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting communities through food and service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse-sessions">Browse Sessions</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/safety">Safety Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Support</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 DishSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
