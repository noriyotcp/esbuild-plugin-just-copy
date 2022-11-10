import { PluginBuild, BuildResult, OnResolveResult } from "esbuild/lib/main.d";
import { CopyFilesRecursively } from "./recursiveCopy.mjs";

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
  const {
    resolveFrom = "cwd",
    assets = {
      keepStructure: false,
    },
  } = options;

  const errors: { text: string }[] = [];
  const from = options.assets[0].from[0];
  const to = options.assets[0].to[0];

  console.log(options);
  console.log(from, to);
  console.log(resolveFrom, assets); // workarounds for unused variables

  return {
    name: "just-copy",
    setup(build: PluginBuild) {
      build.onStart(async (): Promise<OnResolveResult> => {
        if (/\/$/.test(from)) {
          errors.push({ text: "`from` must not end with `/`" });
        } else if (/\/$/.test(to)) {
          errors.push({ text: "`to` must not end with `/`" });
        }

        // if the path is globbed
        if (isGlob(from)) {
          CopyFilesRecursively(from.replace(`/**/*`, ""), to);
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
        return { errors };
      });

      build.onEnd((result: BuildResult) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
