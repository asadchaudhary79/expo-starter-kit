import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(80, 'Name must contain at most 80 characters'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must contain at least 3 characters')
    .max(24, 'Username must contain at most 24 characters')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Use lowercase letters, numbers, or underscores, starting with a letter',
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UpdateProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
};
