import React from "react";
import Text from "../Text/Text";

type Props = {
  className?: string;
  title?: string;
  titleColor?: string;
  titleBarSize?: string;
  isSquareBox?: boolean;
  isItalicHeader?: boolean;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const CardWithHeader = (props: Props) => {
  const {
    className = "",
    title = "",
    titleColor = "bg-primary",
    titleBarSize = "h-14",
    isSquareBox = false,
    isItalicHeader = false,
    ...others
  } = props;

  const rounding = isSquareBox ? "rounded-2xl" : "rounded-[28px]";
  const accentColor = titleColor.startsWith("bg-")
    ? titleColor
    : `bg-${titleColor}`;

  return (
    <div
      className={`${rounding} relative w-full overflow-hidden border border-white/60 bg-white/90 p-6 shadow-xl shadow-indigo-100 backdrop-blur ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent" />
      <div className="relative z-10 flex flex-col gap-6">
        <div className={`flex items-center gap-4 ${titleBarSize}`}>
          <div
            className={`${accentColor} flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-200`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              {title.slice(0, 2)}
            </span>
          </div>
          <Text
            text={title}
            className={`text-xl font-semibold text-slate-900 ${
              isItalicHeader ? "italic" : ""
            }`}
          />
        </div>
        <div className="section-divider" />
        <div {...others} className="flex flex-col gap-4" />
      </div>
    </div>
  );
};
