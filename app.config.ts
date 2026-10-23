import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "qr-app",
  slug: "qr-app",
  scheme: "qrapp",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",

  ios: {
    ...config.ios,
    bundleIdentifier: "com.saurabh.qrapp",
    googleServicesFile:
      process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    infoPlist: {
      ...config.ios?.infoPlist,
      NSCameraUsageDescription: "Camera is used to scan QR codes and barcodes.",
      NSPhotoLibraryAddUsageDescription:
        "Save generated QR codes to your photos.",
      NSPhotoLibraryUsageDescription: "Pick images to scan QR codes from.",
    },
  },

  android: {
    ...config.android,
    package: "com.saurabh.qrapp",
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    permissions: [...(config.android?.permissions ?? []), "CAMERA"],
  },

  plugins: [
    ...(config.plugins ?? []),
    "expo-dev-client",
    "@react-native-google-signin/google-signin",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/crashlytics",
    "@react-native-firebase/app-check",
    ["expo-build-properties", { ios: { useFrameworks: "static" } }],
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to scan codes.",
      },
    ],
    [
      "expo-media-library",
      {
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save QR codes.",
      },
    ],
  ],

  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },

  extra: {
    ...config.extra,
    cloudinary: {
      cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    },
  },
});
