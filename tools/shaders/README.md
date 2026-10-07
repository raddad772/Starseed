# Offline WGSL generation

The browser uses the checked-in JavaScript WGSL modules in `src/render/webgpu/generated`.
The translator is a development tool only; there is no runtime shader compiler.

Install `naga-wasi-cli@0.1.0` in a scratch directory outside the repository. From the repo root:

```sh
export STARSEED_SHADER_ROOT="$PWD"
node --loader ./tools/shaders/source-loader.mjs ./tools/shaders/build.mjs /absolute/path/to/naga-wasi-cli/bin/naga.mjs "$PWD/src/render/webgpu/generated"
node --loader ./tools/shaders/source-loader.mjs ./tools/shaders/opaque.mjs /absolute/path/to/naga-wasi-cli/bin/naga.mjs "$PWD/src/render/webgpu/generated"
```

The loader exposes private shader constants to this offline process only. The opaque translator
retains geometry and material equations, removes unreachable lighting functions, then emits
material data to the shared G-buffer. Material modes 0, 2 and 3 are generated independently.
`intermediate/` files are compiler diagnostics, not runtime assets; do not commit them.

After generation, run `node --test tools/tests/webgpu.test.mjs` and the finite browser fixture
`tools/tests/webgpu.html`. The fixture compiles all modules, draws overlapping reversed-depth
surfaces and all six opaque material families, and checks shared-geometry lifetime and resize.
`tools/tests/webgpu-scenes.html` exercises the complete scene with a fixed-exposure comparison.
