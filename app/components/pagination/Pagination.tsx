'use client';

import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";

type PaginationProps<T> = {
  data: T[];
  postsPerPage: number;
  setCurrentPageData: (currentPageData: T[]) => void;
};

export default function Pagination<T>({
  data,
  postsPerPage,
  setCurrentPageData,
}: PaginationProps<T>) {
  const [pageNumber, setPageNumber] = useState(0);

  const pageCount = Math.max(1, Math.ceil(data.length / postsPerPage));

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  useEffect(() => {
    const startIndex = pageNumber * postsPerPage;
    const currentPageData = data.slice(startIndex, startIndex + postsPerPage);
    setCurrentPageData(currentPageData);
  }, [pageNumber, data, postsPerPage, setCurrentPageData]);

  const rangeSummary = useMemo(() => {
    if (data.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = pageNumber * postsPerPage + 1;
    const end = Math.min(data.length, (pageNumber + 1) * postsPerPage);
    return { start, end };
  }, [data.length, pageNumber, postsPerPage]);

  const pillClass =
    "inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none";

  return (
    <div className="mt-6 rounded-[28px] border border-white/60 bg-white/90 p-4 shadow-inner shadow-white/40">
      <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Showing{" "}
          <span className="text-slate-900">
            {rangeSummary.start}-{rangeSummary.end}
          </span>{" "}
          of <span className="text-slate-900">{data.length}</span> records
        </p>
        <ReactPaginate
          breakLabel="..."
          nextLabel="Next"
          onPageChange={changePage}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="Prev"
          containerClassName="flex flex-wrap items-center gap-2"
          pageLinkClassName={pillClass}
          previousLinkClassName={pillClass}
          nextLinkClassName={pillClass}
          breakLinkClassName={`${pillClass} cursor-default`}
          activeLinkClassName="bg-indigo-600 text-white border-indigo-600 hover:text-white"
          disabledLinkClassName="opacity-40 cursor-not-allowed pointer-events-none"
        />
      </div>
    </div>
  );
}
