import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { UtensilsCrossed, Home } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

export default function SetupProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"dishwasher" | "host" | "both">("dishwasher");
  
  // User profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  
  // Dishwasher fields
  const [workRangeKm, setWorkRangeKm] = useState(10);
  const [experienceYears, setExperienceYears] = useState(0);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  
  // Host fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [hostCity, setHostCity] = useState("");
  const [hostState, setHostState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [hostCountry, setHostCountry] = useState("");
  const [typicalDishCount, setTypicalDishCount] = useState(0);
  const [kitchenSize, setKitchenSize] = useState<"small" | "medium" | "large">("medium");
  const [hasDishwasherMachine, setHasDishwasherMachine] = useState(false);

  const updateUserMutation = trpc.users.updateProfile.useMutation();
  const createDishwasherMutation = trpc.dishwasher.createProfile.useMutation();
  const createHostMutation = trpc.host.createProfile.useMutation();

  const handleSubmit = async () => {
    try {
      // Upload profile photo if selected
      let photoUrl: string | undefined;
      if (profilePhoto) {
        const formData = new FormData();
        formData.append('file', profilePhoto);
        
        const uploadResponse = await fetch('/api/upload-profile-photo', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          photoUrl = url;
        }
      }

      // Update user profile
      await updateUserMutation.mutateAsync({
        firstName,
        lastName,
        phone,
        bio,
        userType,
      });

      // Create dishwasher profile if needed
      if (userType === "dishwasher" || userType === "both") {
        await createDishwasherMutation.mutateAsync({
          workRangeKm,
          experienceYears,
          city,
          state,
          country,
        });
      }

      // Create host profile if needed
      if (userType === "host" || userType === "both") {
        await createHostMutation.mutateAsync({
          addressLine1,
          addressLine2,
          city: hostCity,
          state: hostState,
          postalCode,
          country: hostCountry,
          typicalDishCount,
          kitchenSize,
          hasDishwasherMachine,
        });
      }

      toast.success("Profile created successfully!");
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Up Your Profile</h1>
          <p className="text-muted-foreground">
            Let's get you started on DishSwap. This will only take a few minutes.
          </p>
        </div>

        {/* Step 1: Choose User Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
              <CardDescription>Choose how you want to participate in DishSwap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={userType} onValueChange={(v) => setUserType(v as any)}>
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="dishwasher" id="dishwasher" />
                  <div className="flex-1">
                    <Label htmlFor="dishwasher" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Dishwasher</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I want to wash dishes in exchange for free meals
                      </p>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="host" id="host" />
                  <div className="flex-1">
                    <Label htmlFor="host" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-secondary" />
                        <span className="font-semibold">Host</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I want to offer meals in exchange for dishwashing help
                      </p>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="both" id="both" />
                  <div className="flex-1">
                    <Label htmlFor="both" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          <UtensilsCrossed className="w-5 h-5 text-primary" />
                          <Home className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="font-semibold">Both</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I want to do both - host and wash dishes
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Button onClick={() => setStep(2)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us a bit about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <ImageUpload
                  onImageSelected={(file) => setProfilePhoto(file)}
                  onImageRemoved={() => setProfilePhoto(null)}
                  label="Add your photo"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Role-Specific Information */}
        {step === 3 && (
          <div className="space-y-6">
            {(userType === "dishwasher" || userType === "both") && (
              <Card>
                <CardHeader>
                  <CardTitle>Dishwasher Profile</CardTitle>
                  <CardDescription>Set up your dishwashing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workRange">Work Range (km)</Label>
                    <Input
                      id="workRange"
                      type="number"
                      value={workRangeKm}
                      onChange={(e) => setWorkRangeKm(parseInt(e.target.value) || 0)}
                      placeholder="10"
                    />
                    <p className="text-sm text-muted-foreground">
                      How far are you willing to travel?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {(userType === "host" || userType === "both") && (
              <Card>
                <CardHeader>
                  <CardTitle>Host Profile</CardTitle>
                  <CardDescription>Tell us about your kitchen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostCity">City</Label>
                      <Input
                        id="hostCity"
                        value={hostCity}
                        onChange={(e) => setHostCity(e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostState">State/Province</Label>
                      <Input
                        id="hostState"
                        value={hostState}
                        onChange={(e) => setHostState(e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="94102"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostCountry">Country</Label>
                      <Input
                        id="hostCountry"
                        value={hostCountry}
                        onChange={(e) => setHostCountry(e.target.value)}
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dishCount">Typical Dish Count</Label>
                    <Input
                      id="dishCount"
                      type="number"
                      value={typicalDishCount}
                      onChange={(e) => setTypicalDishCount(parseInt(e.target.value) || 0)}
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kitchen Size</Label>
                    <RadioGroup value={kitchenSize} onValueChange={(v) => setKitchenSize(v as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small">Small</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large">Large</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasDishwasher"
                      checked={hasDishwasherMachine}
                      onChange={(e) => setHasDishwasherMachine(e.target.checked)}
                      className="rounded border-input"
                    />
                    <Label htmlFor="hasDishwasher">I have a dishwasher machine</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={updateUserMutation.isPending || createDishwasherMutation.isPending || createHostMutation.isPending}
              >
                {updateUserMutation.isPending || createDishwasherMutation.isPending || createHostMutation.isPending
                  ? "Creating Profile..."
                  : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
