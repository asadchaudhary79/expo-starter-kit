import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActionSheetIOS, Alert, Image, Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useUpdateProfile } from '@/features/account/hooks/use-update-profile';
import { updateProfileSchema, type UpdateProfileInput } from '@/features/account/profile-contract';
import { useAuth } from '@/features/auth/auth-provider';
import { ApiError } from '@/lib/api/api-client';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

export default function EditProfileScreen() {
  const { refreshSession, user } = useAuth();
  const { colors, motion, radius, spacing } = useAppTheme();
  const updateProfile = useUpdateProfile();
  const [photoUri, setPhotoUri] = useState<string | null>(user?.image ?? null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
    },
    mode: 'onChange',
  });

  function openPhotoOptions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: photoUri
            ? ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo']
            : ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: photoUri ? 3 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void takePhoto();
          if (buttonIndex === 2) void chooseFromLibrary();
          if (buttonIndex === 3 && photoUri) clearPhoto();
        },
      );
      return;
    }

    const buttons = [
      { text: 'Take Photo', onPress: () => void takePhoto() },
      { text: 'Choose from Library', onPress: () => void chooseFromLibrary() },
      ...(photoUri ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: clearPhoto }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ];

    Alert.alert('Profile Photo', undefined, buttons);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      appToast.error('Camera permission needed');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function chooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      appToast.error('Photos permission needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function clearPhoto() {
    setPhotoUri(null);
  }

  async function submit(values: UpdateProfileInput) {
    try {
      await updateProfile.mutateAsync(values);
      await refreshSession();
      appToast.success('Profile updated');
      router.back();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'USERNAME_TAKEN') {
        setError('username', { message: error.message }, { shouldFocus: true });
        return;
      }

      appToast.error('Couldn’t save profile', {
        description: error instanceof ApiError ? error.message : 'Check your connection and try again.',
      });
    }
  }

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <AppText tone="muted">Update how your name and username appear in the app.</AppText>

      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={openPhotoOptions}
          style={({ pressed }) => ({ opacity: pressed ? motion.opacity.pressed : 1 })}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 96,
                height: 96,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.pill,
                backgroundColor: colors.primarySoft,
              }}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: 96, height: 96 }} />
              ) : (
                <AppText variant="title" tone="primary">
                  {initials(user?.name)}
                </AppText>
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.pill,
                backgroundColor: colors.primary,
                borderWidth: 2,
                borderColor: colors.surface,
              }}>
              <Icon name="camera" size={14} color={colors.primaryForeground} />
            </View>
          </View>
        </Pressable>

        <Button label="Change photo" variant="outline" size="sm" fullWidth={false} onPress={openPhotoOptions} />
      </Card>

      <Card>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              accessibilityLabel="Name"
              label="Name"
              placeholder="Your name"
              leftIcon="person"
              value={value}
              error={fieldState.error?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="name"
            />
          )}
        />
        <Controller
          control={control}
          name="username"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              accessibilityLabel="Username"
              label="Username"
              placeholder="your_username"
              leftIcon="person"
              value={value}
              error={fieldState.error?.message}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text.toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
            />
          )}
        />
        <View style={{ gap: spacing.xs }}>
          <AppText variant="caption" tone="muted">
            Email
          </AppText>
          <AppText>{user?.email}</AppText>
          <AppText variant="caption" tone="muted">
            Email changes need a separate verification flow.
          </AppText>
        </View>
      </Card>

      <Button
        label="Save changes"
        loading={isSubmitting}
        disabled={!isValid || !isDirty}
        onPress={() => void handleSubmit(submit)()}
      />
    </Screen>
  );
}

function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return 'U';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
