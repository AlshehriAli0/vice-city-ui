import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from "../../ui/display/avatar";
import type { CAST } from "./characters";

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Portrait = ({
  member,
  image = true,
  ...props
}: { member: (typeof CAST)[number]; image?: boolean } & Omit<AvatarProps, "children">) => (
  <Avatar aria-label={member.name} {...props}>
    {image && <AvatarImage src={member.src} focus={member.focus} origin={member.origin} zoom={member.zoom} />}
    <AvatarFallback>{initials(member.name)}</AvatarFallback>
  </Avatar>
);

export { Portrait };
