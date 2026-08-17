require('dotenv').config();

module.exports = {
  expo: {
    name: 'API SAVE',
    slug: 'hornet-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F5F5F5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.apisave.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "API SAVE utilise votre position pour localiser les signalements de frelons asiatiques sur la carte.",
        NSCameraUsageDescription:
          "API SAVE utilise la caméra pour photographier les insectes et les nids suspects.",
        NSPhotoLibraryUsageDescription:
          "API SAVE accède à vos photos pour analyser les insectes et les nids suspects.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      edgeToEdgeEnabled: true,
      package: 'com.apisave.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      proxyUrl: process.env.PROXY_URL || '',
      proxySecret: process.env.PROXY_SECRET || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      eas: {
        projectId: '64f52a5c-e929-413a-a030-5ab8867bf55b',
      },
    },
    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            "API SAVE utilise votre position pour localiser les signalements sur la carte.",
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'API SAVE utilise vos photos pour analyser les insectes.',
          cameraPermission: 'API SAVE utilise la caméra pour photographier les insectes.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'API SAVE utilise la caméra pour photographier les frelons et les nids suspects.',
          microphonePermission: false,
        },
      ],
    ],
  },
};
