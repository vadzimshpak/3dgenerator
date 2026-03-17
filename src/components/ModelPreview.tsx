"use client";

import Script from "next/script";

type ModelPreviewProps = {
  src: string;
  alt?: string;
  interactive?: boolean;
};

export function ModelPreview({
  src,
  alt = "3D model preview",
  interactive = true,
}: ModelPreviewProps) {
  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      {/* @ts-expect-error web component */}
      <model-viewer
        class={interactive ? "model-viewer" : "model-viewer model-viewer--static"}
        src={src}
        alt={alt}
        {...(interactive
          ? { "camera-controls": true }
          : { "interaction-prompt": "none", "disable-zoom": true, "disable-pan": true })}
        touch-action="pan-y"
        shadow-intensity="0.8"
        exposure="1"
        environment-image="neutral"
        loading="eager"
      />
    </>
  );
}

