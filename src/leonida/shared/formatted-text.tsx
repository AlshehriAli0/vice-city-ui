import { Fragment } from "react";

const FormattedText = ({ text, emphasis = "em" }: { text: string; emphasis?: "em" | "strong" }) => {
  const matches = [...text.matchAll(/\*([^*]+)\*/g)];
  const endOf = (match: RegExpMatchArray) => (match.index ?? 0) + match[0].length;
  const tail = matches.at(-1);
  return (
    <>
      {matches.map((match, at) => {
        const previous = at > 0 ? matches.at(at - 1) : undefined;
        const Emphasis = emphasis;
        return (
          <Fragment key={match.index}>
            {text.slice(previous ? endOf(previous) : 0, match.index)}
            <Emphasis>{match[1]}</Emphasis>
          </Fragment>
        );
      })}
      {text.slice(tail ? endOf(tail) : 0)}
    </>
  );
};

export { FormattedText };
