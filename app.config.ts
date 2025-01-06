import "ts-node/register";
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "pocapp",
  slug: "pocapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.abz99.pocapp",
    buildNumber: "2",
    associatedDomains: [
      "messagefilter:b8f2-2806-2f0-33a0-f5ac-61d7-7015-1ef4-7887.ngrok-free.app",
    ],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    ["./configs/message-extension/index.ts",
      {
        teamId: "ZFR9K9656C"
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "d9b6e171-96fc-4650-9934-f48b029a0dd3"
    },
  },
  owner: "abz99",
};

export default config;