/**
 * Locale-aware date and time formatting utilities
 */

export interface LocaleConfig {
  language: string;
  region: string;
  timeZone: string;
}

// Get user's locale configuration
export const getUserLocale = (): LocaleConfig => {
  const language = typeof navigator !== 'undefined'
    ? navigator.language || 'en-US'
    : 'en-US';

  // Extract language and region from locale string (e.g., "en-US" -> { language: "en", region: "US" })
  const [lang, region] = language.split('-');

  // Get timezone
  const timeZone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  return {
    language: lang || 'en',
    region: region || 'US',
    timeZone
  };
};

// Format date according to user's locale
export const formatDate = (date: string | Date, options?: {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  locale?: string;
  timeZone?: string;
  localeConfig?: LocaleConfig;
}): string => {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Handle empty strings and invalid dates
    if (!date || date.trim() === '') {
      return 'Invalid Date';
    }
    dateObj = new Date(date);
  } else {
    return 'Invalid Date';
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const localeConfig = options?.localeConfig || getUserLocale();
  const locale = options?.locale || `${localeConfig.language}-${localeConfig.region}`;
  const timeZone = options?.timeZone || localeConfig.timeZone;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: options?.dateStyle || 'medium',
    timeZone,
    ...options
  }).format(dateObj);
};

// Format time according to user's locale
export const formatTime = (date: string | Date, options?: {
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  locale?: string;
  timeZone?: string;
  hour12?: boolean;
  localeConfig?: LocaleConfig;
}): string => {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Handle empty strings and invalid dates
    if (!date || date.trim() === '') {
      return 'Invalid Time';
    }
    dateObj = new Date(date);
  } else {
    return 'Invalid Time';
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const localeConfig = options?.localeConfig || getUserLocale();
  const locale = options?.locale || `${localeConfig.language}-${localeConfig.region}`;
  const timeZone = options?.timeZone || localeConfig.timeZone;

  return new Intl.DateTimeFormat(locale, {
    timeStyle: options?.timeStyle || 'medium',
    timeZone,
    hour12: options?.hour12,
    ...options
  }).format(dateObj);
};

// Format date and time according to user's locale
export const formatDateTime = (date: string | Date, options?: {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  locale?: string;
  timeZone?: string;
  hour12?: boolean;
}): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid DateTime';
  }

  const userLocale = getUserLocale();
  const locale = options?.locale || `${userLocale.language}-${userLocale.region}`;
  const timeZone = options?.timeZone || userLocale.timeZone;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: options?.dateStyle || 'medium',
    timeStyle: options?.timeStyle || 'short',
    timeZone,
    hour12: options?.hour12,
    ...options
  }).format(dateObj);
};

// Format relative time (e.g., "2 hours ago", "in 3 days")
export const formatRelativeTime = (date: string | Date, options?: {
  locale?: string;
  numeric?: 'auto' | 'always';
  style?: 'long' | 'short' | 'narrow';
}): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const userLocale = getUserLocale();
  const locale = options?.locale || `${userLocale.language}-${userLocale.region}`;

  const now = new Date();
  const diffInSeconds = Math.round((dateObj.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: options?.numeric || 'auto',
    style: options?.style || 'long'
  });

  // Calculate the appropriate unit
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) {
    return rtf.format(diffInSeconds, 'second');
  } else if (absDiff < 3600) {
    return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  } else if (absDiff < 86400) {
    return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  } else if (absDiff < 2592000) {
    return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  } else if (absDiff < 31536000) {
    return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
  }
};

// Format duration in human-readable format
export const formatDuration = (seconds: number, options?: {
  locale?: string;
  style?: 'long' | 'short' | 'narrow';
}): string => {
  if (seconds < 60) {
    const userLocale = getUserLocale();
    const locale = options?.locale || `${userLocale.language}-${userLocale.region}`;
    const rtf = new Intl.RelativeTimeFormat(locale, { style: options?.style || 'short' });
    return rtf.format(seconds, 'second');
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
};

// Format currency according to user's locale
export const formatCurrency = (amount: number, currency: string = 'USD', options?: {
  locale?: string;
  style?: 'currency' | 'decimal' | 'percent';
  localeConfig?: LocaleConfig;
}): string => {
  const localeConfig = options?.localeConfig || getUserLocale();
  const locale = options?.locale || `${localeConfig.language}-${localeConfig.region}`;

  return new Intl.NumberFormat(locale, {
    style: options?.style || 'currency',
    currency,
    ...options
  }).format(amount);
};

// Format numbers according to user's locale
export const formatNumber = (number: number, options?: {
  locale?: string;
  style?: 'decimal' | 'currency' | 'percent';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  localeConfig?: LocaleConfig;
}): string => {
  const localeConfig = options?.localeConfig || getUserLocale();
  const locale = options?.locale || `${localeConfig.language}-${localeConfig.region}`;

  return new Intl.NumberFormat(locale, options).format(number);
};

// Get date format pattern for input fields
export const getDateFormatPattern = (locale?: string): string => {
  const userLocale = getUserLocale();
  const resolvedLocale = locale || `${userLocale.language}-${userLocale.region}`;

  // Common date formats by locale
  const formats: Record<string, string> = {
    'en-US': 'MM/DD/YYYY',
    'en-GB': 'DD/MM/YYYY',
    'en-AU': 'DD/MM/YYYY',
    'en-CA': 'YYYY-MM-DD',
    'fr-FR': 'DD/MM/YYYY',
    'de-DE': 'DD.MM.YYYY',
    'es-ES': 'DD/MM/YYYY',
    'it-IT': 'DD/MM/YYYY',
    'ja-JP': 'YYYY/MM/DD',
    'ko-KR': 'YYYY. MM. DD.',
    'zh-CN': 'YYYY/MM/DD',
    'ru-RU': 'DD.MM.YYYY',
    'pt-BR': 'DD/MM/YYYY',
    'ar-SA': 'DD/MM/YYYY',
    'hi-IN': 'DD/MM/YYYY'
  };

  return formats[resolvedLocale] || formats['en-US'];
};

// Parse date string based on locale format
export const parseLocaleDate = (dateString: string, locale?: string): Date | null => {
  const pattern = getDateFormatPattern(locale);

  // Try different parsing strategies
  const formats = [
    pattern,
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'DD.MM.YYYY'
  ];

  for (const format of formats) {
    try {
      if (format === 'YYYY-MM-DD') {
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } else if (format === 'MM/DD/YYYY') {
        const [month, day, year] = dateString.split('/').map(Number);
        const parsed = new Date(year, month - 1, day);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } else if (format === 'DD/MM/YYYY') {
        const [day, month, year] = dateString.split('/').map(Number);
        const parsed = new Date(year, month - 1, day);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } else if (format === 'DD.MM.YYYY') {
        const [day, month, year] = dateString.split('.').map(Number);
        const parsed = new Date(year, month - 1, day);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
};
