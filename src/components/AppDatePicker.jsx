import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/** Parse expense date strings (local midday) without timezone shift. */
export function parseExpenseDate(dateValue) {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) return dateValue;

  const str = String(dateValue);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function AppDatePicker({
  className = "",
  wrapperClassName = "w-full",
  usePortal = false,
  dateFormat,
  ...props
}) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <DatePicker
        dateFormat={dateFormat ?? "MMM d, yyyy"}
        showPopperArrow={false}
        popperClassName="trackwise-datepicker-popper"
        calendarClassName="trackwise-datepicker"
        popperPlacement="bottom-start"
        withPortal={usePortal}
        className={`w-full border border-gray-200 p-2 rounded bg-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}
