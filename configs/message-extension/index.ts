import {
  ConfigPlugin,
  withPlugins,
} from "@expo/config-plugins";
import { withXcodeChanges } from "./withXcodeChanges";
import { withEASTargets } from "./withEasConfig";
import { withXcodeProjectBetaBaseMod } from "./withXcparse";

const withMessageFilterExtension: ConfigPlugin<{
  teamId: string;
}> = (config, { teamId }) => {
  const folderIOsFilesName = "target-files";
  const extensionTargetName = "MessageFilterExtension";
  const extensionBundleIdentifier = `${config.ios?.bundleIdentifier}.${extensionTargetName}`;

  config = withPlugins(config, [
    [
      withXcodeChanges,
      {
        extensionTargetName,
        extensionBundleIdentifier,
        folderIOsFilesName,
        teamId,
      },
    ],
    [
      withEASTargets,
      {
        bundleIdentifier: extensionBundleIdentifier,
        targetName: extensionTargetName,
      },
    ],
  ]);

  withXcodeProjectBetaBaseMod(config);

  return config;
};

export default withMessageFilterExtension;
