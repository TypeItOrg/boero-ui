export function getGreeting(date: Date): "Buenos días" | "Buenas tardes" | "Buenas noches" {
  const hour = Number(argentinaHourFormatter.format(date));

  if (hour < 12) {
    return "Buenos días";
  }

  if (hour < 20) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

export const argentinaHourFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: "America/Argentina/Cordoba",
});
