import { Fragment } from "react";
import { parse, type ParsedToken, type TokenType } from "sugar-high/core";
import { tokenize } from "sugar-high/lang/typescript";

const plainTokens = new Set<TokenType>(["space", "identifier", "jsxliterals", "break"]);

type CodeRun = { type: TokenType | null; value: string; column: number };

const groupTokens = (tokens: readonly ParsedToken[]): CodeRun[] => {
  const runs: CodeRun[] = [];
  let column = 0;

  for (const token of tokens) {
    if (!token.value.length) continue;

    const type = plainTokens.has(token.type) ? null : token.type;
    const previous = runs.at(-1);
    if (previous && previous.type === type) previous.value += token.value;
    else runs.push({ type, value: token.value, column });
    column += token.value.length;
  }
  return runs;
};

const highlightLines = (text: string) => {
  const { lines } = parse(text, { tokenize });
  let offset = 0;

  return lines.map(line => {
    const start = offset;
    offset = start + line.value.length + 1;
    return { start, tokens: groupTokens(line.tokens), hasNewline: offset <= text.length };
  });
};

const HighlightedCode = ({ text }: { text: string }) => (
  <code>
    {highlightLines(text).map(({ start, tokens, hasNewline }) => (
      <Fragment key={start}>
        <span className="sh__line">
          {tokens.map(({ type, value, column }) =>
            type === null ? (
              value
            ) : (
              <span key={column} className={`sh__token--${type}`}>
                {value}
              </span>
            )
          )}
        </span>
        {hasNewline && "\n"}
      </Fragment>
    ))}
  </code>
);

export { HighlightedCode };
