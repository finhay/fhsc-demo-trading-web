import { FiSearch } from 'react-icons/fi';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    'aria-label'?: string;
};

export const FundInputSearch = ({
    value,
    onChange,
    placeholder,
    'aria-label': ariaLabel,
}: Props) => (
    <div
        role="search"
        className="flex w-64 shrink-0 items-center gap-2 rounded-xl border border-quaternary bg-secondary px-3 py-2"
    >
        <FiSearch size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel ?? placeholder}
            className="min-w-0 flex-1 bg-transparent font-body-3 text-primary outline-none placeholder:text-primary"
        />
    </div>
);
