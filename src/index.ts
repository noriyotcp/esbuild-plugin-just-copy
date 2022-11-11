import { PluginBuild, BuildResult, OnResolveResult } from "esbuild/lib/main.d";
import { getFilelistRecursively } from "./recursiveCopy.mjs";

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
