import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// Import model-viewer web component
import "@google/model-viewer";

// TypeScript declarations for model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "auto-rotate"?: boolean;
          "camera-controls"?: boolean;
          "disable-zoom"?: boolean;
          "disable-pan"?: boolean;
          "rotation-per-second"?: string;
          "interaction-prompt"?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          "environment-image"?: string;
          exposure?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

/**
 * Hook to detect if screen is desktop (>= 768px)
 * Only renders the model on desktop to avoid downloading GLB on mobile
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDesktop;
}

export function HeroModelViewer() {
  const isDesktop = useIsDesktop();
  const [isLoaded, setIsLoaded] = useState(false);
  const modelRef = useRef<HTMLElement>(null);

  // Listen for the load event on the model-viewer web component
  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) return;

    const handleLoad = () => setIsLoaded(true);
    modelViewer.addEventListener("load", handleLoad);

    return () => {
      modelViewer.removeEventListener("load", handleLoad);
    };
  }, [isDesktop]);

  // Don't render anything on mobile - prevents GLB download
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[600px] flex items-center justify-center lg:justify-end">
      {/* Glowing light effect behind the model */}
      <div 
        className="hero-model-glow absolute inset-0 pointer-events-none" 
        aria-hidden="true" 
      />

      <motion.div
        className="hero-model-container w-full aspect-square max-w-[420px] lg:max-w-[500px] rounded-2xl overflow-hidden relative bg-transparent lg:ml-auto z-10"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.98 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <model-viewer
          ref={modelRef as React.RefObject<HTMLElement & { addEventListener: HTMLElement["addEventListener"] }>}
          src="/models/orb.glb"
          alt="HYRX 3D Model"
          auto-rotate
          camera-controls
          disable-zoom
          disable-pan
          rotation-per-second="30deg"
          interaction-prompt="none"
          loading="lazy"
          shadow-intensity="0"
          environment-image="neutral"
          exposure="1"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            "--poster-color": "transparent",
          } as React.CSSProperties}
        />
      </motion.div>
    </div>
  );
}
