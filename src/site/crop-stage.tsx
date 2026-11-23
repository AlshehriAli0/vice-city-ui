import type { ReactNode } from "react";

import type { CssVariables } from "../ui/css-variables";
import type { Crop } from "./crops";

const CropStage = ({ crop, maxScale = 1.5, children }: { crop: Crop; maxScale?: number; children: ReactNode }) => {
  const vars: CssVariables = {
    "--crop-x": `${crop.x}px`,
    "--crop-y": `${crop.y}px`,
    "--crop-w": `${crop.w}px`,
    "--crop-h": `${crop.h}px`,
    "--crop-world": `${crop.world ?? 1920}px`,
    "--crop-limit": maxScale,
  };
  return (
    <div className="crop" style={vars}>
      <div className="crop__window">
        <div className="crop__world">{children}</div>
      </div>
    </div>
  );
};

const FrameCrop = ({ crop, maxScale = 1.25, children }: { crop: Crop; maxScale?: number; children: ReactNode }) => {
  const vars: CssVariables = {
    "--crop-x": `${crop.x}px`,
    "--crop-y": `${crop.y}px`,
    "--crop-w": `${crop.w}px`,
    "--crop-h": `${crop.h}px`,
    "--crop-limit": maxScale,
  };
  return (
    <div className="frame-crop" style={vars}>
      {children}
    </div>
  );
};

export { CropStage, FrameCrop };
