import { createController } from "@ui-sdk/core";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { BLIPS } from "./map-screen.blips";
import type { MapCameraController, Target } from "./map-screen.camera";
import { MAP_CATEGORIES as CATEGORIES } from "./map-screen.data";
import { project, route, routeLength, unproject, type Point } from "./map-screen.route";

type View = "3d" | "2d";

const PLAYER = "nav";
const METRES_PER_MILE = 1609.344;

type MapScreenProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  cash?: number;
  time?: string;
  onExit?: () => void;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  destination?: string | null;
  defaultDestination?: string | null;
  onDestinationChange?: (destination: string | null) => void;
  view?: View;
  defaultView?: View;
  onViewChange?: (view: View) => void;
};

type MapNavigationProps = Pick<MapScreenProps, "destination" | "onDestinationChange" | "view" | "onViewChange"> &
  Required<Pick<MapScreenProps, "defaultDestination" | "defaultView">>;

const useMapNavigation = ({
  destination,
  defaultDestination,
  onDestinationChange,
  view,
  defaultView,
  onViewChange,
}: MapNavigationProps) => {
  const [category, setCategory] = useState("story");
  const [ownView, setOwnView] = useState(defaultView);
  const flat = (view ?? ownView) === "2d";
  const [ownDestination, setOwnDestination] = useState(defaultDestination);
  const goal = destination === undefined ? ownDestination : destination;
  const [marker, setMarker] = useState<Point | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [camera] = useState(() => createController<MapCameraController>());
  const hoveredCategory = CATEGORIES.find(item => item.value === hovered);

  const targets = useMemo<Target[]>(() => {
    const blips = CATEGORIES.map(item => {
      const [x, y] = BLIPS[item.value][flat ? "flat" : "tilted"];
      return { value: item.value, x, y };
    });
    if (!marker) return blips;
    const [x, y] = project(marker, flat);
    return [...blips, { value: "marker", x, y }];
  }, [flat, marker]);
  const worldOf = (target: string | null): Point | undefined => {
    if (target === "marker") return marker ?? undefined;
    return target === null ? undefined : BLIPS[target]?.world;
  };
  const goalPoint = worldOf(goal);
  const path = useMemo(() => (goalPoint ? route(BLIPS[PLAYER].world, goalPoint) : null), [goalPoint]);
  const hoveredPoint = hovered === PLAYER ? undefined : worldOf(hovered);
  const miles = useMemo(
    () => (hoveredPoint ? routeLength(route(BLIPS[PLAYER].world, hoveredPoint)) / METRES_PER_MILE : null),
    [hoveredPoint]
  );

  const look = (next: string) => {
    setCategory(next);
    camera.glideTo(next);
  };
  const setView = (next: View) => {
    setOwnView(next);
    onViewChange?.(next);
  };
  // what: The same spot stays under the cursor when the view flips.
  const shown = useRef(flat);
  useLayoutEffect(() => {
    if (shown.current === flat) return;
    const centre = camera.centre();
    const [x, y] = project(unproject([centre.x, centre.y], shown.current), flat);
    shown.current = flat;
    camera.jumpTo({ x, y });
  }, [camera, flat]);
  const updateDestination = (next: string | null) => {
    setOwnDestination(next);
    onDestinationChange?.(next);
  };

  const setGoal = (next: string | null) => camera.setDestination(next);
  const pressDestination = () => {
    if (hovered) {
      setGoal(goal === hovered ? null : hovered);
    } else {
      const { x, y } = camera.centre();
      setMarker(unproject([x, y], flat));
      setGoal("marker");
    }
  };
  const pressMarker = () => {
    if (marker) {
      setMarker(null);
      if (goal === "marker") setGoal(null);
      return;
    }
    if (hoveredCategory) return;
    const { x, y } = camera.centre();
    setMarker(unproject([x, y], flat));
  };

  const routeLine = path
    ?.map(p =>
      project(p, flat)
        .map(n => n.toFixed(0))
        .join(" ")
    )
    .join(" L");
  const markerAt = marker && project(marker, flat);

  return {
    camera,
    category,
    flat,
    goal,
    hovered,
    hoveredCategory,
    look,
    marker,
    markerAt,
    miles,
    pressDestination,
    pressMarker,
    routeLine,
    setHovered,
    setView,
    targets,
    updateDestination,
  };
};

export { PLAYER, useMapNavigation };
export type { MapScreenProps, View };
