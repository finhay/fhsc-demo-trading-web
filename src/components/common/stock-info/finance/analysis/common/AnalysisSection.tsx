'use client';

import { ReactNode } from 'react';

type Props = {
    title: ReactNode;
    right?: ReactNode;
    children: ReactNode;
    className?: string;
};

export const AnalysisSection = ({ title, right, children, className }: Props) => (
    <article className={className ?? 'flex h-full min-w-0 flex-1 flex-col gap-3'}>
        {right ? (
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
                <h2 className="font-body-3-highlight text-primary">{title}</h2>
                {right}
            </div>
        ) : (
            <h2 className="shrink-0 font-body-3-highlight text-primary">{title}</h2>
        )}
        {children}
    </article>
);
