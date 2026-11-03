import { AuthProvider } from '@/features/auth/auth-provider';
import { BiometricLockProvider } from '@/features/biometrics/biometric-lock-provider';
import { NotificationProvider } from '@/features/notifications/notification-provider';
import { PushRegistrationProvider } from '@/features/notifications/push-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AppThemeProvider } from '@/theme/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <BiometricLockProvider>
            <PushRegistrationProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </PushRegistrationProvider>
          </BiometricLockProvider>
        </AuthProvider>
      </QueryProvider>
    </AppThemeProvider>
  );
}
