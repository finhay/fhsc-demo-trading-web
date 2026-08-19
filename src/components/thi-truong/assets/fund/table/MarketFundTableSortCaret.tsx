'use client';

import { FaCaretDown, FaCaretUp } from 'react-icons/fa6';

type Props = {
    sorted: false | 'asc' | 'desc';
};

export const MarketFundTableSortCaret = ({ sorted }: Props) => {
    if (sorted === 'asc') return <FaCaretUp size={14} className="text-highlight shrink-0" />;
    if (sorted === 'desc') return <FaCaretDown size={14} className="text-highlight shrink-0" />;
    return null;
};
