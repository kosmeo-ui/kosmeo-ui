import { Col, Pagination } from "@kosmeo-ui/react";
import { useState } from "react";

const TOTAL = 240;

export const PaginationExample = () => {
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(25);
  const [smallPage, setSmallPage] = useState(1);

  return (
    <Col size="lg">
      {/* Full: summary, numbered pages and a page-size picker. */}
      <Pagination
        page={page}
        pageCount={Math.ceil(TOTAL / pageSize)}
        onPageChange={setPage}
        total={TOTAL}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        aria-label="Full example pages"
      />
      {/* Just the page buttons, small, with two pages either side. */}
      <Pagination
        size="sm"
        page={smallPage}
        pageCount={20}
        onPageChange={setSmallPage}
        siblingCount={2}
        aria-label="Small example pages"
      />
    </Col>
  );
};
