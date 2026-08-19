const path = require('path');

const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    images: {
        remotePatterns: [
            process.env.NEXT_PUBLIC_IMAGE_DOMAINS_COMMON,
            process.env.NEXT_PUBLIC_IMAGE_DOMAINS,
        ]
            .flatMap((domains) => (domains || '').split(','))
            .map((domain) => domain.trim())
            .filter(Boolean)
            .map((hostname) => ({ protocol: 'https', hostname })),
        formats: ['image/webp'],
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_DATAFEED_URL: process.env.NEXT_PUBLIC_DATAFEED_URL,
        NEXT_PUBLIC_MQTT_WSS: process.env.NEXT_PUBLIC_MQTT_WSS,
        NEXT_PUBLIC_MQTT_WSS_2: process.env.NEXT_PUBLIC_MQTT_WSS_2,
        NEXT_PUBLIC_INVEST_URL: process.env.NEXT_PUBLIC_INVEST_URL,
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
        NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    },
};

module.exports = nextConfig;
