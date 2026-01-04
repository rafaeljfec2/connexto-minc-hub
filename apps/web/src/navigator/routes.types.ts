import type { ComponentType } from 'react';
import type { UserRole } from '@minc-hub/shared/types';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  allowedRoles?: UserRole[];
}
