import { useState } from "react";

import { HudCash } from "../leonida/hud-meters";
import { GameFrame, NeutralScene } from "../leonida/menu-backdrop";
import { NotificationSlot } from "../leonida/mission-toast";
import { createSlot } from "../leonida/mission-toast.store";
import { PhoneDrawer, PhoneDrawerContent, PhoneDrawerTrigger } from "../leonida/phone-drawer";
import { optionValue } from "./options";
import { APP_OPTIONS } from "./phone-options";
import type { Playground } from "./types";
import { useMirroredControl } from "./use-mirrored-control";

export const PhoneDemo = ({ values, set }: Playground) => {
  const [slot] = useState(createSlot);
  const [open, setOpen] = useMirroredControl(Boolean(values.open), next => set("open", next));
  const [app, setApp] = useMirroredControl(optionValue(values.app, APP_OPTIONS) ?? "home", next => set("app", next));
  return (
    <div className="ov-demo">
      <PhoneDrawer open={open} onOpenChange={setOpen} app={app} onAppChange={setApp} slot={slot}>
        <div className="ov-demo__frame">
          <GameFrame className="ov-phone-frame">
            <NeutralScene />
            <HudCash className="ov-phone-cash" wallet={0} bank={3880} />
            <PhoneDrawerContent time={String(values.time)} inCar={Boolean(values.inCar)} />
            <NotificationSlot toaster={slot.toaster} inline />
          </GameFrame>
        </div>
        <div className="ov-demo__trigger">
          <PhoneDrawerTrigger className="g-btn">{open ? "Put phone away" : "Open phone"}</PhoneDrawerTrigger>
        </div>
      </PhoneDrawer>
    </div>
  );
};
