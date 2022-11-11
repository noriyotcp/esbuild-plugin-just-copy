# esbuild-plugin-just-copy
ESBuild plugin for assets copy.

```sh
npm install esbuild-plugin-just-copy
yarn add esbuild-plugin-just-copy
```

```js
import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-just-copy';

(async () => {
  const res = await build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    outfile: './dist/main.js',
    plugins: [
      copy({
        // The path will be relative to where you are running this script
        assets: [
          {
            from: ['./assets/**/*'],
            to: ['./tmp-assets'],
          },
          {
            from: ['./assets/test.js'],
            to: ['./tmp-assets/test.js'],
          }
        ],
      }),
    ],
  });
})();
```
