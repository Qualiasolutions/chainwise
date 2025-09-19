"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the globe component to avoid SSR issues
const GlobeComponent = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  ),
});

interface Globe3DProps {
  isFullScreen?: boolean;
}

export default function Globe3D({ isFullScreen = false }: Globe3DProps) {
  const globeEl = useRef<any>();
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 160 });

  useEffect(() => {
    // Set dimensions based on screen size and usage type
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        if (isFullScreen) {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
          });
        } else {
          setDimensions({
            width: 800,
            height: window.innerWidth > 768 ? 256 : 160
          });
        }
      }
    };

    updateDimensions();
    window?.addEventListener('resize', updateDimensions);

    return () => window?.removeEventListener('resize', updateDimensions);
  }, [isFullScreen]);

  useEffect(() => {
    if (!globeEl.current || !globeReady) return;

    // Configure the globe controls and view
    const globe = globeEl.current;

    // Set initial camera position - further back for full screen
    const altitude = isFullScreen ? 3.5 : 2.5;
    globe.pointOfView(
      { lat: 23.5, lng: 0, altitude },
      1000
    );

    // Configure controls
    if (globe.controls) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;
      globe.controls().enablePan = false;
    }
  }, [globeReady, isFullScreen]);

  const containerClasses = isFullScreen
    ? "w-full h-full absolute inset-0 overflow-hidden"
    : "w-full h-40 md:h-64 relative overflow-hidden";

  return (
    <div className={containerClasses}>
      <GlobeComponent
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeReady={() => setGlobeReady(true)}
        width={dimensions.width}
        height={dimensions.height}
        animateIn={false}
        showAtmosphere={true}
        atmosphereColor="#9b87f5"
        atmosphereAltitude={0.25}
      />
    </div>
  );
}