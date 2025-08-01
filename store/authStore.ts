import { create } from 'zustand';
import { authApi, AuthResponse } from '../api/authApi';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  register: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  signIn: (data: { phone: string; password: string }) => Promise<{ success: boolean; message: string }>;
  verifyPhone: (data: { phone: string; verificationCode: string }) => Promise<{ success: boolean; message: string }>;
  resendVerification: (phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Actions
  register: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AuthResponse = await authApi.register(data);
      
      if (response.success) {
        set({ 
          isLoading: false,
          error: null 
        });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Registration failed' 
        });
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  signIn: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AuthResponse = await authApi.signIn(data);
      
      if (response.success && response.data?.user && response.data?.accessToken && response.data?.refreshToken) {
        set({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Sign in failed' 
        });
        return { success: false, message: response.message || 'Sign in failed' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  verifyPhone: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AuthResponse = await authApi.verifyPhone(data);
      
      if (response.success && response.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Phone verification failed' 
        });
        return { success: false, message: response.message || 'Phone verification failed' };
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  resendVerification: async (phone) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: AuthResponse = await authApi.resendVerification(phone);
      
      set({ isLoading: false, error: null });
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Resend verification error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  logout: async () => {
    const { accessToken } = get();
    
    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
  },
})); 