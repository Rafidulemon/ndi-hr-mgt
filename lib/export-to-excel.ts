"use client";

import * as XLSX from "xlsx";

type RowValue = string | number | boolean | null | undefined;

export type ExcelRow = Record<string, RowValue>;

export type ExportOptions = {
  fileName: string;
  sheetName?: string;
};

export const exportToExcel = (rows: ExcelRow[], options: ExportOptions) => {
  if (rows.length === 0) {
    throw new Error("No data available to export.");
  }
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options.sheetName ?? "Report",
  );
  XLSX.writeFile(workbook, `${options.fileName.replace(/\\.xlsx$/i, "")}.xlsx`);
};
