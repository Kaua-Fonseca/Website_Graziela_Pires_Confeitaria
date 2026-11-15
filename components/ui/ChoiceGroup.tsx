import { Button } from "./Button";

type ChoiceGroupProps = {
  label: string;
  options: string[];
  value: string;
  setValue: (value: string) => void;
};

export function ChoiceGroup({ label, options, value, setValue }: ChoiceGroupProps) {
  return (
    <div className="choice-group">
      <strong>{label}</strong>
      <div>
        {options.map((option) => (
          <Button key={option} variant="ghost" className={value === option ? "selected" : ""} onClick={() => setValue(option)}>
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
