
import { Calendar, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, stringToCalendarDate, calendarDateToString, getCurrentDateInSaoPaulo } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange?: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange
}: DateRangePickerProps) {
  const currentDate = getCurrentDateInSaoPaulo();
  const startDate = dateRange?.start || currentDate;
  const endDate = dateRange?.end || currentDate;
  
  const startDateObj = stringToCalendarDate(startDate);
  const endDateObj = stringToCalendarDate(endDate);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = calendarDateToString(date);
      onDateRangeChange({
        start: dateStr,
        end: endDate
      });
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = calendarDateToString(date);
      onDateRangeChange({
        start: startDate,
        end: dateStr
      });
    }
  };

  return (
    <div className="flex gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 py-0 text-xs gap-1"
          >
            <CalendarIcon className="h-3 w-3" />
            {format(startDateObj, 'dd/MM/yyyy', { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDateObj}
            onSelect={handleStartDateSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground self-center">até</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 py-0 text-xs gap-1"
          >
            <CalendarIcon className="h-3 w-3" />
            {format(endDateObj, 'dd/MM/yyyy', { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDateObj}
            onSelect={handleEndDateSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
