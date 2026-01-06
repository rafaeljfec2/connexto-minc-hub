import { ServiceEntity } from '../../services/entities/service.entity';

// Constants for check-in time windows
export const CHECKIN_OPEN_MINUTES_BEFORE = 30;
export const CHECKIN_TOLERANCE_MINUTES_AFTER = 60; // 1 hour tolerance
export const QR_CODE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export interface CheckInTimeValidation {
  isValid: boolean;
  checkInOpenTime: Date;
  checkInCloseTime: Date;
  serviceTime: Date;
  errorMessage?: string;
}

/**
 * Helper to get the exact service datetime from schedule date and service time string
 */
function getServiceDateTime(scheduleDate: Date, timeString: string): Date {
  const serviceTime = new Date(scheduleDate);
  const [hours, minutes] = timeString.split(':').map(Number);
  serviceTime.setHours(hours, minutes, 0, 0);
  return serviceTime;
}

/**
 * Validates if check-in is allowed based on service time
 * Check-in opens 30 minutes before service time
 * Check-in closes 1 hour after service start time (allows late arrivals)
 */
export function validateCheckInTime(
  service: ServiceEntity,
  scheduleDate: Date,
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
      errorMessage: `Check-in opens ${CHECKIN_OPEN_MINUTES_BEFORE} minutes before service. Opens at ${checkInOpenTime.toLocaleTimeString('pt-BR')}`,
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
