import Image from 'next/image';

type Props = {
    title: string;
    description?: string;
};

export const IpoEmptyState = ({ title, description }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl h-full">
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1770007269493.3816-flaticon_3656900%201.png"
                alt={title}
                width={115}
                height={115}
                className="h-auto aspect-square object-cover"
            />
            <div className="flex flex-col items-center gap-2">
                <h3 className="font-body-2-highlight text-primary text-center">{title}</h3>
                {description && (
                    <p className="text-center font-body-3 text-secondary">{description}</p>
                )}
            </div>
        </div>
    );
};
