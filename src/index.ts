import { PluginBuild, BuildResult, OnResolveResult } from "esbuild/lib/main.d";

import fs from "node:fs";
import path from "node:path";

export interface Options {
  resolveFrom: "cwd" | string;
  assets: Array<{
    [key: number]: string;
    from: Array<string>;
    to: Array<string>;
    keepStructure: boolean;
  }>;
}

const isGlob = (_path: string) => {
  const { dir } = path.parse(_path);

  return dir.endsWith("/**");
};

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

export const justCopy = (options: Options) => {
  const errors: { text: string }[] = [];

  console.log(options);

  return {
    name: "just-copy",
    setup(build: PluginBuild) {
      build.onStart(async (): Promise<OnResolveResult> => {
        for (const asset of options.assets) {
          const [from, to] = [asset.from[0], asset.to[0]];

          if (/\/$/.test(from)) {
            errors.push({ text: "`from` must not end with `/`" });
          } else if (/\/$/.test(to)) {
            errors.push({ text: "`to` must not end with `/`" });
          }
          // if the path is globbed
          if (isGlob(from)) {
            const fromDir = from.replace(`/**/*`, "");

            if (!fs.existsSync(to)) {
              fs.mkdirSync(to, { recursive: true });
            }
            const targetList = getFilelistRecursively(fromDir);
            targetList.forEach((node) => {
              const newpath = to + node.path.substring(fromDir.length);
              if (node.isDir) {
                if (!fs.existsSync(to)) fs.mkdirSync(newpath);
              } else {
                fs.copyFile(node.path, newpath, (err) => {
                  if (err) throw err;
                });
              }
            });
          } else {
            // copy a single file
            try {
              if (!fs.statSync(from).isFile()) {
                errors.push({ text: `${from} is not a file` });
                return { errors };
              }
            } catch (err) {
              if (err instanceof Error) {
                errors.push({ text: err.message });
                return { errors };
              }
            }

            try {
              fs.mkdirSync(path.dirname(to), { recursive: true });
              fs.copyFileSync(from, to);
            } catch (err) {
              if (err instanceof Error) {
                errors.push({ text: err.message });
                return { errors };
              }
            }
          }
        }
        return { errors };
      });

      build.onEnd((result: BuildResult) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
