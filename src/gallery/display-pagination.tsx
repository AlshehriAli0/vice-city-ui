import type { ReactElement } from "react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "../ui/breadcrumb";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { attrs } from "./display-options";
import { options as opts } from "./options";
import type { Demo, Playground } from "./types";

const PAGES = 12;

function NavDemo({ values: v, set }: Playground): ReactElement {
  if (v.component === "breadcrumb")
    return (
      <div className="cd-list">
        <Breadcrumb aria-label="Store">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#core-nav">Clothing store</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>{String(v.current).trim() || "T-shirts"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  const page = Number(v.page);
  return (
    <div className="cd-list">
      <div className="cd-pager">
        <p className="cd-count">
          {page} <i>/</i> <i>{PAGES}</i>
        </p>
        <Pagination
          aria-label="Results pages"
          pageCount={PAGES}
          page={page}
          onPageChange={next => set("page", next)}
          disabled={Boolean(v.disabled)}
        >
          <PaginationList>
            {({ items }) => (
              <>
                <PaginationItem>
                  <PaginationPrevious />
                </PaginationItem>
                {items.map(item => (
                  <PaginationItem key={item}>
                    {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext />
                </PaginationItem>
              </>
            )}
          </PaginationList>
        </Pagination>
      </div>
    </div>
  );
}

const displayPaginationDemos: Demo[] = [
  {
    id: "core-nav",
    file: "ui/pagination",
    keys: [
      ["Tab", "Move between links and pages"],
      ["Enter", "Follow a link or go to a page"],
    ],
    name: "Navigation",
    sdk: "Pagination · Breadcrumb",
    caption:
      "The store's page counter with pagination, and its breadcrumb: dim levels with a slash, the current level bright.",
    controls: [
      {
        type: "select",
        name: "component",
        label: "Component",
        options: opts(["pagination", "Pagination"], ["breadcrumb", "Breadcrumb"]),
      },
      { type: "number", name: "page", label: "Page", min: 1, max: PAGES },
      { type: "boolean", name: "disabled", label: "Disabled" },
      { type: "text", name: "current", label: "Current page" },
    ],
    defaults: { component: "pagination", page: 4, disabled: false, current: "T-shirts" },
    examples: [
      { label: "Pagination", values: {} },
      { label: "Last page", values: { page: PAGES } },
      { label: "Breadcrumb", values: { component: "breadcrumb" } },
    ],
    code: v =>
      v.component === "breadcrumb"
        ? `<Breadcrumb aria-label="Store">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/store">Clothing store</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>${String(v.current).trim() || "T-shirts"}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`
        : `<Pagination aria-label="Results pages" pageCount={${PAGES}} page={${v.page}} onPageChange={setPage}${attrs(["disabled", v.disabled])}>
  <PaginationList>
    {({ items }) => <>
      <PaginationItem><PaginationPrevious /></PaginationItem>
      {items.map((item) => (
        <PaginationItem key={item}>
          {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
        </PaginationItem>
      ))}
      <PaginationItem><PaginationNext /></PaginationItem>
    </>}
  </PaginationList>
</Pagination>`,
    render: playground => <NavDemo {...playground} />,
  },
];

export { displayPaginationDemos };
