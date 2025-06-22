# Deno + Fresh + Babylon 8 + Havok

This is a Fresh project started with `deno run -A -r https://fresh.deno.dev` with BabylonJS 8 & Havok working out of the box

### the SceneCanvas

The SceneCanvas can be either `<SceneCanvas showInspector/>` or `<SceneCanvas />` which will include the inspector or not.

Note that the inspector effectively short circuits the babylon modular imports and so you will see in the `SceneCanvas` imports for side effects - as your project grows make sure to keep this list expanding or your project will only work with the inspector on.

### Havok

The havok WASM file is served from the static directory.

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

### Building

```
deno task build 
```

```
deno task preview
```