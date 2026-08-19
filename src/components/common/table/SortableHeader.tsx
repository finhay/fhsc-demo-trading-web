import { type Column } from '@tanstack/react-table';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

type Props<T> = {
    label: string;
    column: Column<T, unknown>;
    align?: 'left' | 'right';
};

export const SortableHeader = <T,>({ label, column, align = 'left' }: Props<T>) => {
    const dir = column.getIsSorted();
    return (
        <button
            type="button"
            className={`inline-flex w-full select-none items-center gap-1 font-body-3 text-secondary ${align === 'right' ? 'justify-end' : 'justify-start'}`}
            onClick={column.getToggleSortingHandler()}
        >
            <span>{label}</span>
            <span className="inline-flex items-center leading-none" aria-hidden="true">
                {dir === 'asc' ? (
                    <FaArrowUp size={10} />
                ) : dir === 'desc' ? (
                    <FaArrowDown size={10} />
                ) : null}
            </span>
        </button>
    );
};
