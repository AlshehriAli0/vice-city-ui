import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../../ui/forms/button";

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;

    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <Button
        className="code-copy"
        size="sm"
        variant="ghost"
        aria-label={label}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? "Copied" : "Copy"}
      </Button>
      <span className="vc-sr" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
};

export { CopyButton };
