import { type ReactNode, useId } from 'react';

type Props = {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
};

export const FundImportFormField = ({ label, required, error, children }: Props) => {
    const errorId = useId();
    return (
        <label className="flex flex-col gap-1">
            <span className="inline-flex items-baseline gap-1 font-caption text-secondary">
                <span>{label}</span>
                {required && (
                    <span aria-hidden="true" className="text-red">
                        *
                    </span>
                )}
            </span>
            {children}
            {error && (
                <span id={errorId} role="alert" className="font-caption text-red">
                    {error}
                </span>
            )}
        </label>
    );
};
