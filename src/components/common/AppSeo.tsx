import type { ReactNode } from 'react';

import { NextSeo } from 'next-seo';
import Head from 'next/head';

import { getCurrentLocation } from '@/utils/common';

type Props = {
    title?: string;
    metaDescription?: string;
    socialImageUrl?: string;
    faviconImageUrl?: string;
    additionalLinkTags?: {
        rel: string;
        href: string;
        sizes?: string;
        media?: string;
        type?: string;
        color?: string;
        keyOverride?: string;
        as?: string;
        crossOrigin?: string;
    }[];
    canonical?: string;
    isDefaultPreview?: boolean;
    children?: ReactNode;
};

export const AppSeo = ({
    title,
    metaDescription,
    socialImageUrl,
    faviconImageUrl,
    additionalLinkTags,
    canonical,
    isDefaultPreview = false,
    children,
}: Props) => {
    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, user-scalable=no"
                />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge, chrome=1" />
            </Head>
            <NextSeo
                noindex={process.env.NEXT_PUBLIC_INVEST_URL !== 'https://invest.fhsc.com.vn'}
                nofollow={process.env.NEXT_PUBLIC_INVEST_URL !== 'https://invest.fhsc.com.vn'}
                title={title || 'Finhay Securities'}
                description={metaDescription || 'Finhay Securities'}
                twitter={{
                    cardType: 'summary_large_image',
                }}
                openGraph={{
                    type: 'website',
                    url: canonical ? canonical : getCurrentLocation(),
                    title: title || 'Finhay Securities',
                    description: metaDescription || 'Finhay Securities',
                    images: [
                        {
                            url:
                                !isDefaultPreview && socialImageUrl
                                    ? socialImageUrl
                                    : 'https://cdn1.finhay.com.vn/vnsc-prod/1780908981004.0066-Link%20thumbnail.png',
                            alt: title,
                            width: 878,
                            height: 413,
                            type: 'image/png',
                        },
                    ],
                }}
                additionalLinkTags={[
                    {
                        rel: 'icon',
                        type: 'image/x-icon',
                        href:
                            faviconImageUrl ||
                            'https://cdn1.finhay.com.vn/vnsc-prod/1776678011822.8657-favicon.png',
                    },
                    ...(additionalLinkTags && additionalLinkTags?.length > 0
                        ? additionalLinkTags
                        : []),
                ]}
                additionalMetaTags={[
                    {
                        name: 'keywords',
                        content: '',
                    },
                    {
                        name: 'author',
                        content: '',
                    },
                ]}
                canonical={canonical ? canonical : getCurrentLocation()}
            />
            {children}
        </>
    );
};
