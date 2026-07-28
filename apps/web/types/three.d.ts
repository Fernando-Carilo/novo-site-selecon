declare module "three" {
  export const WebGLRenderer: any;
  export const Scene: any;
  export const PerspectiveCamera: any;
  export const BufferGeometry: any;
  export const BufferAttribute: any;
  export const Float32BufferAttribute: any;
  export const PointsMaterial: any;
  export const Points: any;
  export const LineBasicMaterial: any;
  export const LineSegments: any;
  export const SphereGeometry: any;
  export const MeshBasicMaterial: any;
  export const Mesh: any;
  export const TorusGeometry: any;
  export const AdditiveBlending: any;
}

declare module "three/examples/jsm/postprocessing/EffectComposer" {
  const EffectComposer: any;
  export { EffectComposer };
}

declare module "gsap" {
  export const gsap: any;
}

declare module "gsap/ScrollTrigger" {
  export const ScrollTrigger: any;
}
