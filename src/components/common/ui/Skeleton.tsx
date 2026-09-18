type Props = {
    height?: number | string;
};

export const Skeleton = ({ height = 'full' }: Props) => {
    const heightClass = height === 'full' ? 'h-full' : `h-${height}`;

    return (
        <div className={`relative w-full overflow-hidden rounded-xl base-tertiary ${heightClass}`}>
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};
