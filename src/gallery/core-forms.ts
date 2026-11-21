import { formChoicesDemos } from "./form-choices";
import { formComboboxDemos } from "./form-combobox";
import { formEntryDemos } from "./form-entry";
import { formFieldsDemos } from "./form-fields";
import { formRangesDemos } from "./form-ranges";
import { formSelectDemos } from "./form-select";

import "./core-forms.css";

const coreForms = [
  ...formFieldsDemos,
  ...formSelectDemos,
  ...formComboboxDemos,
  ...formChoicesDemos,
  ...formRangesDemos,
  ...formEntryDemos,
];

export { coreForms };
