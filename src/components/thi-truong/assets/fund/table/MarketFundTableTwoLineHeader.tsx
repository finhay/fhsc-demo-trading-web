'use client';

type Props = {
    line1: string;
    line2: string;
};

export const MarketFundTableTwoLineHeader = ({ line1, line2 }: Props) => (
    <span className="inline-flex flex-col items-end leading-5">
        <span>{line1}</span>
        <span>{line2}</span>
    </span>
);
