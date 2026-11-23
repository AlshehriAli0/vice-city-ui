import { ScrollArea, ScrollAreaViewport } from "@ui-sdk/react/scroll-area";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useEffect, useState } from "react";

import type { DemoSource } from "../../gallery/demo";
import { CopyButton } from "./copy-button";
import { HighlightedCode } from "./highlighted-code";

type LoadedFile = { name: string; text: string };

const Source = ({ source }: { source: DemoSource }) => {
  const [files, setFiles] = useState<LoadedFile[]>();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const pending = Object.entries(source).map(async ([name, read]) => {
        const { default: text } = await read();
        return { name, text };
      });
      const results = await Promise.all(pending).catch(() => []);
      if (active) setFiles(results);
    };
    void load();

    return () => {
      active = false;
    };
  }, [source]);

  if (!files) return <div className="src-placeholder" aria-hidden="true" />;
  const first = files.at(0);
  if (!first) return null;

  return (
    <Tabs className="src" defaultValue={first.name}>
      <TabsList className="src__tabs" aria-label="Source files">
        {files.map(item => (
          <TabsTab key={item.name} value={item.name} className="src__tab">
            {item.name}
          </TabsTab>
        ))}
      </TabsList>
      {files.map(item => (
        <TabsPanel key={item.name} value={item.name} className="src__panel">
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
};

export { Source };
