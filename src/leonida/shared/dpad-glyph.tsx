const ACTIVE_ARMS = { up: ["up"], vertical: ["up", "down"], horizontal: ["left", "right"] };

const DpadGlyph = ({ axis }: { axis?: "vertical" | "horizontal" | "up" }) => {
  const lit = axis ? ACTIVE_ARMS[axis] : [];
  const on = (part: string) => lit.includes(part);
  const arm = (part: "up" | "down" | "left" | "right", d: string) => <path d={d} data-on={on(part) || undefined} />;
  return (
    <svg className="ld-dpad" data-slot="dpad-glyph" viewBox="0 0 32 32" aria-hidden="true">
      {arm("up", "M12.6 3h6.8v7.4L16 13.8l-3.4-3.4z")}
      {arm("down", "M12.6 29h6.8v-7.4L16 18.2l-3.4 3.4z")}
      {arm("left", "M3 12.6v6.8h7.4l3.4-3.4-3.4-3.4z")}
      {arm("right", "M29 12.6v6.8h-7.4L18.2 16l3.4-3.4z")}
    </svg>
  );
};

export { DpadGlyph };
