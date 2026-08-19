'use client';

import Image from 'next/image';

type Props = {
    brand: {
        id: string;
        name: string;
        image: string;
    };
    onClick: (brandId: string) => void;
};

export const HaypointCard = ({ brand, onClick }: Props) => {
    return (
        <article
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onClick(brand.id)}
        >
            <figure className="m-0 flex flex-col gap-3">
                <div className="relative w-full h-20 bg-quinary aspect-square rounded-xl overflow-hidden">
                    <Image
                        src={brand.image}
                        alt={brand.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                    />
                </div>
                <figcaption className="font-body-3 text-secondary truncate">
                    {brand.name}
                </figcaption>
            </figure>
        </article>
    );
};
