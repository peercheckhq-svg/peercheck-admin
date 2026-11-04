"use client";

import { isValidElement, useMemo, useState } from "react";
import styles from "./styles/Table.module.css";
import TableHeaderIcon from "@/icons/TableHeaderIcon";
import DropdownInput from "../Input/DropdownInput";

interface TableColumn<TRow extends TableRow> {
  key: string;
  label?: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (
    row: TRow,
    context: {
      selectedRows: Set<string>;
      toggleRowSelection: (id: string) => void;
    },
  ) => React.ReactNode;
  renderHeader?: (context: {
    selectedRows: Set<string>;
    currentData: TRow[];
    toggleAllRows: () => void;
  }) => React.ReactNode;
}

interface TableRow {
  id: string;
}

interface DynamicTableProps<TRow extends TableRow> {
  columns: TableColumn<TRow>[];
  data: TRow[];
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  serverPagination?: boolean;
  totalPages?: number;
  totalItems?: number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

function DynamicTable<TRow extends TableRow>({
  columns,
  data,
  itemsPerPage = 7,
  currentPage: controlledCurrentPage,
  onPageChange,
  perPage: controlledPerPage,
  onPerPageChange,
  serverPagination = false,
  totalPages: controlledTotalPages,
  totalItems,
  isLoading = false,
  emptyTitle = "No records yet",
  emptyMessage = "Data will appear here once available",
}: DynamicTableProps<TRow>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPerPage, setInternalPerPage] = useState(itemsPerPage);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const currentPage = controlledCurrentPage ?? internalCurrentPage;
  const perPage = controlledPerPage ?? internalPerPage;

  const sortedData = useMemo(() => {
    if (!sortColumn) {
      return data;
    }

    return [...data].sort((leftRow, rightRow) => {
      const leftValue: unknown = Reflect.get(leftRow, sortColumn);
      const rightValue: unknown = Reflect.get(rightRow, sortColumn);

      if (leftValue == null && rightValue == null) {
        return 0;
      }

      if (leftValue == null) {
        return sortDirection === "asc" ? 1 : -1;
      }

      if (rightValue == null) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortDirection === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      const leftDate = Date.parse(String(leftValue));
      const rightDate = Date.parse(String(rightValue));

      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
        return sortDirection === "asc"
          ? leftDate - rightDate
          : rightDate - leftDate;
      }

      const leftText = String(leftValue).toLowerCase();
      const rightText = String(rightValue).toLowerCase();
      const comparison = leftText.localeCompare(rightText, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const totalPages = controlledTotalPages
    ? Math.max(1, controlledTotalPages)
    : Math.max(
        1,
        Math.ceil((totalItems ?? sortedData.length) / Math.max(perPage, 1)),
      );
  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (normalizedCurrentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentData = serverPagination
    ? sortedData
    : sortedData.slice(startIndex, endIndex);

  const handlePageChange = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);

    if (controlledCurrentPage === undefined) {
      setInternalCurrentPage(boundedPage);
    }

    onPageChange?.(boundedPage);
  };

  const handlePerPageChange = (nextPerPage: number) => {
    if (controlledPerPage === undefined) {
      setInternalPerPage(nextPerPage);
    }

    onPerPageChange?.(nextPerPage);
    if (serverPagination && onPerPageChange) {
      // The server callback owns the page + page-size update as one operation.
      if (controlledCurrentPage === undefined) setInternalCurrentPage(1);
    } else {
      handlePageChange(1);
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === currentData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentData.map((row) => row.id)));
    }
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons + 2) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.page_button} ${i === normalizedCurrentPage ? styles.active : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>,
        );
      }
    } else {
      buttons.push(
        <button
          key={1}
          className={`${styles.page_button} ${1 === normalizedCurrentPage ? styles.active : ""}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>,
      );

      if (normalizedCurrentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className={styles.page_ellipsis}>
            ...
          </span>,
        );
      }

      const start = Math.max(2, normalizedCurrentPage - 1);
      const end = Math.min(totalPages - 1, normalizedCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            className={`${styles.page_button} ${i === normalizedCurrentPage ? styles.active : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>,
        );
      }

      if (normalizedCurrentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className={styles.page_ellipsis}>
            ...
          </span>,
        );
      }

      buttons.push(
        <button
          key={totalPages}
          className={`${styles.page_button} ${totalPages === normalizedCurrentPage ? styles.active : ""}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  const perPageOptions = [
    { label: "5 / page", value: "5" },
    { label: "10 / page", value: "10" },
    { label: "20 / page", value: "20" },
  ];
  const selectedPerPageOption =
    perPageOptions.find((opt) => Number(opt.value) === perPage) ||
    perPageOptions[0];

  return (
    <div className={styles.dynamic_table}>
      <table className={styles.table}>
        <thead className={styles.table_header}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.headerClassName}>
                {column.renderHeader ? (
                  column.renderHeader({
                    selectedRows,
                    currentData,
                    toggleAllRows,
                  })
                ) : (
                  <div
                    className={styles.header_cell}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className={styles.sort_icon}>
                        <TableHeaderIcon />
                      </span>
                    )}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className={styles.table_row}>
              <td
                className={styles.empty_state_cell}
                colSpan={Math.max(columns.length, 1)}
              >
                <div className={styles.loading_state}>
                  <div className={styles.spinner} />
                  <div className={styles.loading_text}>Loading data...</div>
                </div>
              </td>
            </tr>
          ) : currentData.length === 0 ? (
            <tr className={styles.table_row}>
              <td
                className={styles.empty_state_cell}
                colSpan={Math.max(columns.length, 1)}
              >
                <div className={styles.empty_state}>
                  <svg
                    className={styles.empty_icon}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2M9 2v2h6V2M9 2h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className={styles.empty_state_title}>{emptyTitle}</div>
                  <div className={styles.empty_state_text}>{emptyMessage}</div>
                </div>
              </td>
            </tr>
          ) : (
            currentData.map((row) => (
              <tr key={row.id} className={styles.table_row}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render
                      ? column.render(row, { selectedRows, toggleRowSelection })
                       : renderCell(Reflect.get(row, column.key))}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {sortedData.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.page_info}>
            Page {normalizedCurrentPage} of {totalPages}
          </div>
          <div className={styles.pagination_controls}>
            <button
              className={styles.page_button}
              onClick={() => handlePageChange(1)}
              disabled={normalizedCurrentPage === 1}
            >
              «
            </button>
            <button
              className={styles.page_button}
              onClick={() => handlePageChange(normalizedCurrentPage - 1)}
              disabled={normalizedCurrentPage === 1}
            >
              ‹
            </button>
            {renderPaginationButtons()}
            <button
              className={styles.page_button}
              onClick={() => handlePageChange(normalizedCurrentPage + 1)}
              disabled={normalizedCurrentPage === totalPages}
            >
              ›
            </button>
            <button
              className={styles.page_button}
              onClick={() => handlePageChange(totalPages)}
              disabled={normalizedCurrentPage === totalPages}
            >
              »
            </button>
          </div>
          <div className={styles.per_page_select}>
            <DropdownInput
              type="secondary"
              options={perPageOptions}
              selectedOption={selectedPerPageOption}
              onSelect={(opt) => handlePerPageChange(Number(opt.value))}
              position="top-right"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicTable;

function renderCell(value: unknown): React.ReactNode {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || isValidElement(value)) return value;
  if (Array.isArray(value)) return value.map(renderCell);
  return value == null ? null : String(value);
}
