'use client';

import { useEffect, useState } from 'react';

import { RiBodyScanFill, RiShieldCheckFill, RiSmartphoneFill, RiTv2Fill } from 'react-icons/ri';

import { Skeleton } from '@/components/common/ui/Skeleton';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { getUserDevices, revokeUserDevice } from '@/services/api/auth/devices';
import { getDeviceId } from '@/services/localStorage';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import type { UserDevice } from '@/types/devices';
import { isWebDeviceType } from '@/utils/account';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatDateTime } from '@/utils/format';

export const AccountDeviceManagement = () => {
    const trans = useTranslate();
    const { profile } = useAuthStore();
    const [devices, setDevices] = useState<UserDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null);
    const currentDeviceId = getDeviceId();
    const isLevel3 = profile?.ekyc_level === 'LEVEL_3';

    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const { error_code, data } = await getUserDevices();
            if (isSuccessApi(error_code)) {
                const sortedDevices = [...(data ?? [])].sort((a, b) => {
                    if (a.device_id === currentDeviceId) return -1;
                    if (b.device_id === currentDeviceId) return 1;
                    return 0;
                });
                setDevices(sortedDevices);
            } else {
                toast.error(trans.device_mgmt_modal.error_generic);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeDevice = async (deviceId: string) => {
        setRevokingDeviceId(deviceId);
        try {
            const { error_code, message } = await revokeUserDevice(deviceId);
            if (isSuccessApi(error_code)) {
                setDevices((prev) => prev.filter((device) => device.device_id !== deviceId));
                toast.success(trans.device_mgmt_modal.logout_success);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            setRevokingDeviceId(null);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <section className="flex size-full flex-col gap-2 rounded-xl">
            <header className="flex items-center gap-4">
                <h2 className="font-heading-4 text-primary">{trans.account.device.title}</h2>
            </header>
            <article className="flex flex-col gap-6 rounded-xl bg-secondary p-4">
                <h3 className="font-body-2-highlight text-primary">
                    {trans.account.device.security_status_title}
                </h3>
                <ul className="flex gap-2">
                    <li className="flex flex-1 min-w-0 items-center gap-2 rounded-xl border border-tertiary p-3">
                        <RiBodyScanFill size={24} className="shrink-0 text-secondary" />
                        <p className="flex-1 font-body-2 text-secondary">
                            {trans.account.device.identity_verification}
                        </p>
                        {isLevel3 && (
                            <span className="rounded-full border border-highlight bg-tertiary px-3 py-1 font-body-3 text-primary">
                                {trans.account.device.verified}
                            </span>
                        )}
                    </li>
                    <li className="flex flex-1 min-w-0 items-center gap-2 rounded-xl border border-tertiary p-3">
                        <RiShieldCheckFill size={24} className="shrink-0 text-secondary" />
                        <p className="flex-1 font-body-2 text-secondary">
                            {trans.account.device.two_factor_auth}
                        </p>
                        <span className="rounded-full border border-highlight bg-tertiary px-3 py-1 font-body-3 text-primary">
                            {trans.account.device.enabled}
                        </span>
                    </li>
                </ul>
            </article>
            <main className="flex flex-1 flex-col gap-6 rounded-xl bg-secondary p-4">
                <header className="flex flex-col gap-6">
                    <h3 className="font-body-2-highlight text-primary">
                        {trans.account.device.access_devices_title}
                    </h3>
                    <p className="font-body-3 text-secondary w-1/2">
                        {trans.account.device.access_devices_desc}
                    </p>
                </header>
                <ul className="-m-1 flex flex-wrap">
                    {isLoading && (
                        <li className="h-36 w-full">
                            <Skeleton />
                        </li>
                    )}
                    {!isLoading &&
                        devices.map((device) => {
                            const isCurrent = device.device_id === currentDeviceId;
                            const DeviceIcon = isWebDeviceType(device.device_type)
                                ? RiTv2Fill
                                : RiSmartphoneFill;

                            return (
                                <li key={device.device_id} className="w-1/2 p-1">
                                    <article className="flex items-start gap-2 rounded-xl border border-tertiary p-4">
                                        <DeviceIcon size={24} className="shrink-0 text-highlight" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-body-2-highlight text-primary">
                                                {device.device_type}
                                            </p>
                                            <p className="font-body-3 text-secondary">
                                                {trans.account.device.ip_label}: {device.ip}
                                            </p>
                                            <p className="font-body-3 text-secondary">
                                                {trans.account.device.login_at_label}:{' '}
                                                {formatDateTime(device.login_time)}
                                            </p>
                                            <p className="font-body-3 text-secondary">
                                                {trans.account.device.expires_at_label}:{' '}
                                                {formatDateTime(device.refresh_token_expired_at)}
                                            </p>
                                        </div>
                                        {isCurrent ? (
                                            <span className="flex items-center justify-center rounded-full bg-tertiary font-body-2-highlight text-tertiary py-2 px-4">
                                                {trans.account.device.current}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleRevokeDevice(device.device_id)}
                                                disabled={revokingDeviceId === device.device_id}
                                                className="rounded-full bg-error font-body-2-highlight text-red py-2 px-4"
                                            >
                                                {trans.account.device.logout}
                                            </button>
                                        )}
                                    </article>
                                </li>
                            );
                        })}
                </ul>
            </main>
        </section>
    );
};
