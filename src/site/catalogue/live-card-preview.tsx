import { CropStage } from "../playground/crop-stage";
import { FitStage } from "../playground/fit-stage";
import { staticPlayground } from "../playground/playground-state";
import type { Entry } from "./catalogue";

const LivePreview = ({ entry }: { entry: Entry }) => {
  if (entry.capturePreview) {
    const { width, render } = entry.capturePreview;
    return <FitStage width={width}>{render()}</FitStage>;
  }

  const content = entry.render(staticPlayground(entry));
  if (entry.captureCrop) return <CropStage crop={entry.captureCrop}>{content}</CropStage>;
  return <FitStage width={entry.wide ? 860 : 600}>{content}</FitStage>;
};

export default LivePreview;
