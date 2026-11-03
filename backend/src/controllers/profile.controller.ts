import { eq } from 'drizzle-orm';

import { getDatabase } from '../db';
import { user } from '../db/auth-schema';
import { errorResponse } from '../lib/api-response';
import { reportServerError } from '../lib/report-error';
import { getAuth } from '../modules/auth/auth-server';
import { updateProfileSchema, type UpdateProfileResponse } from '../modules/profile/profile-contract';

export async function PATCH(request: Request) {
  try {
    return await updateProfile(request);
  } catch {
    reportServerError({ event: 'profile.update-failed' });
    return errorResponse(500, 'PROFILE_UPDATE_FAILED', 'We could not update your profile. Please try again.');
  }
}

async function updateProfile(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });

  if (!session) {
    return errorResponse(401, 'UNAUTHORIZED', 'Sign in to edit your profile.');
  }

  if (!session.user.onboardingCompleted) {
    return errorResponse(403, 'PROFILE_INCOMPLETE', 'Complete your profile to continue.');
  }

  const body = await readJson(request);
  const result = updateProfileSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(400, 'INVALID_PROFILE', result.error.issues[0]?.message ?? 'Check your profile details.');
  }

  let updatedUser;

  try {
    [updatedUser] = await getDatabase()
      .update(user)
      .set({
        name: result.data.name,
        username: result.data.username,
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      return errorResponse(409, 'USERNAME_TAKEN', 'That username is already taken. Try another one.');
    }

    throw error;
  }

  if (!updatedUser?.username) {
    return errorResponse(404, 'ACCOUNT_NOT_FOUND', 'We could not update your profile. Please sign in again.');
  }

  const response: UpdateProfileResponse = {
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
    },
  };

  return Response.json(response, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

function isUniqueConstraintViolation(error: unknown) {
  let current = error;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!current || typeof current !== 'object') return false;
    if ('code' in current && current.code === '23505') return true;
    current = 'cause' in current ? current.cause : null;
  }

  return false;
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
