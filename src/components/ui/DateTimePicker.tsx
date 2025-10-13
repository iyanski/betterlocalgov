import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';

interface DateTimePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DateTimePicker({
  label = 'Publish date',
  value,
  onChange,
  placeholder = 'Select date and time',
  className = '',
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    onChange?.(date);
  };

  const CalendarIcon = () => (
    <Calendar className="h-4 w-4 text-gray-500 dark:text-white" />
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm a"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="yyyy-MM-dd HH:mm a"
            placeholderText={placeholder}
            disabled={disabled}
            className="w-full text-sm pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-green-400 dark:focus:border-green-400"
            calendarClassName="shadow-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            dayClassName={date => {
              const isSelected =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString();
              return isSelected
                ? 'bg-green-500 text-white font-bold rounded'
                : 'hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 rounded';
            }}
            weekDayClassName={() => 'text-gray-500 dark:text-gray-400 text-sm'}
            monthClassName={() =>
              'text-gray-800 dark:text-gray-200 font-semibold'
            }
            yearClassName={() =>
              'text-gray-800 dark:text-gray-200 font-semibold'
            }
            previousMonthButtonLabel="<<"
            nextMonthButtonLabel=">>"
            showPopperArrow={false}
            popperClassName="z-50"
            popperPlacement="bottom-start"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <CalendarIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
