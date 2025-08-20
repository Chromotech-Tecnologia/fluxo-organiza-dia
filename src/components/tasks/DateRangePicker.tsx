
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startInputValue, setStartInputValue] = useState(startDate);
  const [endInputValue, setEndInputValue] = useState(endDate);

  const parseDate = (dateString: string): Date | null => {
    try {
      // Tentar formato YYYY-MM-DD primeiro
      let parsed = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(parsed)) return parsed;
      
      // Tentar formato DD/MM/YYYY
      parsed = parse(dateString, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) return parsed;
      
      // Tentar formato DD-MM-YYYY
      parsed = parse(dateString, 'dd-MM-yyyy', new Date());
      if (isValid(parsed)) return parsed;
      
      return null;
    } catch {
      return null;
    }
  };

  const handleStartInputChange = (value: string) => {
    setStartInputValue(value);
    const parsed = parseDate(value);
    if (parsed) {
      onStartDateChange(format(parsed, 'yyyy-MM-dd'));
    }
  };

  const handleEndInputChange = (value: string) => {
    setEndInputValue(value);
    const parsed = parseDate(value);
    if (parsed) {
      onEndDateChange(format(parsed, 'yyyy-MM-dd'));
    }
  };

  const handleStartCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      onStartDateChange(formatted);
      setStartInputValue(formatted);
      setStartOpen(false);
    }
  };

  const handleEndCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      onEndDateChange(formatted);
      setEndInputValue(formatted);
      setEndOpen(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="flex">
          <Input
            placeholder="Data inicial (YYYY-MM-DD)"
            value={startInputValue}
            onChange={(e) => handleStartInputChange(e.target.value)}
            className="rounded-r-none"
          />
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-l-none border-l-0 px-3">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(startDate) || undefined}
                onSelect={handleStartCalendarSelect}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex">
          <Input
            placeholder="Data final (YYYY-MM-DD)"
            value={endInputValue}
            onChange={(e) => handleEndInputChange(e.target.value)}
            className="rounded-r-none"
          />
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-l-none border-l-0 px-3">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(endDate) || undefined}
                onSelect={handleEndCalendarSelect}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
