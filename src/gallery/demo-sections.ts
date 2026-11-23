import type { Section } from "./demo";
import { coreDisplay } from "./display/display-demos";
import { coreForms } from "./forms/form-demos";
import { hud } from "./hud/hud";
import { mapDemo, pauseMenuDemo, settingsDemo } from "./menus/menu-screens";
import { modShopDemos } from "./menus/mod-shop";
import { saveScreenDemos } from "./menus/save-screen";
import { phone } from "./phone/phone-demos";
import { official } from "./postcards/postcard-demos";
import { menuWheelDemos } from "./wheel-radio/wheel-radio-demos";

import "../leonida/shared/game-ui.css";

const demoSections: Section[] = [
  { id: "hud", title: "HUD", demos: hud },
  { id: "menus", title: "Menus", demos: [pauseMenuDemo, ...saveScreenDemos, settingsDemo, mapDemo, ...modShopDemos] },
  { id: "wheel-radio", title: "Wheel & radio", demos: menuWheelDemos },
  { id: "phone", title: "Phone", demos: phone },
  { id: "leonida", title: "Leonida", demos: official },
  { id: "forms", title: "Forms", demos: coreForms },
  { id: "display", title: "Display", demos: coreDisplay },
];

export { demoSections };
