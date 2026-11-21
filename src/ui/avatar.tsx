import {
  Avatar as AvatarRoot,
  AvatarFallback as AvatarFallbackRoot,
  AvatarImage as AvatarImageRoot,
} from "@ui-sdk/react/avatar";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react";

import type { CssVariables } from "./css-variables";
import { merge, styled } from "./cx";

import "./base.css";
import "./avatar.css";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = Omit<ComponentProps<typeof AvatarRoot>, "children"> & {
  size?: AvatarSize;
  ring?: "none" | "sunset" | "pink" | "teal";
  status?: "online" | "busy" | "away" | "wanted";
  shape?: "circle" | "square";
  children?: ReactNode;
};

function Avatar({
  size,
  ring = "none",
  status,
  shape = "circle",
  className,
  children,
  ...props
}: AvatarProps): ReactElement {
  return (
    <AvatarRoot
      role="img"
      {...props}
      className={merge("vc-avatar", className)}
      data-size={size}
      data-ring={ring}
      data-shape={shape}
      data-status={status}
    >
      <span className="vc-avatar__clip">{children}</span>
    </AvatarRoot>
  );
}

type AvatarImageProps = Omit<ComponentProps<typeof AvatarImageRoot>, "style"> & {
  focus?: string;
  origin?: string;
  zoom?: number;
  style?: CSSProperties;
};

function AvatarImage({ focus, origin, zoom, className, style, ...props }: AvatarImageProps): ReactElement {
  const vars = {
    "--avatar-focus": focus,
    "--avatar-origin": origin ?? focus,
    "--avatar-zoom": zoom,
  } satisfies CssVariables;
  return (
    <AvatarImageRoot alt="" {...props} className={merge("vc-avatar__img", className)} style={{ ...vars, ...style }} />
  );
}

const AvatarFallback = styled(AvatarFallbackRoot, "vc-avatar__fallback");

type AvatarGroupProps = PartProps<"div"> & { size?: AvatarSize };

function AvatarGroup({ size, render, className, ...props }: AvatarGroupProps): ReactElement {
  "use memo";

  return renderElement(
    "div",
    {
      role: "group",
      ...props,
      className: merge("vc-avatar-group", className),
      "data-slot": "avatar-group",
      "data-size": size,
    },
    render
  );
}

function AvatarGroupCount({ render, className, ...props }: PartProps<"span">): ReactElement {
  "use memo";

  return renderElement(
    "span",
    { role: "img", ...props, className: merge("vc-avatar-group__more", className), "data-slot": "avatar-group-count" },
    render
  );
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };
export type { AvatarProps };
