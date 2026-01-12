import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// --- Auth Types ---
interface SignupPayload {
  fullname: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    token?: string;
  };
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// --- Contest Types ---
export interface Contest {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  totalPoints?: number;
}

interface CreateContestPayload {
  title: string;
  description: string;
  startDate: Date; // or string
  startTime: string;
  endTime: string;
  questionIds: string[];
}

// --- Question Types ---
interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  questionId?: string;
}

export interface Question {
  id: string; 
  text: string;
  type: 'MCQ' | 'DSA';
  points: number;
  options?: Option[];
}

interface CreateQuestionPayload {
  text: string;
  type: 'MCQ' | 'DSA';
  points: number;
  options?: {
    text: string;
    isCorrect: boolean;
    questionId: string; // Zod schema requires this...
  }[];
}

// --- Auth Hooks ---

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      // NOTE: Using POST even though route file said GET, because GET with body is non-standard.
      const { data } = await api.post<AuthResponse>('/auth/signup', payload);
      return data;
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      // NOTE: If backend doesn't set cookie, we might need to store token.
      // The controller snippet for signup didn't show token generation.
      // I need to check login controller implementation.
      return data;
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');
      return data.data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
    },
  });
}

// --- Contest Hooks ---

export function useContests() {
  return useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Contest[] }>('/contests');
      return data.data;
    },
  });
}

export function useContest(id: string) {
  return useQuery({
    queryKey: ['contests', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Contest & { questions: { question: Question }[], totalPoints: number } }>(`/contests/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateContestPayload) => {
      const { data } = await api.post('/contests/create', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateContestPayload }) => {
      const { data } = await api.put(`/contests/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['contests', id] });
    },
  });
}

// --- Question Hooks ---

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Question[] }>('/questions');
      return data.data;
    },
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Question }>(`/questions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateQuestionPayload) => {
      const { data } = await api.post('/questions/create', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateQuestionPayload }) => {
      const { data } = await api.put(`/questions/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', id] });
    },
  });
}
