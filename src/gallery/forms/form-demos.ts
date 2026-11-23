import { formChoicesDemos } from "./choices";
import { formComboboxDemos } from "./combobox";
import { formEntryDemos } from "./entry";
import { formFieldsDemos } from "./fields";
import { formRangesDemos } from "./ranges";
import { formSelectDemos } from "./select";

import "./form-demos.css";

const coreForms = [
  ...formFieldsDemos,
  ...formSelectDemos,
  ...formComboboxDemos,
  ...formChoicesDemos,
  ...formRangesDemos,
  ...formEntryDemos,
];

export { coreForms };
