/**
 * Legacy path — giữ tương thích cho cấu hình ALB/ECS đang trỏ `/api/healthCheck`.
 * Endpoint chuẩn là `/api/health` (xem `@/app/api/health/route`).
 */
export { GET } from '@/app/api/health/route';

export const dynamic = 'force-dynamic';
