"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";
import React from "react";

export default function Pagination({
  page,
  count,
}: {
  page: number;
  count: number;
}) {
  const router = useRouter();

  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <div className="py-4 sm:p-4 flex justify-between items-center text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-2 sm:px-4 rounded-md bg-gray-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>
      <div className="flex items-center gap-0 sm:gap-2 text-xs sm:text-sm">
        {Array.from(
          { length: Math.ceil(count / ITEM_PER_PAGE) },
          (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                onClick={() => changePage(pageNumber)}
                key={pageNumber}
                className={`px-2 rounded-sm ${
                  page === pageNumber ? "bg-sky " : ""
                }`}
              >
                {pageNumber}
              </button>
            );
          }
        )}
      </div>
      <button
        disabled={!hasNext}
        className="py-2 px-2 sm:px-4 rounded-md bg-gray-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
