const path = require('path');

const nextConfig = {
    reactStrictMode: false,
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
        includePaths: [path.join(__dirname, 'src/styles')],
    },
};

module.exports = nextConfig;
