import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';

interface MaskedInputProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, placeholder, className, disabled }, ref) => {
    return (
      <InputMask
        mask={mask}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            ref={ref}
            placeholder={placeholder}
            className={className}
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';