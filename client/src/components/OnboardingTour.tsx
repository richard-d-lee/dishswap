// Onboarding tour for new users
import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import { useAuth } from "@/_core/hooks/useAuth";

const TOUR_COMPLETED_KEY = "dishswap-tour-completed";

const steps: Step[] = [
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Welcome to DishSwap!</h2>
        <p>Let's take a quick tour to help you get started.</p>
      </div>
    ),
    placement: "center",
  },
  {
    target: '[href="/dashboard"]',
    content: "This is your dashboard where you can see all your sessions and activities.",
  },
  {
    target: '[href="/browse"]',
    content: "Browse available dishwashing sessions here. You can search and filter to find opportunities that match your preferences.",
  },
  {
    target: '[href="/create-session"]',
    content: "If you're a host, click here to create a new dishwashing session and get help with your dishes!",
  },
  {
    target: '[href="/messages"]',
    content: "Check your messages here to communicate with hosts or dishwashers.",
  },
  {
    target: '[href="/notifications"]',
    content: "Stay updated with notifications about your sessions, applications, and ratings.",
  },
  {
    target: '[href="/profile"]',
    content: "Manage your profile, photos, and preferences here. A complete profile helps you get more matches!",
  },
  {
    target: "body",
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">You're all set!</h2>
        <p>Start exploring sessions or create your first listing. Happy DishSwapping!</p>
      </div>
    ),
    placement: "center",
  },
];

export function OnboardingTour() {
  const { user } = useAuth();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if user is logged in and hasn't completed the tour
    if (user) {
      const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
      if (!tourCompleted) {
        // Delay tour start to ensure DOM is ready
        const timer = setTimeout(() => {
          setRunTour(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    }
  };

  if (!user || !runTour) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#e07a5f",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
        },
        buttonNext: {
          backgroundColor: "#e07a5f",
          borderRadius: "6px",
        },
        buttonBack: {
          color: "#666",
        },
      }}
    />
  );
}

// Function to manually trigger the tour (can be called from settings or help menu)
export function restartOnboardingTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  window.location.reload();
}
