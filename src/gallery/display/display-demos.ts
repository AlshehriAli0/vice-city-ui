import { displayCardsDemos } from "./cards";
import { displayContactsDemos } from "./contacts";
import { displayDataDemos } from "./data";
import { displayDialogsDemos } from "./dialogs";
import { displayFloatingDemos } from "./floating";
import { displayMenuDemos } from "./menu";
import { displayPaginationDemos } from "./pagination";
import { displayTabsDemos } from "./tabs";

import "./display-demos.css";

const coreDisplay = [
  ...displayCardsDemos,
  ...displayContactsDemos,
  ...displayTabsDemos,
  ...displayPaginationDemos,
  ...displayDialogsDemos,
  ...displayFloatingDemos,
  ...displayMenuDemos,
  ...displayDataDemos,
];

export { coreDisplay };
