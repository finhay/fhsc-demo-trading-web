'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Dialog } from '@/components/common/ui/Dialog';

type Props = {
    onClose: () => void;
};

export const DownloadAppModal = ({ onClose }: Props) => {
    return (
        <Dialog onClose={onClose} maxWidth="max-w-md">
            <section
                className="flex flex-col items-center gap-4 py-4"
                aria-labelledby="download-app-modal-title"
            >
                <figure className="m-0 flex flex-col items-center">
                    <Image
                        src="https://cdn1.finhay.com.vn/vnsc-prod/1741929570552-QR-Radar-Home.png?w=128"
                        alt={'Mã QR tải ứng dụng Finhay'}
                        width={200}
                        height={200}
                        className="w-48 h-48 object-contain"
                    />
                </figure>
                <h2
                    id="download-app-modal-title"
                    className="m-0 text-center text-primary font-heading-4"
                >
                    {'Tải ứng dụng Finhay tại đây'}
                </h2>
                <nav
                    className="flex flex-wrap items-center justify-center gap-4"
                    aria-label={'Tải ứng dụng trên kho ứng dụng'}
                >
                    <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-4 p-0">
                        <li>
                            <Link
                                href="https://apps.apple.com/vn/app/finhay/id1336942463?utm_campaign=taiapp&utm_medium=button&utm_source=website_vnsc"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://cdn1.finhay.com.vn/vnsc-prod/1730190940000-down-appstore.webp?w=384"
                                    alt={'Tải trên App Store'}
                                    width={200}
                                    height={60}
                                    className="h-15 w-48 object-contain"
                                />
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://play.google.com/store/apps/details?id=vn.finhay.finhay&utm_campaign=taiapp&utm_medium=button&utm_source=website_vnsc"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://cdn1.finhay.com.vn/vnsc-prod/1730190927136-down-ggplay.webp?w=384"
                                    alt={'Tải trên Google Play'}
                                    width={200}
                                    height={60}
                                    className="h-15 w-48 object-contain"
                                />
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
        </Dialog>
    );
};
