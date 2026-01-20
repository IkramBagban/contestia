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
      queryClient.clear(); // Clear EVERYTHING on login to avoid any cache leakage
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then(res => res.data),
    onSuccess: () => {
      queryClient.clear(); // Wipe entire cache on logout
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
    queryFn: () => api.get('/contests?limit=50').then(res => res.data.data),
  });
}

export function useContestForAttempt(id: string) {
  const { data: user } = useMe();
  const userId = user?.id || 'guest';

  return useQuery({
    queryKey: ['contest-attempt', id, userId], // Isolated by user to prevent crosstalk
    queryFn: () => api.get(`/contests/${id}/attempt`).then(res => res.data.data),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute stale time
  });
}

// --- Submission ---
export function useStartContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => api.post(`/contests/${contestId}/start`).then(res => res.data.data),
    onSuccess: (_, contestId) => {
      // Invalidate the attempt data so subsequent pages get the fresh submission
      const user = queryClient.getQueryData<any>(['me']);
      const userId = user?.id || 'guest';
      queryClient.invalidateQueries({ queryKey: ['contest-attempt', contestId, userId] });
    }
  });
}

export function useSubmitContest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, answers }: { contestId: string, answers: any }) =>
      api.post(`/contests/${contestId}/submit`, { answers }).then(res => res.data.data),
    onSuccess: (_, variables) => {
      // Robustly invalidate everything related to this contest attempt for the current user
      queryClient.invalidateQueries({ queryKey: ['contest-attempt', variables.contestId] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    }
  });
}

export function useSaveProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, questionId, answer }: { contestId: string; questionId: string; answer: any }) =>
      api.put(`/contests/${contestId}/progress`, { questionId, answer }).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contest-attempt', variables.contestId] });
    }
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => api.get('/auth/me/submissions').then(res => res.data.data),
  });
}

// --- Code Execution (Judge0) ---
export interface RunCodeResult {
  passed: number;
  failed: number;
  total: number;
  results: {
    testCaseId: string;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error: string | null;
    executionTime: string | null;
  }[];
  compilationError: string | null;
}

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => api.get('/judge0/languages').then(res => res.data),
    staleTime: Infinity, // Languages don't change
  });
}

export function useRunCode() {
  return useMutation({
    mutationFn: ({ languageId, code, questionId }: { languageId: number; code: string; questionId: string }) =>
      api.post<RunCodeResult>('/judge0/run-code', { languageId, code, questionId }).then(res => res.data),
  });
}

export function useSubmitCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ languageId, code, questionId, contestId }: { languageId: number; code: string; questionId: string; contestId: string }) =>
      api.post<RunCodeResult & { score?: number; pointsEarned: number; submitted: boolean }>('/judge0/submit-code', { languageId, code, questionId, contestId }).then(res => res.data),
    onSuccess: (_, variables) => {
      const userId = queryClient.getQueryData<any>(['me'])?.id || 'guest';
      queryClient.invalidateQueries({ queryKey: ['contest-attempt', variables.contestId, userId] });
    }
  });
}
