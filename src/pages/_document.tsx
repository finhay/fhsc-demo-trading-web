import { Head, Html, Main, NextScript } from 'next/document';

import { inter } from '@/config/fonts';

export default function Document() {
    return (
        <Html>
            <Head />
            <body className={inter.className}>
                {process.env.NEXT_PUBLIC_GTM_ID ? (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                            title="Google Tag Manager"
                        />
                    </noscript>
                ) : null}
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
