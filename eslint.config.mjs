import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
    {
        ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
    ...nextCoreWebVitals,
    {
        rules: {
            'react-hooks/exhaustive-deps': 'off',
            // Bộ rule React Compiler mới của eslint-plugin-react-hooks v7 (đi kèm
            // eslint-config-next 16) bắt lỗi nhiều pattern đang tồn tại trong code.
            // Hạ xuống warn để lint không chặn, dọn dần trong ticket riêng.
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/refs': 'warn',
            'react-hooks/use-memo': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
        },
    },
];

export default eslintConfig;
