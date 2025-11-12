import React from "react";
import Text from "../Text/Text";

type Props = {
  className?: string;
  background?: string;
  isSquareBox?: boolean;
  title?: string;
  isTransparentBackground?: boolean;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Card = (props: Props) => {
  const {
    className = "",
    background,
    isSquareBox = false,
    isTransparentBackground = false,
    title,
    ...others
  } = props;

  const rounding = isSquareBox ? "rounded-2xl" : "rounded-[28px]";
  const borderClass = isTransparentBackground
    ? "border border-dashed border-slate-200/80"
    : "border border-white/60 shadow-xl shadow-indigo-100 backdrop-blur";
  const backgroundClass = background
    ? background.startsWith("bg-")
      ? background
      : `bg-${background}`
    : isTransparentBackground
    ? "bg-white/70"
    : "bg-white/90";

  return (
    <div
      className={`${rounding} relative w-full overflow-hidden ${borderClass} ${backgroundClass} ${className}`}
    >
      {!isTransparentBackground && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent" />
      )}
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8">
        {title && (
          <div className="space-y-2">
            <Text
              text={title}
              className="text-2xl font-semibold text-slate-900"
            />
            <div className="section-divider" />
          </div>
        )}
        <div {...others} className="flex flex-col gap-6" />
      </div>
    </div>
  );
};
