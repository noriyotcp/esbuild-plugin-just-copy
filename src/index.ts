import { PluginBuild, BuildResult, OnResolveResult } from "esbuild/lib/main.d";
import { sourceDirectories } from "./composers.mjs";

export interface Options {
  resolveFrom: "cwd" | string;
  assets: Array<{
    [key: number]: string;
    from: Array<string>;
    to: Array<string>;
    keepStructure: boolean;
  }>;
}

export const justCopy = (options: Options) => {
  const {
    resolveFrom = "cwd",
    assets = {
      keepStructure: false,
    },
  } = options;

  const errors: { text: string; }[] = [];
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
        const sourceDirs = sourceDirectories(from);
        console.log(sourceDirs);

        return { errors };
      });

      build.onEnd((result: BuildResult) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
