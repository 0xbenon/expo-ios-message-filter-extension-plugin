import * as fs from "fs";
import * as path from "path";

export const copyMessageExtensionFiles = (
  sourcePath: string,
  targetPath: string
): void => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (!fs.lstatSync(sourcePath).isDirectory())
    throw new Error("The source path is not a directory.");

  const files = fs.readdirSync(sourcePath);

  files.forEach(file => {
    copyFileSync(path.join(sourcePath, file), targetPath);
  });
};

const copyFileSync = (filePath: string, target: string) => {
  let targetFile = target;

  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(filePath));
  }

  fs.writeFileSync(targetFile, fs.readFileSync(filePath));
};
