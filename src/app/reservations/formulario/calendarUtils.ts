export function isDayBooked(date: Date, bookedDates: string[], today: Date): boolean {
  const d = date.toISOString().slice(0, 10);
  const isSameOrAfterToday = (a: Date, b: Date): boolean =>
    a.getFullYear() > b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() > b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() >= b.getDate());
  return bookedDates.includes(d) && isSameOrAfterToday(date, today);
}

export function isDayFree(date: Date, bookedDates: string[], today: Date): boolean {
  const d = date.toISOString().slice(0, 10);
  const isSameOrAfterToday = (a: Date, b: Date): boolean =>
    a.getFullYear() > b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() > b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() >= b.getDate());
  return !bookedDates.includes(d) && isSameOrAfterToday(date, today);
}