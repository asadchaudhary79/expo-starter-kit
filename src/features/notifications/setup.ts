import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { ACTION_CATEGORY, MARK_READ, backgroundId, readActionId } from './actions';
import { saveResult } from './action-store';

const NOTIFICATION_TASK_NAME = 'starter-notification-work';
export let notificationSetupError: string | null = null;

function recordSetupError() {
  notificationSetupError = 'Notification actions could not start. Rebuild the native app, then reopen it.';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleReadAction(response: Notifications.NotificationResponse) {
  const id = readActionId(response);
  if (id) void saveResult('read', id).catch(() => recordSetupError());
}

Notifications.addNotificationResponseReceivedListener((response) => {
  try {
    handleReadAction(response);
  } catch {
    recordSetupError();
  }
});

const lastResponse = Notifications.getLastNotificationResponse();
if (lastResponse) {
  try {
    handleReadAction(lastResponse);
  } catch {
    recordSetupError();
  }
}

const actionsReady = Notifications.setNotificationCategoryAsync(ACTION_CATEGORY, [
  { identifier: MARK_READ, buttonTitle: 'Mark as read', options: { opensAppToForeground: false } },
]).catch(recordSetupError);

if (!TaskManager.isTaskDefined(NOTIFICATION_TASK_NAME)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(NOTIFICATION_TASK_NAME, async ({ data, error }) => {
    if (error || !data) return Notifications.BackgroundNotificationTaskResult.Failed;

    try {
      if ('actionIdentifier' in data) {
        handleReadAction(data);
      } else {
        const id = backgroundId(data);
        if (!id) return Notifications.BackgroundNotificationTaskResult.NoData;
        await saveResult('background', id);
      }
      return Notifications.BackgroundNotificationTaskResult.NewData;
    } catch {
      recordSetupError();
      return Notifications.BackgroundNotificationTaskResult.Failed;
    }
  });
}

const backgroundTaskReady = TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK_NAME)
  .then((registered) => {
    if (!registered) return Notifications.registerTaskAsync(NOTIFICATION_TASK_NAME);
  })
  .catch(recordSetupError);

export const notificationSetup = Promise.all([actionsReady, backgroundTaskReady]);
