export const DEFAULT_TZ = "America/New_York";

const nyOptions: Intl.DateTimeFormatOptions = {
  timeZone: DEFAULT_TZ,
  hour12: true,
};

/** Normalize "YYYY-MM-DD HH:mm:ss" (no Z) to UTC ISO so it parses correctly. */
function toDate(isoString: string): Date {
  const s = isoString.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    return new Date(s.replace(" ", "T") + "Z");
  }
  return new Date(s);
}

/**
 * Format an ISO or date-like string to "Mar 7 • 7:30 PM" in New York time.
 */
export function formatNYDateTime(isoString: string | null | undefined): string {
  if (isoString == null || isoString === "") return "—";
  const date = toDate(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  const datePart = new Intl.DateTimeFormat("en-US", {
    ...nyOptions,
    month: "short",
    day: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    ...nyOptions,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${datePart} • ${timePart}`;
}

/**
 * Format an ISO or date-like string to "7:30 PM" in New York time.
 */
export function formatNYTime(isoString: string | null | undefined): string {
  if (isoString == null || isoString === "") return "—";
  const date = toDate(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    ...nyOptions,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format an ISO or date-like string to "Sat, Mar 7" in New York time.
 */
export function formatNYDate(isoString: string | null | undefined): string {
  if (isoString == null || isoString === "") return "—";
  const date = toDate(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    ...nyOptions,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format time with "ET" suffix for display.
 */
export function formatNYTimeWithET(isoString: string | null | undefined): string {
  const t = formatNYTime(isoString);
  return t === "—" ? t : `${t} ET`;
}

/**
 * Format date+time with "ET" suffix (e.g. "Mar 7 • 7:30 PM ET").
 */
export function formatNYDateTimeWithET(isoString: string | null | undefined): string {
  const s = formatNYDateTime(isoString);
  return s === "—" ? s : `${s} ET`;
}
