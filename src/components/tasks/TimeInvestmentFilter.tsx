
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TimeInvestmentFilterProps {
  selectedTimeInvestments: string[];
  onTimeInvestmentChange: (timeInvestments: string[]) => void;
}

const TIME_INVESTMENT_OPTIONS = [
  { value: 'custom-5', label: '5 minutos' },
  { value: 'custom-30', label: '30 minutos' },
  { value: 'low', label: '1 hora' },
  { value: 'medium', label: '2 horas' },
  { value: 'high', label: '4 horas' },
  { value: 'custom-4h', label: '4 horas' },
  { value: 'custom-8h', label: '8 horas' },
  { value: 'custom', label: 'Personalizado' }
];

export function TimeInvestmentFilter({ selectedTimeInvestments, onTimeInvestmentChange }: TimeInvestmentFilterProps) {
  const handleTimeInvestmentSelect = (value: string) => {
    if (value && !selectedTimeInvestments.includes(value)) {
      onTimeInvestmentChange([...selectedTimeInvestments, value]);
    }
  };

  const removeTimeInvestment = (timeInvestment: string) => {
    onTimeInvestmentChange(selectedTimeInvestments.filter(t => t !== timeInvestment));
  };

  const getTimeInvestmentLabel = (value: string) => {
    return TIME_INVESTMENT_OPTIONS.find(option => option.value === value)?.label || value;
  };

  return (
    <div className="space-y-2">
      <Select onValueChange={handleTimeInvestmentSelect} value="">
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por tempo" />
        </SelectTrigger>
        <SelectContent>
          {TIME_INVESTMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedTimeInvestments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTimeInvestments.map((timeInvestment) => (
            <Badge key={timeInvestment} variant="secondary" className="text-xs">
              {getTimeInvestmentLabel(timeInvestment)}
              <button
                onClick={() => removeTimeInvestment(timeInvestment)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
