import { ReactElement } from "react";

type DynamicColor = {
  columnName: string;
  textColors: {
    text: string;
    color: string;
  }[];
};

type TableProps = {
  headers: string[];
  rows: Array<Record<string, string | number | ReactElement>>;
  className?: string;
  dynamicColorValues?: DynamicColor[];
  isTextCenter?: boolean;
  onRowClick?: (row: Record<string, string | number | ReactElement>) => void;
};

export function Table(props: TableProps) {
  const {
    headers,
    rows,
    className,
    dynamicColorValues,
    isTextCenter = false,
    onRowClick,
  } = props;
  return (
    <div className={`bg-white overflow-x-auto ${className}`}>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-black">
            {headers.map((header, index) => (
              <th
                key={index}
                className={`${
                  isTextCenter ? "text-center" : "text-left"
                }  py-2 px-4 font-semibold text-gray-700`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-300 ${
                onRowClick ? "cursor-pointer hover:bg-gray-100 " : ""
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {headers.map((header, headerIndex) => {
                const dynamicColorConfig = dynamicColorValues?.find(
                  (colorConfig) => colorConfig.columnName === header
                );

                const textColors = dynamicColorConfig?.textColors?.find(
                  (textColor) => {
                    if (row[header] === textColor?.text) {
                      return textColor?.color;
                    }
                    return null;
                  }
                )?.color;

                return (
                  <td
                    key={headerIndex}
                    className={`${
                      isTextCenter ? "text-center" : "text-left"
                    } py-2 px-4  `}
                    style={{ color: textColors || "gray" }}
                  >
                    {row[header] || "N/A"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
