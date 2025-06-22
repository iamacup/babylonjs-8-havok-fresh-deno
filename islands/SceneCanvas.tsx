import { useEffect, useRef } from "preact/hooks";

// Babylon core
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin.js";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate.js";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin.js";

// Havok
import HavokPhysics from "@babylonjs/havok";

// Important side-effect imports for Babylon modular v8
import "@babylonjs/core/Physics/physicsEngineComponent.js";
import "@babylonjs/core/Materials/standardMaterial.js";

type SceneCanvasProps = {
  showInspector?: boolean;
};

export default function SceneCanvas({ showInspector = false }: SceneCanvasProps) {
  const reactCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = reactCanvas.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });

    const createScene = async () => {
      const scene = new Scene(engine);

      // Camera
      const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(canvas, true);

      // Light
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      // Sphere
      const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
      sphere.position.y = 4;

      // Ground
      const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

      // Havok physics
      const havok = await HavokPhysics({
        locateFile: (file) => file.endsWith(".wasm") ? "/HavokPhysics.wasm" : file,
      });
      const plugin = new HavokPlugin(true, havok);
      scene.enablePhysics(new Vector3(0, -9.8, 0), plugin);

      // Physics bodies
      new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {
        mass: 1,
        restitution: 0.75,
      }, scene);

      new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
        mass: 0,
      }, scene);

      // Optional inspector
      if (showInspector && typeof window !== "undefined") {
        import("@babylonjs/core/Debug/debugLayer.js")
          .then(() => import("@babylonjs/inspector"))
          .then(() => {
            scene.debugLayer.show({ embedMode: true });
          })
          .catch((err) => console.error("Failed to load inspector:", err));
      }

      return scene;
    };

    createScene().then((scene) => {
      engine.runRenderLoop(() => {
        scene.render();
      });
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      engine.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [showInspector]);

  return (
    <canvas
      id="renderCanvas"
      ref={reactCanvas}
      style="width: 100vw; height: 100vh; display: block; background: #000;"
    />
  );
}