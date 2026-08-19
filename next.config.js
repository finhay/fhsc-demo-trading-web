const path = require('path');
const { i18n } = require('./i18n.config');

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
        NEXT_PUBLIC_TRACKING_URL: process.env.NEXT_PUBLIC_TRACKING_URL,
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        NEXT_PUBLIC_SSO_ALLOWED_REDIRECT_URIS: process.env.NEXT_PUBLIC_SSO_ALLOWED_REDIRECT_URIS,
    },
    i18n,
    webpack: (config) => {
        config.resolve.alias['libsodium-wrappers-sumo'] =
            require.resolve('libsodium-wrappers-sumo');
        return config;
    },
};

module.exports = nextConfig;
