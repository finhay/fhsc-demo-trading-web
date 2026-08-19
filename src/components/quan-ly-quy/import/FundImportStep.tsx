import { FaCircleCheck } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import type { FundStepState } from '@/types/pages/fund';

type Props = {
    steps: string[];
    stepStates: FundStepState[];
};

export const FundImportStep = ({ steps, stepStates }: Props) => {
    const trans = useTranslate();

    return (
        <nav
            aria-label={trans.fund.import.progress_aria}
            className="shrink-0 rounded-xl bg-secondary px-4 py-2"
        >
            <ol className="flex items-center gap-2">
                {steps.map((label, i) => {
                    const state = stepStates[i];
                    return (
                        <li key={label} className="flex items-center gap-2">
                            <span
                                aria-current={state === 'active' ? 'step' : undefined}
                                className={`flex items-center gap-1 rounded-full px-3 py-1 font-caption-highlight transition-colors ${
                                    state === 'active'
                                        ? 'bg-success text-highlight'
                                        : state === 'done'
                                          ? 'bg-green/10 text-green'
                                          : 'bg-tertiary text-tertiary'
                                }`}
                            >
                                {state === 'done' ? (
                                    <FaCircleCheck
                                        className="shrink-0 text-sm"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <span
                                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current font-tiny-highlight"
                                        aria-hidden="true"
                                    >
                                        {i + 1}
                                    </span>
                                )}
                                {label}
                            </span>
                            {i < steps.length - 1 && (
                                <span className="font-caption text-tertiary" aria-hidden="true">
                                    ›
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
