import { Fragment, type ReactElement } from "react";
import { parse } from "sugar-high/core";
import { tokenize } from "sugar-high/lang/typescript";

const highlightLines = (text: string) => {
  const { lines } = parse(text, { tokenize });
  let offset = 0;

  return lines.map(line => {
    const start = offset;
    offset = start + line.value.length + 1;
    return { start, tokens: line.tokens, hasNewline: offset <= text.length };
  });
};

function HighlightedCode({ text }: { text: string }): ReactElement {
  return (
    <code>
      {highlightLines(text).map(({ start, tokens, hasNewline }) => (
        <Fragment key={start}>
          <span className="sh__line">
            {/* Keyed by order: empty tokens share a position, and the list never reorders. */}
            {tokens.map(({ type, value }, index) => (
              <span key={index} className={`sh__token--${type}`} style={{ color: `var(--sh-${type})` }}>
                {value}
              </span>
            ))}
          </span>
          {hasNewline && "\n"}
        </Fragment>
      ))}
    </code>
  );
}

export { HighlightedCode };
