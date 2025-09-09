import React, { useState, useEffect } from "react";

interface FormattedNumberInputProps {
  value: number;
  onChange: (newValue: number) => void;
  placeholder?: string;
  className?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    (value || 0).toLocaleString()
  );

  useEffect(() => {
    setDisplayValue((value || 0).toLocaleString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const num = Number(raw) || 0;
    setDisplayValue(raw === "" ? "" : num.toLocaleString());
    onChange(num);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default FormattedNumberInput;
