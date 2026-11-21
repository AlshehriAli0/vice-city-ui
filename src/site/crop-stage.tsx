import { useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react";

import type { CssVariables } from "../ui/css-variables";
import type { Crop } from "./crops";

function CropStage({
  crop,
  maxScale = 1.5,
  children,
}: {
  crop: Crop;
  maxScale?: number;
  children: ReactNode;
}): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => {
      const scale = Math.min(maxScale, el.clientWidth / crop.w, el.clientHeight / crop.h);
      el.style.setProperty("--crop-s", String(Math.max(0.05, scale)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    fit();
    return () => observer.disconnect();
  }, [crop, maxScale]);
  const vars: CssVariables = {
    "--crop-x": `${crop.x}px`,
    "--crop-y": `${crop.y}px`,
    "--crop-w": `${crop.w}px`,
    "--crop-h": `${crop.h}px`,
    "--crop-world": `${crop.world ?? 1920}px`,
  };
  return (
    <div ref={box} className="crop" style={vars}>
      <div className="crop__window">
        <div className="crop__world">{children}</div>
      </div>
    </div>
  );
}

function FrameCrop({
  crop,
  maxScale = 1.25,
  children,
}: {
  crop: Crop;
  maxScale?: number;
  children: ReactNode;
}): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => {
      const scale = Math.min(maxScale, el.clientWidth / crop.w, (window.innerHeight * 0.62) / crop.h);
      el.style.setProperty("--crop-s", String(Math.max(0.05, scale)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [crop, maxScale]);
  const vars: CssVariables = {
    "--crop-x": `${crop.x}px`,
    "--crop-y": `${crop.y}px`,
    "--crop-w": `${crop.w}px`,
    "--crop-h": `${crop.h}px`,
  };
  return (
    <div ref={box} className="frame-crop" style={vars}>
      {children}
    </div>
  );
}

export { CropStage, FrameCrop };
