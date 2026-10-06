import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@handycraft/shared';

interface VerifyOtpResponse {
  user: User;
  accessToken: string;
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => api.post<{ message: string }>('/auth/send-otp', { phone }),
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      api.post<VerifyOtpResponse>('/auth/verify-otp', { phone, otp }),
    onSuccess(data) {
      setAuth(data.user, data.accessToken);
      // Redirect based on role
      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'SELLER') navigate('/seller/orders');
      else navigate('/');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post<{ message: string }>('/auth/logout', {}),
    onSuccess() {
      logout();
      navigate('/auth/login');
    },
    onError() {
      // Clear local state even if server call fails
      logout();
      navigate('/auth/login');
    },
  });
}
