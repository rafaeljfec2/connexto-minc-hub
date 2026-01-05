import { Logger } from '@nestjs/common';

function obscureEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return user[0] + '***' + user.slice(-1) + '@' + domain;
}

function obscureToken(token: string): string {
  if (!token) return '';
  return token.slice(0, 4) + '***' + token.slice(-4);
}

export function logSecurityEvent(event: string, details: Record<string, any>) {
  // Obscure sensitive fields
  const safeDetails = { ...details };
  if (safeDetails.email) safeDetails.email = obscureEmail(safeDetails.email);
  if (safeDetails.token) safeDetails.token = obscureToken(safeDetails.token);
  if (safeDetails.refreshToken) safeDetails.refreshToken = obscureToken(safeDetails.refreshToken);
  if (safeDetails.password) safeDetails.password = '***';
  if (safeDetails.newPassword) safeDetails.newPassword = '***';

  const logObj: Record<string, any> = {
    event,
    ...safeDetails,
    timestamp: new Date().toISOString(),
  };

  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    Logger.log(logObj, 'Security');
  } else {
    // Plain text, but explicit fields
    Logger.log(
      `[${logObj.timestamp}] [${event}] user=${logObj['userId'] || logObj['email'] || '-'} ip=${logObj['ip'] || '-'} status=${logObj['status'] || '-'} reason=${logObj['reason'] || '-'} endpoint=${logObj['endpoint'] || '-'} `,
      'Security',
    );
  }
}
