type Props = {
    status: 'active' | 'watch';
    label: string;
};

export const FundInvestorStatusChip = ({ status, label }: Props) => (
    <span
        role="status"
        aria-label={label}
        className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 font-tiny-highlight ${
            status === 'active' ? 'bg-success text-green' : 'bg-tertiary text-secondary'
        }`}
    >
        {label}
    </span>
);
