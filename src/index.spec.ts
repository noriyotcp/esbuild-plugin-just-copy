import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

import { copy } from "./index";

it("copy", async () => {
  const tmpDir = path.join(__dirname, "..", "assets");
  const from = [path.resolve(__dirname, "./index.ts")];
  const to = [path.join(tmpDir, "index.ts")];

  const copyFileSyncSpy = vi.spyOn(fs, "copyFileSync");
  const mkdirSyncSpy = vi.spyOn(fs, "mkdirSync");
  await build({
    plugins: [
      copy({
        assets: [
          {
            from,
            to,
          },
        ],
      }),
    ],
  });
  expect(copyFileSyncSpy).toHaveBeenCalledWith(
    from[0],
    to[0]
  );
  expect(mkdirSyncSpy).toHaveBeenCalledWith(tmpDir, { recursive: true });

  fs.unlinkSync(to[0]);
  fs.rmdirSync(tmpDir);
});
