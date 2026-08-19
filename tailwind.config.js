const plugin = require('tailwindcss/plugin');

const typography = {
    'display-1': { mobile: ['36px', '56px', '500'], desktop: ['76px', '160px', '500'] },
    'display-2': { mobile: ['32px', '48px', '500'], desktop: ['60px', '92px', '500'] },
    'display-3': { mobile: ['26px', '44px', '500'], desktop: ['36px', '76px', '500'] },
    'heading-1': { mobile: ['24px', '34px', '500'], desktop: ['32px', '44px', '500'] },
    'heading-2': { mobile: ['22px', '30px', '500'], desktop: ['28px', '40px', '500'] },
    'heading-3': { mobile: ['20px', '28px', '500'], desktop: ['24px', '36px', '500'] },
    'heading-4': { mobile: ['18px', '26px', '500'], desktop: ['20px', '32px', '500'] },
    'body-1': { mobile: ['16px', '22px', '400'], desktop: ['18px', '30px', '400'] },
    'body-1-highlight': { mobile: ['16px', '22px', '500'], desktop: ['18px', '30px', '500'] },
    'body-2': { mobile: ['14px', '20px', '400'], desktop: ['16px', '24px', '400'] },
    'body-2-highlight': { mobile: ['14px', '20px', '500'], desktop: ['16px', '24px', '500'] },
    'body-3': { mobile: ['12px', '18px', '400'], desktop: ['14px', '24px', '400'] },
    'body-3-highlight': { mobile: ['12px', '18px', '500'], desktop: ['14px', '24px', '500'] },
    caption: { mobile: ['10px', '14px', '400'], desktop: ['12px', '20px', '400'] },
    'caption-highlight': { mobile: ['10px', '14px', '500'], desktop: ['12px', '20px', '500'] },
    tiny: { mobile: ['9px', '12px', '400'], desktop: ['11px', '16px', '400'] },
    'tiny-highlight': { mobile: ['9px', '12px', '500'], desktop: ['11px', '16px', '500'] },
};

module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                highlight: '#49d82f',
                blue: '#2994ff',
                green: '#3ac45c',
                yellow: '#e9cb36',
                orange: '#e98e00',
                red: '#eb4337',
                gray: '#999999',
                purple: '#b354e3',
                overlay: '#252525E5',
                success: '#18311f',
                error: '#381C1C',
                warning: '#38371C',
            },
            backgroundColor: {
                primary: '#0d0e10',
                secondary: '#171719',
                tertiary: '#28292b',
                quaternary: '#313235',
                quinary: '#ffffff',
                disabled: '#2c2c2e',
            },
            textColor: {
                primary: '#f8f8f8',
                secondary: '#999999',
                tertiary: '#666666',
                quaternary: '#0d0e10',
                disabled: '#666666',
            },
            borderColor: {
                primary: '#0d0e10',
                secondary: '#999999',
                tertiary: '#28292B',
                quaternary: '#313235',
                quinary: '#ffffff',
            },
            animation: {
                marquee: 'marquee 25s linear infinite',
                fadeIn: 'fadeIn 0.3s ease-in',
                fadeOut: 'fadeOut 0.5s ease-in',
                slideInLeft: 'slideInLeft 0.5s ease',
                slideOutLeft: 'slideOutLeft 0.5s ease',
                shimmer: 'shimmer 2s infinite ease-in-out',
                prixClipFix: 'prixClipFix 2s linear infinite',
                bubbleIn: 'bubbleIn 1s cubic-bezier(0.22, 1, 0.36, 1) both',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                fadeOut: {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
                slideInLeft: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
                slideOutLeft: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-100%)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                prixClipFix: {
                    '0%': {
                        clipPath: 'polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)',
                    },
                    '25%': {
                        clipPath: 'polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)',
                    },
                    '50%': {
                        clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)',
                    },
                    '75%': {
                        clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)',
                    },
                    '100%': {
                        clipPath: 'polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)',
                    },
                },
                bubbleIn: {
                    '0%': {
                        opacity: '0',
                        filter: 'blur(6px)',
                        transform: 'translateY(16px) scale(0.9)',
                    },
                    '100%': {
                        opacity: '1',
                        filter: 'blur(0px)',
                        transform: 'translateY(0) scale(1)',
                    },
                },
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            const typographyUtilities = {};

            Object.entries(typography).forEach(([name, { mobile, desktop }]) => {
                typographyUtilities[`.font-${name}`] = {
                    fontSize: mobile[0],
                    lineHeight: mobile[1],
                    fontWeight: mobile[2],
                    '@media (min-width: 768px)': {
                        fontSize: desktop[0],
                        lineHeight: desktop[1],
                        fontWeight: desktop[2],
                    },
                };
            });

            addUtilities(typographyUtilities);
        }),
    ],
};
