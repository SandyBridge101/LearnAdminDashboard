import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";

// Auth pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import OTPVerification from "@/pages/auth/otp-verification";
import ForgotPassword from "@/pages/auth/forgot-password";

// Dashboard pages
import DashboardLayout from "@/components/layout/dashboard-layout";
import Dashboard from "@/pages/dashboard/index";
import Learners from "@/pages/dashboard/learners";
import Tracks from "@/pages/dashboard/tracks";
import Courses from "@/pages/dashboard/courses";
import Invoices from "@/pages/dashboard/invoices";
import Reports from "@/pages/dashboard/reports";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-otp" component={OTPVerification} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Protected dashboard routes */}
      <Route path="/">
        <AuthGuard>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard">
        <AuthGuard>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/learners">
        <AuthGuard>
          <DashboardLayout>
            <Learners />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/tracks">
        <AuthGuard>
          <DashboardLayout>
            <Tracks />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/courses">
        <AuthGuard>
          <DashboardLayout>
            <Courses />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/invoices">
        <AuthGuard>
          <DashboardLayout>
            <Invoices />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      <Route path="/reports">
        <AuthGuard>
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        </AuthGuard>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
