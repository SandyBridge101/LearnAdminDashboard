import { apiRequest } from "./queryClient";
import type { 
  LoginData, 
  InsertAdmin, 
  OTPVerificationData,
  PasswordResetRequestData 
} from "@shared/schema";

export interface AuthResponse {
  token: string;
  admin: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const authApi = {
  async login(formData: LoginData): Promise<AuthResponse> {
    
    const response = await apiRequest("POST", "/api/auth/login", formData);
    const result = await response.json();
    return result;

  },

  async register(formData: InsertAdmin): Promise<{ message: string; email: string }> {
    
    const response = await apiRequest("POST", "/api/auth/register/", formData); // /api/auth/register
    const result = await response.json();
    return result;
    

  },

  async verifyOTP(data: OTPVerificationData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/verify-otp", data);
    const result = await response.json();
    return result;
  },

  async resendOTP(email: string): Promise<{ message: string }> {
    const response = await apiRequest("POST", "/api/auth/resend-otp", { email });
    const result = await response.json();
    return result;
  },

  async forgotPassword(data: PasswordResetRequestData): Promise<{ message: string }> {
    const response = await apiRequest("POST", "/api/auth/forgot-password", data);
    const result = await response.json();
    return result;
  },

  async getCurrentUser(): Promise<{ admin: AuthResponse['admin'] }> {
    const response = await apiRequest("GET", "/api/auth/me");
    const result = await response.json();
    return result;
  },
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};
