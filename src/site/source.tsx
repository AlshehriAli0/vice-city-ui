import { ScrollArea, ScrollAreaViewport } from "@ui-sdk/react/scroll-area";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useEffect, useState, type ReactElement } from "react";

import { CopyButton } from "./copy-button";
import { HighlightedCode } from "./highlighted-code";

const FILES: Partial<Record<string, () => Promise<string>>> = import.meta.glob<string>(
  ["../leonida/*.tsx", "../leonida/*.css", "../ui/*.tsx", "../ui/*.css"],
  { query: "?raw", import: "default" }
);

const loadSourceFiles = (file: string) =>
  Promise.all(
    ["tsx", "css"].flatMap(ext => {
      const load = FILES[`../${file}.${ext}`];
      const name = `${file.split("/").at(-1)}.${ext}`;
      return load ? [load().then(text => ({ ext, name, text }))] : [];
    })
  );

function Source({ file }: { file: string }): ReactElement | null {
  const [code, setCode] = useState<Awaited<ReturnType<typeof loadSourceFiles>>>([]);

  useEffect(() => {
    const controller = new AbortController();
    loadSourceFiles(file)
      .then(files => {
        if (!controller.signal.aborted) setCode(files);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCode([]);
      });
    return () => controller.abort();
  }, [file]);

  const first = code.at(0);
  if (!first) return null;

  return (
    <Tabs className="src" defaultValue={first.ext}>
      <TabsList className="src__tabs" aria-label="Source files">
        {code.map(item => (
          <TabsTab key={item.ext} value={item.ext} className="src__tab">
            {item.name}
          </TabsTab>
        ))}
      </TabsList>
      {code.map(item => (
        <TabsPanel key={item.ext} value={item.ext} className="src__panel">
          <div className="src__actions">
            <CopyButton text={item.text} label={`Copy ${item.name}`} />
          </div>
          <ScrollArea>
            <ScrollAreaViewport
              render={<pre />}
              className="src__code code"
              role="region"
              aria-label={`${item.name} source`}
            >
              <HighlightedCode text={item.text} />
            </ScrollAreaViewport>
          </ScrollArea>
        </TabsPanel>
      ))}
    </Tabs>
  );
}

export { Source };
