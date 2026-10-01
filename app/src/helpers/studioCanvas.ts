import { isRunningInStudio } from "./platform"

// The renderer draws on demand; retain that frame for the studio's DOM capture.
export const studioCanvasAttributes: WebGLContextAttributes | undefined =
  isRunningInStudio()
    ? {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
      }
    : undefined
