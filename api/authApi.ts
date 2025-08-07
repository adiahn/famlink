import { API_BASE_URL } from '../config/api';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  email: string;
  gender?: string;
}

export interface SignInRequest {
  phone: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      isVerified: boolean;
    };
    userId?: string;
    verificationRequired?: boolean;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthApi {
  private baseUrl = `${API_BASE_URL}/auth`;

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Register response:', result);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Sign in response:', result);
      
      // Debug token format
      if (result.success && result.data?.accessToken) {
        console.log('Received access token:', result.data.accessToken.substring(0, 20) + '...');
        console.log('Full access token:', result.data.accessToken);
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Email verification response:', result);
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerification(phone: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();
      console.log('Resend verification response:', result);
      return result;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Refresh token response:', result);
      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Logout response:', result);
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export const authApi = new AuthApi(); 