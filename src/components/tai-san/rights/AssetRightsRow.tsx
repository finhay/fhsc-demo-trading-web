type Props = {
    label: string;
    value: string | number;
};

export const AssetRightsRow = ({ label, value }: Props) => {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="body-4 text-secondary">{label}</span>
            <span className="body-4 text-primary text-right">{value}</span>
        </div>
    );
};
