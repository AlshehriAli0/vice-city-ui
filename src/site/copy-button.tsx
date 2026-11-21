import { Check, Copy } from "lucide-react"
import { useEffect, useState, type ReactElement } from "react"
import { Button } from "../ui/button"

function CopyButton({ text, label }: { text: string; label?: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <>
      <Button
        className="code-copy"
        size="sm"
        variant="ghost"
        aria-label={label}
        onClick={async () => {
          if (!navigator.clipboard) return

          await navigator.clipboard.writeText(text)
          setCopied(true)
        }}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? "Copied" : "Copy"}
      </Button>
      <span className="vc-sr" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

export { CopyButton }
