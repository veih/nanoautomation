// utils/dateUtils.ts (crie esse arquivo em /app/components/utils/)
export function isoToInputDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toISOString().split("T")[0]; // yyyy-MM-dd
}

export function inputDateToIsoLocal(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // cria no fuso local
  return date.toISOString(); // UTC ISO string
}

export function isoToLocalBR(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatDateBR(isoDate: string, showTime = false) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(showTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return date.toLocaleString("pt-BR", options);
}
