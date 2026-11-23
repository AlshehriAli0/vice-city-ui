import type { Demo } from "../../src/gallery/demo";
import { DemoBoundary } from "../../src/site/playground/demo-boundary";
import { ControlsPanel, Examples } from "../../src/site/playground/playground";
import { usePlayground } from "../../src/site/playground/playground-state";

const PlaygroundView = ({ demo }: { demo: Demo }) => {
  const state = usePlayground(demo);
  return (
    <>
      <Examples demo={demo} values={state.values} apply={state.apply} reset={state.reset} />
      <DemoBoundary name={demo.name}>{demo.render(state)}</DemoBoundary>
      <ControlsPanel demo={demo} state={state} />
    </>
  );
};

export { PlaygroundView };
