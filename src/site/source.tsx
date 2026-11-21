import { ScrollArea, ScrollAreaViewport } from "@ui-sdk/react/scroll-area";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useEffect, useState, type ReactElement } from "react";

import { CopyButton } from "./copy-button";
import { HighlightedCode } from "./highlighted-code";

const FILES: Partial<Record<string, () => Promise<string>>> = import.meta.glob<string>(
  ["../leonida/*.tsx", "../leonida/*.css", "../ui/*.tsx", "../ui/*.css"],
  { query: "?raw", import: "default" }
);

const sourceFiles = (file: string) =>
  ["tsx", "css"].flatMap(ext => {
    const load = FILES[`../${file}.${ext}`];
    const name = `${file.split("/").at(-1)}.${ext}`;
    return load ? [{ ext, name, load }] : [];
  });

function Source({ file }: { file: string }): ReactElement | null {
  const files = sourceFiles(file);
  const [code, setCode] = useState<string[] | undefined>();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const text = await Promise.all(sourceFiles(file).map(item => item.load())).catch(() => []);
      if (active) setCode(text);
    };
    void load();
    return () => {
      active = false;
    };
  }, [file]);

  const first = files.at(0);
  if (!first || code?.length === 0) return null;
  if (!code) return <div className="src-placeholder" aria-hidden="true" />;

  return (
    <Tabs className="src" defaultValue={first.ext}>
      <TabsList className="src__tabs" aria-label="Source files">
        {files.map(item => (
          <TabsTab key={item.ext} value={item.ext} className="src__tab">
            {item.name}
          </TabsTab>
        ))}
      </TabsList>
      {files.map((item, index) => (
        <TabsPanel key={item.ext} value={item.ext} className="src__panel">
          <div className="src__actions">
            <CopyButton text={code[index]} label={`Copy ${item.name}`} />
          </div>
          <ScrollArea>
            <ScrollAreaViewport
              render={<pre />}
              className="src__code code"
              role="region"
              aria-label={`${item.name} source`}
            >
              <HighlightedCode text={code[index]} />
            </ScrollAreaViewport>
          </ScrollArea>
        </TabsPanel>
      ))}
    </Tabs>
  );
}

export { Source };
