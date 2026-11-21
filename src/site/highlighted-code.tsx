import { Fragment, type ReactElement } from "react";
import { parse, type ParsedToken } from "sugar-high/core";
import { tokenize } from "sugar-high/lang/typescript";

const positionTokens = (tokens: readonly ParsedToken[]) => {
  let column = 0;

  return tokens
    .filter(token => token.value.length > 0)
    .map(({ type, value }) => {
      const start = column;
      column += value.length;
      return { type, value, column: start };
    });
};

const highlightLines = (text: string) => {
  const { lines } = parse(text, { tokenize });
  let offset = 0;

  return lines.map(line => {
    const start = offset;
    offset = start + line.value.length + 1;
    return { start, tokens: positionTokens(line.tokens), hasNewline: offset <= text.length };
  });
};

function HighlightedCode({ text }: { text: string }): ReactElement {
  return (
    <code>
      {highlightLines(text).map(({ start, tokens, hasNewline }) => (
        <Fragment key={start}>
          <span className="sh__line">
            {tokens.map(({ type, value, column }) => (
              <span key={column} className={`sh__token--${type}`} style={{ color: `var(--sh-${type})` }}>
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
