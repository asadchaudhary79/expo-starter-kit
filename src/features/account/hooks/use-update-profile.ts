import { useMutation } from '@tanstack/react-query';

import type { UpdateProfileInput, UpdateProfileResponse } from '@/features/account/profile-contract';
import { apiRequest } from '@/lib/api/api-client';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiRequest<UpdateProfileResponse>('/api/protected/profile', {
        method: 'PATCH',
        body: input,
      }),
  });
}
