import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

import { copy } from "./index";

it("copy", async () => {
  const tmpDir = path.join(__dirname, "..", "assets");
  fs.mkdirSync(tmpDir);

  const spy = vi.spyOn(fs, "copyFileSync");
  await build({
    plugins: [
      copy({
        assets: [
          {
            from: [path.resolve(__dirname, './index.ts')],
            to: [path.join(tmpDir, 'index.ts')],
          },
        ],
      }),
    ],
  });
  expect(spy).toHaveBeenCalled();

  fs.unlinkSync(path.join(tmpDir, "index.ts"));
  fs.rmdirSync(tmpDir);
});
