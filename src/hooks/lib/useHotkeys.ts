import { useEffect, useRef } from 'react';

type Options = {
    enabled?: boolean;
    ignoreInputs?: boolean;
};

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export const useHotkeys = (key: string, handler: () => void, options: Options = {}) => {
    const { enabled = true, ignoreInputs = true } = options;

    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (ignoreInputs) {
                const target = event.target as HTMLElement;
                if (INPUT_TAGS.has(target.tagName) || target.isContentEditable) {
                    return;
                }
            }

            if (event.key === key) {
                handlerRef.current();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [key, enabled, ignoreInputs]);
};
