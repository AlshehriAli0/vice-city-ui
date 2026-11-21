import type { ReactElement } from "react";

import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from "../ui/avatar";
import type { CAST } from "./display-characters";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Portrait({
  member,
  image = true,
  ...props
}: { member: (typeof CAST)[number]; image?: boolean } & Omit<AvatarProps, "children">): ReactElement {
  return (
    <Avatar aria-label={member.name} {...props}>
      {image && <AvatarImage src={member.src} focus={member.focus} origin={member.origin} zoom={member.zoom} />}
      <AvatarFallback>{initials(member.name)}</AvatarFallback>
    </Avatar>
  );
}

export { Portrait };
