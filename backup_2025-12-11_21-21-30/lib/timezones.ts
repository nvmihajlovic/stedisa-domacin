/**
 * List of common timezones for user selection
 * Grouped by region for better UX
 */

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: TimezoneOption[] = [
  // Europe
  { value: 'Europe/Belgrade', label: 'Beograd (CET)', offset: 'UTC+1' },
  { value: 'Europe/Sarajevo', label: 'Sarajevo (CET)', offset: 'UTC+1' },
  { value: 'Europe/Podgorica', label: 'Podgorica (CET)', offset: 'UTC+1' },
  { value: 'Europe/Zagreb', label: 'Zagreb (CET)', offset: 'UTC+1' },
  { value: 'Europe/Skopje', label: 'Skopje (CET)', offset: 'UTC+1' },
  { value: 'Europe/Ljubljana', label: 'Ljubljana (CET)', offset: 'UTC+1' },
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome (CET)', offset: 'UTC+1' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 'UTC+1' },
  { value: 'Europe/Athens', label: 'Athens (EET)', offset: 'UTC+2' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
  
  // Americas
  { value: 'America/New_York', label: 'New York (EST)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Chicago (CST)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Denver (MST)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: 'UTC-8' },
  { value: 'America/Toronto', label: 'Toronto (EST)', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Vancouver (PST)', offset: 'UTC-8' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: 'UTC-6' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: 'UTC-3' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },
  
  // Australia & Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 'UTC+13' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', offset: 'UTC+2' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', offset: 'UTC+3' },
];

/**
 * Get user's browser timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Belgrade';
}

/**
 * Format date in specific timezone
 */
export function formatInTimezone(date: Date, timezone: string, format: string = 'long'): string {
  if (format === 'long') {
    return new Intl.DateTimeFormat('sr-RS', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else if (format === 'short') {
    return new Intl.DateTimeFormat('sr-RS', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else {
    return new Intl.DateTimeFormat('sr-RS', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
