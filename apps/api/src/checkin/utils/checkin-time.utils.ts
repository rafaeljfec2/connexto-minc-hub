import { ServiceEntity } from '../../services/entities/service.entity';

export interface CheckInTimeValidation {
  isValid: boolean;
  checkInOpenTime: Date;
  serviceTime: Date;
  errorMessage?: string;
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
  const serviceTime = new Date(scheduleDate);
  const [hours, minutes] = service.time.split(':').map(Number);
  serviceTime.setHours(hours, minutes, 0, 0);

  const checkInOpenTime = new Date(serviceTime);
  checkInOpenTime.setMinutes(checkInOpenTime.getMinutes() - 30);

  if (currentTime < checkInOpenTime) {
    return {
      isValid: false,
      checkInOpenTime,
      serviceTime,
      errorMessage: `Check-in opens 30 minutes before service. Opens at ${checkInOpenTime.toLocaleTimeString('pt-BR')}`,
    };
  }

  // Allow check-in up to 1 hour after service start time
  const checkInCloseTime = new Date(serviceTime);
  checkInCloseTime.setHours(checkInCloseTime.getHours() + 1);

  if (currentTime > checkInCloseTime) {
    return {
      isValid: false,
      checkInOpenTime,
      serviceTime,
      errorMessage: 'Check-in is closed. Service time has passed.',
    };
  }

  return {
    isValid: true,
    checkInOpenTime,
    serviceTime,
  };
}

/**
 * Checks if QR Code has expired (default: 1 hour)
 */
export function isQrCodeExpired(timestamp: number, maxAgeMs: number = 60 * 60 * 1000): boolean {
  const qrCodeAge = Date.now() - timestamp;
  return qrCodeAge > maxAgeMs;
}
