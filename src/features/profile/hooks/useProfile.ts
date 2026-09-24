import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';

import { getMe, updateMe } from '../api/profileApi';
import { profileKeys } from '../api/queryKeys';

export function useMyProfile() {
  const isAuthed = Boolean(useAuthStore((s) => s.accessToken));
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
    enabled: isAuthed,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => queryClient.setQueryData(profileKeys.me, updated),
  });
}
