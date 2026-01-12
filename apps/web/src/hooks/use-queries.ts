import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// --- Types ---
// Minimal types for now
interface AuthPayload {
    email: string;
    password: string;
}

// --- Auth ---
export function useSignup() {
  return useMutation({
    mutationFn: (data: any) => api.post('/auth/signup', data).then(res => res.data),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AuthPayload) => api.post('/auth/login', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then(res => res.data),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(res => res.data.data),
    retry: false,
  });
}

// --- Contests ---
export function useContests() {
  return useQuery({
    queryKey: ['contests'],
    queryFn: () => api.get('/contests').then(res => res.data.data),
  });
}

export function useContestForAttempt(id: string) {
    return useQuery({
        queryKey: ['contest-attempt', id],
        queryFn: () => api.get(`/contests/${id}/attempt`).then(res => res.data.data),
        enabled: !!id,
    });
}

// --- Submission ---
export function useStartContest() {
  return useMutation({
    mutationFn: (contestId: string) => api.post(`/contests/${contestId}/start`).then(res => res.data.data),
  });
}

export function useSubmitContest() {
    return useMutation({
        mutationFn: ({ contestId, answers }: { contestId: string, answers: any }) => 
            api.post(`/contests/${contestId}/submit`, { answers }).then(res => res.data.data),
    });
}

export function useMySubmissions() {
    return useQuery({
        queryKey: ['my-submissions'],
        queryFn: () => api.get('/auth/me/submissions').then(res => res.data.data),
    });
}
