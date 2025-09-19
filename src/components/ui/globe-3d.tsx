"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the globe component to avoid SSR issues
const GlobeComponent = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-40 md:h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export default function Globe3D() {
  const globeEl = useRef<any>();
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (!globeEl.current || !globeReady) return;

    // Configure the globe controls and view
    const globe = globeEl.current;

    // Set initial camera position
    globe.pointOfView(
      { lat: 23.5, lng: 0, altitude: 2.5 },
      1000
    );

    // Configure controls
    if (globe.controls) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;
      globe.controls().enablePan = false;
    }
  }, [globeReady]);

  return (
    <div className="w-full h-40 md:h-64 relative overflow-hidden">
      <GlobeComponent
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeReady={() => setGlobeReady(true)}
        width={800}
        height={window?.innerWidth > 768 ? 256 : 160}
        animateIn={false}
        showAtmosphere={true}
        atmosphereColor="#9b87f5"
        atmosphereAltitude={0.25}
      />
    </div>
  );
}