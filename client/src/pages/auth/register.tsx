import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { insertAdminSchema, type InsertAdmin } from "@shared/schema";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertAdmin & { confirmPassword: string }>({
    resolver: zodResolver(
      insertAdminSchema.extend({
        confirmPassword: insertAdminSchema.shape.password,
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
    ),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Please check your email for verification code",
      });
      setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      //setLocation(`/login`);
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAdmin & { confirmPassword: string }) => {
    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...adminData } = data;
    registerMutation.mutate(adminData);
  };

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="sidebar-bg text-white rounded-lg p-3 inline-block mb-4">
              <UserPlus className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join CClient Admin Dashboard</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="form-input"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="form-input"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="form-input"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="form-input"
                {...form.register("phone")}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="form-input"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="form-input"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={registerMutation.isPending || !agreedToTerms}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
