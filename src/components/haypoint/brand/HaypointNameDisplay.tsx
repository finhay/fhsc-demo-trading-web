'use client';

import { parseVoucherName } from '@/utils/haypoint';

type Props = {
    name: string;
};

export const HaypointNameDisplay = ({ name }: Props) => {
    const { brandName, description } = parseVoucherName(name);

    return (
        <>
            <span className="font-body-3">{brandName}</span>
            <span className="font-body-3-highlight">{description}</span>
        </>
    );
};
