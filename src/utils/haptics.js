import { Vibration, Platform } from 'react-native';

let expoHaptics = null;
try {
  expoHaptics = require('expo-haptics');
} catch {}

export const HapticStyle = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export async function haptic(style = HapticStyle.MEDIUM) {
  try {
    if (expoHaptics) {
      switch (style) {
        case HapticStyle.LIGHT:
          await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Light);
          break;
        case HapticStyle.MEDIUM:
          await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticStyle.HEAVY:
          await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticStyle.SUCCESS:
          await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Success);
          break;
        case HapticStyle.WARNING:
          await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Warning);
          break;
        case HapticStyle.ERROR:
          await expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Error);
          break;
        default:
          await expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      Vibration.vibrate(style === HapticStyle.ERROR ? [0, 80, 60, 80] : 40);
    }
  } catch {}
}
