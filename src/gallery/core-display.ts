import { displayCardsDemos } from "./display-cards";
import { displayContactsDemos } from "./display-contacts";
import { displayDataDemos } from "./display-data";
import { displayDialogsDemos } from "./display-dialogs";
import { displayFloatingDemos } from "./display-floating";
import { displayMenuDemos } from "./display-menu";
import { displayPaginationDemos } from "./display-pagination";
import { displayTabsDemos } from "./display-tabs";

import "./core-display.css";

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
