type Props = {
    label: string;
    value: string;
    hasValue?: boolean;
    side?: 'buy' | 'sell';
};

export const TradeTotalField = ({ label, value, hasValue = false, side }: Props) => {
    return (
        <dl
            className={`flex w-full items-center justify-between gap-2 py-1 rounded-xl transition-colors`}
        >
            <dt className="body-5 text-secondary">{label}</dt>
            <dd
                className={`body-5-highlight text-right overflow-hidden ${hasValue ? 'text-primary' : 'text-secondary'}`}
            >
                {value}
            </dd>
        </dl>
    );
};
