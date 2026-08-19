import { RefObject, useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
    callback: () => void,
    enabled: boolean = true,
): RefObject<T> => {
    const ref = useRef<T>(null!);

    useEffect(() => {
        if (!enabled) return;

        const handleClick = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            if (ref.current && !ref.current.contains(target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [callback, enabled]);

    return ref;
};
