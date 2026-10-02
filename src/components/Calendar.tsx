import { Button } from "@react95/core";
import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function Calendar({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [now, setNow] = useState(today);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on outside click, but not on the clock itself (it toggles us).
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!ref.current?.contains(target) && !target.closest(".tray-clock")) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isThisMonth =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const shift = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div ref={ref} className="calendar" role="dialog" aria-label="Calendar">
      <div className="calendar-head">
        <Button onClick={() => shift(-1)} aria-label="Previous month">
          ◀
        </Button>
        <b>{month.toLocaleDateString([], { month: "long", year: "numeric" })}</b>
        <Button onClick={() => shift(1)} aria-label="Next month">
          ▶
        </Button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="calendar-weekday">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={isThisMonth && day === today.getDate() ? "calendar-today" : undefined}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
      <div className="calendar-time">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
    </div>
  );
}

export default Calendar;
