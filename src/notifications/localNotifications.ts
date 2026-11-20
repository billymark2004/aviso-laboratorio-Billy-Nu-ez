import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'laboratorio';
let useCustomChannel = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Avisos de laboratorio',
        importance: Notifications.AndroidImportance.HIGH,
      });
      useCustomChannel = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('NullPointerException')) throw error;
      // Permite usar el canal predeterminado si falla la creación nativa en Expo Go.
      useCustomChannel = false;
      console.warn('No se pudo crear el canal de laboratorio:', message);
    }
  }

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    permission = await Notifications.requestPermissionsAsync();
  }

  return permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function showLocalNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hola mundo',
      body: `Prueba programada el ${new Date().toLocaleString('es-PE')}.`,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: useCustomChannel ? CHANNEL_ID : undefined,
    },
  });
}
