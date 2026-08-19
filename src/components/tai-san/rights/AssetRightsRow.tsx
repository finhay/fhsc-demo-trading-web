type Props = {
    label: string;
    value: string | number;
};

export const AssetRightsRow = ({ label, value }: Props) => {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="font-body-3 text-secondary">{label}</span>
            <span className="font-body-3 text-primary">{value}</span>
        </div>
    );
};
