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
    /*
    const response = await apiRequest("POST", "/api/auth/register/", data); // /api/auth/register
    const result = await response.json();
    return result;
    */
    /*
    const credentials = {
    email: "tariqnassiru@gmail.com",
    password: "root"
    };

    
    const response = await fetch("/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Token request failed:", error);
      return error;
    }

    const tokendata = await response.json();
    //tokendata.access || tokendata.token; 
    */
    
    
    const userdata = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    password: formData.password,
    confirm_password: formData.password,
    contact: formData.phone
    };
    
    /*
    const userdata = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.password,
    contact: formData.contact
    };*/
    


    const signup_response = await fetch("https://deenaber.pythonanywhere.com/auth/signup/admin/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userdata)
    });

    console.log(signup_response)

    /*
    if (!signup_response.ok) {
      const error = await signup_response.json();
      console.error("Signup failed:", error);
      return error;
    }
    */

    const result = await signup_response.json();
    console.log("Signup successful:", result);
    return result;
    
    console.log("Sign up:", formData);
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
