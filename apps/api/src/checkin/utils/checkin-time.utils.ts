import { ServiceEntity } from '../../services/entities/service.entity';

// Constants for check-in time windows
export const CHECKIN_OPEN_MINUTES_BEFORE = 30;
export const CHECKIN_TOLERANCE_MINUTES_AFTER = 60; // 1 hour tolerance
export const QR_CODE_EXPIRATION_MS = 3 * 60 * 60 * 1000; // 3 hours (covers 30m before + 1h after window)

export interface CheckInTimeValidation {
  isValid: boolean;
  checkInOpenTime: Date;
  checkInCloseTime: Date;
  serviceTime: Date;
  errorMessage?: string;
}

/**
 * Helper to get the exact service datetime from schedule date and service time string
 * Uses UTC to avoid timezone issues between local and production environments
 */
function getServiceDateTime(scheduleDate: Date | string, timeString: string): Date {
  const dateObj = typeof scheduleDate === 'string' ? new Date(scheduleDate) : scheduleDate;

  // Create date in America/Sao_Paulo (UTC-3) to ensure correct validation regardless of server timezone
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');

  const [hours, minutes] = timeString.split(':').map((str) => String(str).padStart(2, '0'));

  // Construct ISO string with fixed -03:00 offset (Brasilia Standard Time)
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
  return new Date(isoString);
}

/**
 * Validates if check-in is allowed based on service time
 * Check-in opens 30 minutes before service time
 * Check-in closes 1 hour after service start time (allows late arrivals)
 */
export function validateCheckInTime(
  service: ServiceEntity,
  scheduleDate: Date | string,
  currentTime: Date = new Date(),
): CheckInTimeValidation {
  const serviceTime = getServiceDateTime(scheduleDate, service.time);

  // Calculate open time (e.g., 30 mins before)
  const checkInOpenTime = new Date(serviceTime);
  checkInOpenTime.setMinutes(checkInOpenTime.getMinutes() - CHECKIN_OPEN_MINUTES_BEFORE);

  // Calculate close time (e.g., 1 hour after start)
  const checkInCloseTime = new Date(serviceTime);
  checkInCloseTime.setMinutes(checkInCloseTime.getMinutes() + CHECKIN_TOLERANCE_MINUTES_AFTER);

  if (currentTime < checkInOpenTime) {
    return {
      isValid: false,
      checkInOpenTime,
      checkInCloseTime,
      serviceTime,
      errorMessage: `Check-in opens ${CHECKIN_OPEN_MINUTES_BEFORE} minutes before service. Opens at ${checkInOpenTime.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
    };
  }

  if (currentTime > checkInCloseTime) {
    return {
      isValid: false,
      checkInOpenTime,
      checkInCloseTime,
      serviceTime,
      errorMessage: 'Check-in is closed. Service time has passed.',
    };
  }

  return {
    isValid: true,
    checkInOpenTime,
    checkInCloseTime,
    serviceTime,
  };
}

/**
 * Checks if QR Code has expired (default: 1 hour)
 */
export function isQrCodeExpired(
  timestamp: number,
  maxAgeMs: number = QR_CODE_EXPIRATION_MS,
): boolean {
  const qrCodeAge = Date.now() - timestamp;
  return qrCodeAge > maxAgeMs;
}
