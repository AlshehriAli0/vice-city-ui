import {
  Pagination as PaginationRoot,
  PaginationEllipsis as PaginationEllipsisRoot,
  PaginationFirst as PaginationFirstRoot,
  PaginationItem,
  PaginationLast as PaginationLastRoot,
  PaginationLink as PaginationLinkRoot,
  PaginationList as PaginationListRoot,
  PaginationNext as PaginationNextRoot,
  PaginationPrevious as PaginationPreviousRoot,
} from "@ui-sdk/react/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import { merge, styled } from "../../shared/class-names";

import "../shared/base.css";
import "./pagination.css";

const Pagination = styled(PaginationRoot, "vc-pagination");
const PaginationList = styled(PaginationListRoot, "vc-pagination__list");
const PaginationLink = styled(PaginationLinkRoot, "vc-pagination__link");
const PaginationEllipsis = styled(PaginationEllipsisRoot, "vc-pagination__gap");
const PaginationFirst = styled(PaginationFirstRoot, "vc-pagination__step");
const PaginationLast = styled(PaginationLastRoot, "vc-pagination__step");

const PaginationPrevious = ({ className, children, ...props }: ComponentProps<typeof PaginationPreviousRoot>) => (
  <PaginationPreviousRoot
    aria-label={children ? undefined : "Previous page"}
    {...props}
    className={merge("vc-pagination__step", className)}
  >
    {children ?? <ChevronLeft className="vc-pagination__chev" aria-hidden="true" />}
  </PaginationPreviousRoot>
);

const PaginationNext = ({ className, children, ...props }: ComponentProps<typeof PaginationNextRoot>) => (
  <PaginationNextRoot
    aria-label={children ? undefined : "Next page"}
    {...props}
    className={merge("vc-pagination__step", className)}
  >
    {children ?? <ChevronRight className="vc-pagination__chev" aria-hidden="true" />}
  </PaginationNextRoot>
);

export {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
};
