import type { ChangeDetails, ViewportReason } from "@ui-sdk/core";

import type { Target } from "./geometry";

type ZoomReason = ViewportReason;
type DestinationReason = "press" | "imperative";

type MapCameraOptions = {
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number, details: ChangeDetails<ZoomReason>) => void;
  destination?: string | null;
  defaultDestination?: string | null;
  onDestinationChange?: (destination: string | null, details: ChangeDetails<DestinationReason>) => void;
  targets?: Target[];
  start?: string;
  onHoverChange?: (value: string | null) => void;
  controller?: MapCameraController;
};

type MapCameraController = {
  glideTo: (target: string | { x: number; y: number }, zoom?: number) => void;
  jumpTo: (point: { x: number; y: number }) => void;
  centre: () => { x: number; y: number };
  setDestination: (destination: string | null) => boolean;
};

export type { MapCameraController, MapCameraOptions, ZoomReason };
