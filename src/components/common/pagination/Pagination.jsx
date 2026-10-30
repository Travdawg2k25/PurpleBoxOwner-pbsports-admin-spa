import React from "react";
import ReactPaginate from "react-paginate";
export default function Pagination({
  pageNumber,
  perPage,
  paginationList,
  pageRange,
  pageCount,
  handlePageClick,
  paginationClass, onPageActive
}) {
  const imageUrl = "./img/";
  return (
    <div className="px-3 store-pagination pagination__body">
      <div
        className={`flex items-center justify-end ${paginationClass}`}    >
        <ReactPaginate
          breakLabel="..." previousLabel={"<"}
          nextLabel={">"}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={"pagination flex gap-1"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"pagination__link--active active !bg-[#351367] text-[#FEE801]"}
          pageClassName="pagination-list page-item bg-[#F1F2F6] p-1 px-3 rounded-[4px] font_B text-sm"
          previousLinkClassName={"pagination__link text-decoration-none"}
          nextLinkClassName={"pagination__link text-decoration-none"}
          nextClassName=" page-item  bg-[#F1F2F6] p-1 px-3 rounded-[4px] font_B text-sm"
          previousClassName=" page-item bg-[#F1F2F6] p-1 px-3 rounded-[4px] font_B text-sm"
          onPageActive={onPageActive}
        // forcePage={onPageActive - 1}
        />
      </div>
    </div>
  );
}
