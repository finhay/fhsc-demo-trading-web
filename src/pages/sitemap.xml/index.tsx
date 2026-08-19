import { GetServerSideProps } from 'next';
import { getServerSideSitemapLegacy } from 'next-sitemap';

const STATIC_ROUTES: string[] = [
    '/',
    '/bang-gia',
    '/giao-dich',
    '/haybond',
    '/haypoint',
    '/ipo',
    '/quan-ly-api',
    '/quan-ly-quy',
    '/tai-san',
];

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const baseUrl = process.env.NEXT_PUBLIC_INVEST_URL ?? '';
    const lastmod = new Date().toISOString();

    const fields = STATIC_ROUTES.map((route) => ({
        loc: `${baseUrl}${route}`,
        priority: route === '/' ? 1.0 : 0.8,
        lastmod,
    }));

    return getServerSideSitemapLegacy(ctx, fields);
};

export default function Sitemap() {}
