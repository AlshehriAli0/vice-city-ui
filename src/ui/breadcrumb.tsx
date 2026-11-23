import { renderElement, type PartProps } from "@ui-sdk/react/primitive";

import { merge } from "./cx";
import { plain } from "./plain";

import "./base.css";
import "./breadcrumb.css";

const Breadcrumb = ({ render, className, ...props }: PartProps<"nav">) => {
  "use memo";

  return renderElement(
    "nav",
    { "aria-label": "Breadcrumb", ...props, className: merge("vc-crumbs", className), "data-slot": "breadcrumb" },
    render
  );
};

const BreadcrumbList = plain("ol", "breadcrumb-list", "vc-crumbs__list");
const BreadcrumbItem = plain("li", "breadcrumb-item", "vc-crumbs__item");
const BreadcrumbLink = plain("a", "breadcrumb-link", "vc-crumbs__link");

const BreadcrumbPage = ({ render, className, ...props }: PartProps<"span">) => {
  "use memo";

  return renderElement(
    "span",
    {
      "aria-current": "page",
      ...props,
      className: merge("vc-crumbs__current", className),
      "data-slot": "breadcrumb-page",
    },
    render
  );
};

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage };
