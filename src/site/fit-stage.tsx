import { useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react";

type Preview = { fit: HTMLDivElement; stage: HTMLElement };

const fitted = new Map<Element, Preview>();
let observer: ResizeObserver | undefined;

function resizePreviews(entries: ResizeObserverEntry[]): void {
  const previews = new Set(entries.flatMap(({ target }) => fitted.get(target) ?? []));
  for (const { fit } of previews) fit.style.zoom = "1";

  const sizes = Array.from(previews, ({ fit, stage }) => ({
    fit,
    scale: Math.min(
      1,
      stage.clientWidth / Math.max(1, fit.scrollWidth),
      stage.clientHeight / Math.max(1, fit.scrollHeight)
    ),
  }));
  for (const { fit, scale } of sizes) {
    fit.style.zoom = scale < 0.995 ? String(Math.floor(scale * 100) / 100) : "";
  }
}

function observeFit(fit: HTMLDivElement, stage: HTMLElement): () => void {
  const resize = (observer ??= new ResizeObserver(resizePreviews));
  const preview = { fit, stage };
  for (const element of [stage, fit]) {
    fitted.set(element, preview);
    resize.observe(element);
  }
  return () => {
    for (const element of [stage, fit]) {
      fitted.delete(element);
      resize.unobserve(element);
    }
  };
}

function FitStage({ width, children }: { width: number; children: ReactNode }): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = box.current;
    const stage = fit?.parentElement;
    if (!fit || !stage) return undefined;
    return observeFit(fit, stage);
  }, []);
  return (
    <div ref={box} className="fit-stage" style={{ width }}>
      {children}
    </div>
  );
}

export { FitStage };
