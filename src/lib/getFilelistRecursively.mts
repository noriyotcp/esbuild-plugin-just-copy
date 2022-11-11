import fs from "node:fs";

/**
 * serach files and directories recursively.
 * @param {string} targetpath search base path
 * @returns list of { path:absolute path, isDir:is directory } of files and dirs in targetpath
 */
const getFilelistRecursively = (targetpath: fs.PathLike) => {
  let result: { path: string; isDir: boolean }[] = [];
  const dirs = fs.readdirSync(targetpath);
  dirs.forEach((file) => {
    const filepath = `${targetpath}/${file}`;
    const isDir = fs.lstatSync(filepath).isDirectory();
    result.push({ path: filepath, isDir: isDir });
    if (isDir) {
      result = result.concat(getFilelistRecursively(filepath));
    }
  });
  return result;
};

export { getFilelistRecursively };
