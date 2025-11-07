import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: './public/scripts',
  jsxFactory: 'h',
});

console.log('Build completed');
