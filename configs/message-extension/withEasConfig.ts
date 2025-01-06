import { ConfigPlugin } from "expo/config-plugins";

const safeSet = (obj: any, key: string, value: any) => {
  const segments = key.split(".");
  const last = segments.pop();
  segments.forEach((segment) => {
    if (!obj[segment]) {
      obj[segment] = {};
    }
    obj = obj[segment];
  });
  obj[last!] = value;

  return obj;
}

export const withEASTargets: ConfigPlugin<{
  bundleIdentifier: string;
  targetName: string;
}> = (config, { bundleIdentifier, targetName }) => {
  safeSet(config, "extra.eas.build.experimental.ios.appExtensions", []);
  
  const existing =
    config.extra!.eas.build.experimental.ios.appExtensions.findIndex(
      (ext: any) => ext.targetName === targetName
    );

  if (existing > -1) {
    config.extra!.eas.build.experimental.ios.appExtensions[existing] = {
      ...config.extra!.eas.build.experimental.ios.appExtensions[existing],
      bundleIdentifier,
      entitlements: {},
    };
  } else {
    config.extra!.eas.build.experimental.ios.appExtensions.push({
      bundleIdentifier,
      targetName,
      entitlements: {},
    });
  }

  return config;
};