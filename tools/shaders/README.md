# Offline WGSL generation

The browser uses checked-in JavaScript WGSL modules in `src/render/webgpu/generated`.
The translator is a development tool only; there is no runtime shader compiler.

Install `naga-wasi-cli@0.1.0` in a scratch directory outside the repository. From the repo root:

```sh
export STARSEED_SHADER_ROOT="$PWD"
for generator in build opaque shadows forward background standard-forward; do
  node --loader ./tools/shaders/source-loader.mjs ./tools/shaders/$generator.mjs /absolute/path/to/naga-wasi-cli/bin/naga.mjs "$PWD/src/render/webgpu/generated"
done
```

The loader exposes private shader constants to this offline process only. Opaque generation retains
geometry/material equations and emits material data for common lighting. Modes 0, 2 and 3 are generated
independently. Scalar/vec2 uniform arrays use explicit 16-byte std140 element wrappers in WGSL.
`intermediate/` files are compiler diagnostics; do not commit them.

Run `node --test tools/tests/webgpu.test.mjs`, then the finite `tools/tests/webgpu.html` browser fixture.
It validates eight opaque and seven custom forward families, reversed depth, resource lifetime, clusters,
decals/GTAO, viewscreens, GPU visibility/LOD and the map. `tools/tests/webgpu-scenes.html` exercises full
scenes with fixed-exposure reference comparisons or native-only startup. The old WebGL renderer is only
loaded by the explicit `?webglReference=1` test switch. Timings include queue completion; do not sum
overlapping timestamp scopes or interpret candidate triangle counts as GPU-visible counts.
