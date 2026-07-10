/* =========================================================
   three-scene.js — 3D hero (golden dust + gilded centerpiece)
   Requires THREE r128 (CDN). Degrades silently if absent.
   ========================================================= */
(function () {
  const mount = document.getElementById("three-hero");
  if (!mount || typeof THREE === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0c0a, 0.055);
  const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const key = new THREE.PointLight(0xe0a458, 2.6, 50); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(0xc9a24b, 1.4, 50); rim.position.set(-6, -3, 4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x4a3a28, 0.6));

  const knotGroup = new THREE.Group();
  const geo = new THREE.TorusKnotGeometry(1.7, 0.42, 220, 32, 2, 3);
  const knot = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x6e5424, metalness: 1.0, roughness: 0.28, emissive: 0x2a1d0c, emissiveIntensity: 0.6 }));
  knotGroup.add(knot);
  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe8d5a8, wireframe: true, transparent: true, opacity: 0.12 }));
  wire.scale.setScalar(1.03); knotGroup.add(wire);
  knotGroup.position.set(0, 0.2, 0); knotGroup.scale.setScalar(0.92); scene.add(knotGroup);

  const COUNT = window.innerWidth < 768 ? 1400 : 3200;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 6 + Math.random() * 16, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r*Math.sin(p)*Math.cos(t); positions[i*3+1] = (Math.random()-0.5)*18; positions[i*3+2] = r*Math.sin(p)*Math.sin(t)*0.6 - 4;
    speeds[i] = 0.002 + Math.random() * 0.006;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const sc = document.createElement("canvas"); sc.width = sc.height = 64;
  const sx = sc.getContext("2d"); const g = sx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,"rgba(255,225,170,1)"); g.addColorStop(0.4,"rgba(224,164,88,0.6)"); g.addColorStop(1,"rgba(224,164,88,0)");
  sx.fillStyle = g; sx.fillRect(0,0,64,64);
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.13, map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9, sizeAttenuation: true }));
  scene.add(dust);

  let mx=0,my=0,tx=0,ty=0;
  window.addEventListener("pointermove",(e)=>{ mx=e.clientX/window.innerWidth-0.5; my=e.clientY/window.innerHeight-0.5; });
  function resize(){ const w=mount.clientWidth,h=mount.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  function tick(){
    const t = clock.getElapsedTime();
    if (!reduce) {
      knot.rotation.y = t*0.18; knot.rotation.x = Math.sin(t*0.25)*0.3; wire.rotation.copy(knot.rotation);
      knotGroup.position.y = 0.2 + Math.sin(t*0.6)*0.12;
      const pos = dustGeo.attributes.position.array;
      for (let i=0;i<COUNT;i++){ pos[i*3+1]+=speeds[i]; if(pos[i*3+1]>9) pos[i*3+1]=-9; }
      dustGeo.attributes.position.needsUpdate = true; dust.rotation.y = t*0.02;
      key.intensity = 2.4 + Math.sin(t*7)*0.25 + Math.sin(t*13)*0.12;
    }
    tx += (mx-tx)*0.04; ty += (my-ty)*0.04;
    camera.position.x = tx*1.6; camera.position.y = -ty*1.0; camera.lookAt(0,0.2,0);
    renderer.render(scene, camera); requestAnimationFrame(tick);
  }
  tick();
})();
