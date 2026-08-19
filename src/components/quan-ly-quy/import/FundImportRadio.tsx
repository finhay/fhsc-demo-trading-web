type Props = {
    selected: boolean;
    onClick: () => void;
    title: string;
    sub: string;
};

export const FundImportRadio = ({ selected, onClick, title, sub }: Props) => (
    <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onClick}
        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${selected ? 'border-highlight bg-success' : 'border-tertiary hover:border-highlight/35 hover:bg-quaternary/30'}`}
    >
        <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? 'border-highlight' : 'border-tertiary'}`}
        >
            {selected && <span className="h-2 w-2 rounded-full bg-highlight" />}
        </span>
        <div className="flex flex-col gap-1">
            <p className="font-body-3-highlight text-primary">{title}</p>
            <p className="font-caption text-secondary">{sub}</p>
        </div>
    </button>
);
