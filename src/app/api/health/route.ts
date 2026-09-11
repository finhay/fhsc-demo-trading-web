import { NextRequest, NextResponse } from 'next/server';

/**
 * Healthcheck endpoint cho DevOps / load balancer.
 *
 * - `GET /api/health`        → liveness: process đang chạy + build có đủ env bắt buộc.
 * - `GET /api/health?deep=1` → readiness: thêm bước ping upstream API (NEXT_PUBLIC_API_URL).
 *
 * Trả 200 khi mọi check `ok`, 503 khi có check fail → CI/CD dùng exit code của curl để
 * quyết định dừng deploy / rollback.
 */

export const dynamic = 'force-dynamic';

type CheckStatus = 'ok' | 'fail';

type Check = {
    status: CheckStatus;
    message?: string;
    durationMs?: number;
};

type HealthResponse = {
    status: 'ok' | 'error';
    service: string;
    version: string;
    timestamp: string;
    uptimeSec: number;
    checks: Record<string, Check>;
};

const SERVICE_NAME = 'fhsc-demo-trading';
const UPSTREAM_TIMEOUT_MS = 3000;

/**
 * Các env bắt buộc để app hoạt động. Tham chiếu trực tiếp `process.env.X` (không dùng
 * `process.env[name]`) để Next inline giá trị lúc build → check phản ánh đúng bản build.
 */
const REQUIRED_ENV: Record<string, string | undefined> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DATAFEED_URL: process.env.NEXT_PUBLIC_DATAFEED_URL,
    NEXT_PUBLIC_MQTT_WSS: process.env.NEXT_PUBLIC_MQTT_WSS,
    NEXT_PUBLIC_PAPER_TRADING_URL: process.env.NEXT_PUBLIC_PAPER_TRADING_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
};

const checkEnv = (): Check => {
    const missing = Object.entries(REQUIRED_ENV)
        .filter(([, value]) => !value || !value.trim())
        .map(([name]) => name);

    if (missing.length > 0) {
        return { status: 'fail', message: `Thiếu env: ${missing.join(', ')}` };
    }
    return { status: 'ok' };
};

const checkUpstream = async (): Promise<Check> => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
        return { status: 'fail', message: 'Chưa cấu hình NEXT_PUBLIC_API_URL' };
    }

    const startedAt = Date.now();
    try {
        // Chỉ cần upstream phản hồi HTTP (kể cả 4xx) là coi như reachable — base URL
        // thường không trả 200 cho request HEAD/GET không có path.
        await fetch(url, {
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });
        return { status: 'ok', durationMs: Date.now() - startedAt };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            status: 'fail',
            message: `Không kết nối được upstream API: ${message}`,
            durationMs: Date.now() - startedAt,
        };
    }
};

export async function GET(request: NextRequest) {
    const isDeep = request.nextUrl.searchParams.get('deep') === '1';

    const checks: Record<string, Check> = {
        env: checkEnv(),
    };

    if (isDeep) {
        checks.upstream = await checkUpstream();
    }

    const isHealthy = Object.values(checks).every((check) => check.status === 'ok');

    const body: HealthResponse = {
        status: isHealthy ? 'ok' : 'error',
        service: SERVICE_NAME,
        version: process.env.npm_package_version ?? 'unknown',
        timestamp: new Date().toISOString(),
        uptimeSec: Math.floor(process.uptime()),
        checks,
    };

    return NextResponse.json(body, {
        status: isHealthy ? 200 : 503,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}
