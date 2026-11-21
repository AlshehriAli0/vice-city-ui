import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import { useEffect, useState, type ReactElement } from "react"
import { highlight } from "sugar-high"
import { CopyButton } from "./copy-button"

const FILES = import.meta.glob(["../leonida/*.tsx", "../leonida/*.css", "../ui/*.tsx", "../ui/*.css"], {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

/* The component's own files, read raw at build time, with a copy button per file. */
function Source({ file }: { file: string }): ReactElement | null {
  const [code, setCode] = useState<{ ext: string; name: string; text: string }[]>([])
  useEffect(() => {
    let live = true
    const wanted = ["tsx", "css"].flatMap((ext) => {
      const load = FILES[`../${file}.${ext}`]
      return load ? [load().then((text) => ({ ext, name: `${file.split("/").pop()}.${ext}`, text }))] : []
    })
    Promise.all(wanted).then((files) => live && setCode(files))
    return () => {
      live = false
    }
  }, [file])
  if (code.length === 0) return null
  return (
    <Tabs className="src" defaultValue={code[0].ext}>
      <TabsList className="src__tabs" aria-label="Source files">
        {code.map((item) => (
          <TabsTab key={item.ext} value={item.ext} className="src__tab">
            {item.name}
          </TabsTab>
        ))}
      </TabsList>
      {code.map((item) => (
        <TabsPanel key={item.ext} value={item.ext} className="src__panel">
          <div className="src__actions">
            <CopyButton text={item.text} label={`Copy ${item.name}`} />
          </div>
          <pre className="src__code code" tabIndex={0} aria-label={`${item.name} source`}>
            {/* Our own source files, read at build time, so the markup is trusted. */}
            <code dangerouslySetInnerHTML={{ __html: highlight(item.text) }} />
          </pre>
        </TabsPanel>
      ))}
    </Tabs>
  )
}

export { Source }
