import { PluginBuild, BuildResult } from "esbuild/lib/main.d";

export const hello = (message: string): string => {
  const str = `message is ${message}`;
  console.log(str);
  return str;
};

export const justCopy = () => {
  return {
    name: "just-copy",
    setup(build: PluginBuild) {
      build.onStart(async (): Promise<null> => {
        hello("This is just-copy");
        return null;
      });

      build.onEnd((result: BuildResult) => {
        console.log(`Build completed ${JSON.stringify(result)}`);
      });
    },
  };
};
