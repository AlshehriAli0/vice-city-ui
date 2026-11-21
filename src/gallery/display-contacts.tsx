import type { ReactElement } from "react";

import { toast } from "../leonida/mission-toast.store";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../ui/alert";
import { AvatarGroup, AvatarGroupCount } from "../ui/avatar";
import { Button } from "../ui/button";
import { CAST } from "./display-characters";
import { attrs } from "./display-options";
import { Portrait } from "./display-portrait";
import { optionValue, options as opts } from "./options";
import type { Demo, Playground } from "./types";

const AVATAR_STATUSES = opts(["online", "Online"], ["busy", "Busy"], ["away", "Away"], ["wanted", "Wanted"]);

const AVATAR_SIZES = opts(["xs", "XS"], ["sm", "S"], ["md", "M"], ["lg", "L"], ["xl", "XL"]);

const AVATAR_SHAPES = opts(["circle", "Circle"], ["square", "Square"]);

const AVATAR_RINGS = opts(["none", "None"], ["sunset", "Sunset"], ["pink", "Pink"], ["teal", "Teal"]);

function AvatarDemo({ values: v }: Playground): ReactElement {
  const size = v.size === "md" ? undefined : optionValue(v.size, AVATAR_SIZES);
  const look = {
    shape: optionValue(v.shape, AVATAR_SHAPES),
    ring: optionValue(v.ring, AVATAR_RINGS),
    image: Boolean(v.image),
  };
  if (v.group)
    return (
      <div className="cd-list cd-list--center">
        <AvatarGroup aria-label="Contacts" size={size}>
          {CAST.slice(0, 3).map(member => (
            <Portrait key={member.id} member={member} {...look} />
          ))}
          <AvatarGroupCount aria-label={`${CAST.length - 3} more`}>+{CAST.length - 3}</AvatarGroupCount>
        </AvatarGroup>
      </div>
    );
  const member = CAST[0];
  const status = optionValue(v.status, AVATAR_STATUSES);
  return (
    <div className="cd-list">
      <div className="cd-line">
        <span className="cd-line__lead">
          <Portrait
            member={member}
            {...look}
            size={size}
            status={status}
            aria-label={status ? `${member.name}, ${status}` : member.name}
          />
          <span className="cd-line__main">
            {member.name}
            <small>{member.place}</small>
          </span>
        </span>
        <span className="cd-line__meta">
          {status && AVATAR_STATUSES.find(option => option.value === status)?.label}
        </span>
      </div>
    </div>
  );
}

const ALERT_TONES = opts(["info", "Info"], ["success", "Success"], ["warning", "Warning"], ["danger", "Danger"]);

function AlertDemo({ values: v }: Playground): ReactElement {
  return (
    <div className="cd-stack">
      <Alert tone={optionValue(v.tone, ALERT_TONES)}>
        <AlertTitle>{String(v.title)}</AlertTitle>
        {v.description ? <AlertDescription>{String(v.description)}</AlertDescription> : null}
        {v.action && (
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => toast("Retrying")}>
              Retry
            </Button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}

const displayContactsDemos: Demo[] = [
  {
    id: "core-avatars",
    file: "ui/avatar",
    name: "Avatar",
    sdk: "Avatar",
    caption: "Contact rows with official marketing portraits.",
    controls: [
      { type: "select", name: "status", label: "Status", options: [...opts(["none", "None"]), ...AVATAR_STATUSES] },
      { type: "select", name: "size", label: "Size", options: AVATAR_SIZES },
      { type: "select", name: "shape", label: "Shape", options: AVATAR_SHAPES },
      { type: "select", name: "ring", label: "Ring", options: AVATAR_RINGS },
      { type: "boolean", name: "image", label: "Image" },
      { type: "boolean", name: "group", label: "Group" },
    ],
    defaults: { status: "online", size: "md", shape: "circle", ring: "none", image: true, group: false },
    examples: [
      { label: "Contact", values: {} },
      { label: "Busy", values: { status: "busy", ring: "pink" } },
      { label: "Initials", values: { status: "none", image: false, size: "lg" } },
      { label: "Group", values: { group: true } },
    ],
    code: v => {
      const look = attrs(["shape", v.shape, "circle"], ["ring", v.ring, "none"]);
      const size = attrs(["size", v.size, "md"]);
      const image = v.image ? `    <AvatarImage src="/vc/art-jason.jpg" />\n` : "";
      if (v.group)
        return `<AvatarGroup aria-label="Contacts"${size}>\n  <Avatar aria-label="Jason Duval"${look}>\n${image}    <AvatarFallback>JD</AvatarFallback>\n  </Avatar>\n  {/* … */}\n  <AvatarGroupCount aria-label="1 more">+1</AvatarGroupCount>\n</AvatarGroup>`;
      const status = v.status === "none" ? "" : String(v.status);
      return `<Avatar aria-label="Jason Duval${status ? `, ${status}` : ""}"${size}${look}${attrs(["status", status])}>\n${image.slice(2)}  <AvatarFallback>JD</AvatarFallback>\n</Avatar>`;
    },
    render: playground => <AvatarDemo {...playground} />,
  },
  {
    id: "core-alerts",
    file: "ui/alert",
    name: "Alert",
    sdk: "Alert",
    caption:
      "The mission card as a notice: pink top rule, display title, one line of detail. Every tone draws the same; tone is a hook for your own styles.",
    controls: [
      { type: "select", name: "tone", label: "Tone", options: ALERT_TONES },
      { type: "boolean", name: "action", label: "Action" },
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "description", label: "Description" },
    ],
    defaults: {
      tone: "warning",
      action: true,
      title: "Controller disconnected",
      description: "Reconnect your controller to continue.",
    },
    examples: [
      { label: "Warning", values: {} },
      {
        label: "Info",
        values: {
          tone: "info",
          action: false,
          title: "Settings saved",
          description: "Your changes apply the next time you load.",
        },
      },
      { label: "Success", values: { tone: "success", action: false, title: "Update installed", description: "" } },
    ],
    code: v =>
      [
        `<Alert${attrs(["tone", v.tone, "info"])}>`,
        `  <AlertTitle>${v.title}</AlertTitle>`,
        v.description && `  <AlertDescription>${v.description}</AlertDescription>`,
        v.action && `  <AlertAction>\n    <Button size="sm" variant="outline">Retry</Button>\n  </AlertAction>`,
        `</Alert>`,
      ]
        .filter(Boolean)
        .join("\n"),
    render: playground => <AlertDemo {...playground} />,
  },
];

export { displayContactsDemos };
