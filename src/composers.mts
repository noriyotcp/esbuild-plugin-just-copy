import fs from "node:fs";

const sourceDirectories = (globbedPath: string) => {
  const parentDir = globbedPath.replace(`/**/*`, "");
  const childDirs = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => `${parentDir}/${item.name}`);
  return [parentDir, ...childDirs];
};

export { sourceDirectories };
