import { ConfigPlugin } from "@expo/config-plugins";
import * as path from "path";
import {
  PBXBuildFile,
  PBXFileReference,
  PBXNativeTarget,
  XCBuildConfiguration,
  XCConfigurationList,
  XcodeProject,
} from "@bacons/xcode";
import { ExpoConfig } from "expo/config";
import { copyMessageExtensionFiles } from "./lib/copyMessageExtensionFiles";
import { withXcodeProjectBeta } from "./withXcparse";
import { BuildSettings } from "@bacons/xcode/json";

type XcodeSettings = {
  extensionTargetName: string;
  extensionBundleIdentifier: string;
  folderIOsFilesName: string;
  teamId: string;
};

const createMessageFilterConfigurationList = (
  currentProjectVersion: string | undefined,
  project: XcodeProject,
  props: XcodeSettings
): XCConfigurationList => {
  const common: BuildSettings | any = {
    ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS: "YES",
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    ENABLE_USER_SCRIPT_SANDBOXING: "YES",
    GCC_C_LANGUAGE_STANDARD: "gnu17",
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_FILE: props.extensionTargetName + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: props.extensionTargetName,
    INFOPLIST_KEY_NSHumanReadableCopyright: "",
    IPHONEOS_DEPLOYMENT_TARGET: "18.0",
    LD_RUNPATH_SEARCH_PATHS: [
      "$(inherited)",
      "@executable_path/Frameworks",
      "@executable_path/../../Frameworks",
    ],
    LOCALIZATION_PREFERS_STRING_CATALOG: "YES",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: props.extensionBundleIdentifier,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
  };

  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      DEBUG_INFORMATION_FORMAT: "dwarf",
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG $(inherited)",
      SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ...common,
      // Diff
      COPY_PHASE_STRIP: "NO",
      DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
      SWIFT_COMPILATION_MODE: "wholemodule",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
};

const getMainAppTarget = (project: XcodeProject): PBXNativeTarget => {
  const target = project.rootObject.getMainAppTarget("ios");
  if (!target) {
    throw new Error("No main app target found");
  }
  return target;
};

const applyXcodeChanges = (
  config: ExpoConfig,
  project: XcodeProject,
  props: XcodeSettings
): XcodeProject => {
  const mainAppTarget = getMainAppTarget(project);

  const appExtensionBuildFile = PBXBuildFile.create(project, {
    fileRef: PBXFileReference.create(project, {
      explicitFileType: "wrapper.app-extension",
      includeInIndex: 0,
      path: props.extensionTargetName + ".appex",
      sourceTree: "BUILT_PRODUCTS_DIR",
    }),
    settings: {
      ATTRIBUTES: ["RemoveHeadersOnCopy"],
    },
  });

  project.rootObject.ensureProductGroup().props.children.push(
    // @ts-expect-error
    appExtensionBuildFile.props.fileRef
  );

  let targetToAdd: PBXNativeTarget = project.rootObject.createNativeTarget({
    buildConfigurationList: createMessageFilterConfigurationList(
      config.ios?.buildNumber,
      project,
      props
    ),
    name: props.extensionTargetName,
    productName: props.extensionTargetName,
    // @ts-expect-error
    productReference: appExtensionBuildFile.props.fileRef,
    productType: "com.apple.product-type.app-extension",
  });

  project.rootObject.props.attributes["LastSwiftUpdateCheck"] = "1620";
  project.rootObject.props.attributes.TargetAttributes![targetToAdd.uuid] ??= {
    CreatedOnToolsVersion: "16.2",
    ProvisioningStyle: "Automatic",
    DevelopmentTeam: props.teamId,
  };

  const copyPhase = mainAppTarget.getCopyBuildPhaseForTarget(targetToAdd);

  if (!copyPhase.getBuildFile(appExtensionBuildFile.props.fileRef)) {
    copyPhase.props.files.push(appExtensionBuildFile);
  }

  targetToAdd.getFrameworksBuildPhase();
  targetToAdd.getSourcesBuildPhase();
  targetToAdd.getResourcesBuildPhase();

  mainAppTarget.addDependency(targetToAdd);

  /**
   * This code is broken, but no problem because
   * is not necessary for building, so I will fix it
   * later.
   */
  // const syncRootGroup = PBXFileSystemSynchronizedRootGroup.create(project, {
  //   path: props.extensionTargetName,
  //   exceptions: [
  //     PBXFileSystemSynchronizedBuildFileExceptionSet.create(project, {
  //       target: targetToAdd,
  //       membershipExceptions: [
  //         "Info.plist"
  //       ]
  //     }),
  //   ],
  //   explicitFileTypes: {},
  //   explicitFolders: [],
  //   sourceTree: "<group>",
  // });

  // if (!targetToAdd.props.fileSystemSynchronizedGroups) {
  //   targetToAdd.props.fileSystemSynchronizedGroups = [];
  // }
  // targetToAdd.props.fileSystemSynchronizedGroups.push(syncRootGroup);
  // project.rootObject.props.mainGroup.props.children.push(syncRootGroup);

  // Apply developmentIdTargets
  project.rootObject.props.targets.forEach((target) => {
    target.setBuildSetting("DEVELOPMENT_TEAM", props.teamId);
  });
  
  return project;
};

export const withXcodeChanges: ConfigPlugin<XcodeSettings> = (
  config,
  props
) => {
  return withXcodeProjectBeta(config, (config) => {
    const messageFilterPath = path.join(
      config.modRequest.projectRoot,
      props.folderIOsFilesName
    );
    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      props.extensionTargetName
    );

    // Copy the message extension files to the iOS native directory
    copyMessageExtensionFiles(messageFilterPath, targetPath);

    //@ts-ignore
    applyXcodeChanges(config, config.modResults, props);

    return config;
  });
};