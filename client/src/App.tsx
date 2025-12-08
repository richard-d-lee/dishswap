import { Toaster } from "@/components/ui/sonner";
import { OnboardingTour } from "@/components/OnboardingTour";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SessionDetail from "./pages/SessionDetail";
import Messages from "./pages/Messages";
import RateUser from "./pages/RateUser";
import CreateSession from "./pages/CreateSession";
import Dashboard from "./pages/Dashboard";
import SetupProfile from "./pages/SetupProfile";
import BrowseSessions from "./pages/BrowseSessions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import AuthCallback from "@/pages/AuthCallback";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import AdminModeration from "@/pages/AdminModeration";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/setup-profile"} component={SetupProfile} />
      <Route path={"/browse"} component={BrowseSessions} />
      <Route path={"/sessions/:id"} component={SessionDetail} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/rate/:userId/:sessionId"} component={RateUser} />
      <Route path={"/create-session"} component={CreateSession} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path="/profile" component={Profile} />
          <Route path="/user/:id" component={UserProfile} />
          <Route path="/admin/moderation" component={AdminModeration} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <OnboardingTour />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
