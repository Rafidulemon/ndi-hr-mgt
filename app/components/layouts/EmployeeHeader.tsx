import Text from "../atoms/Text/Text";
import Button from "../atoms/buttons/Button";

interface LayoutProps {
  name: string;
  designation: string;
  joining_date: string;
  hasRightButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function EmployeeHeader(props: LayoutProps) {
  const {
    name = "",
    designation = "",
    joining_date = "",
    hasRightButton = false,
    buttonText = "Click here",
    onButtonClick,
  } = props;

  return (
    <div className="glass-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Text
          text={name}
          className="text-3xl font-semibold text-slate-900"
          isBold
        />
        <p className="mt-1 text-sm text-slate-500">
          {designation} · Joined on {joining_date}
        </p>
      </div>
      {hasRightButton && (
        <Button theme="primary" onClick={onButtonClick}>
          <Text text={buttonText} className="font-semibold px-6" />
        </Button>
      )}
    </div>
  );
}
