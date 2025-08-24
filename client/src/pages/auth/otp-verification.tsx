import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { authApi, setStoredToken } from "@/lib/auth";
import { otpVerificationSchema, type OTPVerificationData } from "@shared/schema";
import { Shield, ArrowLeft } from "lucide-react";

export default function OTPVerification() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { setAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  // Get email from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const email = urlParams.get('email') || 'tariqnassiru@gmail.com';

  const form = useForm<OTPVerificationData>({
    //resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email,
      otpCode: "",
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-focus and navigation between OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Update form value
    const otpCode = newOtpValues.join('');
    form.setValue('otpCode', otpCode);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: (data) => {
      //setStoredToken(data.token);
      //setAdmin(data.admin);
      setLocation("/dashboard");
      toast({
        title: "Account verified successfully",
        description: "Welcome to CClient Admin Dashboard",
      });
      
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive",
      });
      // Clear OTP inputs on error
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => authApi.resendOTP(email),
    onSuccess: () => {
      toast({
        title: "OTP resent",
        description: "Check your email for the new verification code",
      });
      setTimeLeft(300); // Reset timer
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OTPVerificationData) => {
    verifyOtpMutation.mutate(data);
    if (data.otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }
    
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /*
  if (!email) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">No email provided for verification</p>
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Back to Registration
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="sidebar-bg text-white rounded-lg p-3 inline-block mb-4">
              <Shield className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Account</h1>
            <p className="text-gray-600">Enter the 6-digit code sent to your email</p>
            <p className="text-sm text-gray-500 mt-1">{email}</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otpValues.map((value, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={() => resendOtpMutation.mutate()}
                  disabled={timeLeft > 0 || resendOtpMutation.isPending}
                  className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                >
                  {resendOtpMutation.isPending ? "Sending..." : "Resend Code"}
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Code expires in{" "}
                <span className={`font-medium ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={verifyOtpMutation.isPending || otpValues.join('').length !== 6}>

              {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
