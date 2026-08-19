'use client';

import React from 'react';

import { FaRegSquare, FaSquareCheck } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';

type Props = {
    label: React.ReactNode;
    checked: boolean;
    id?: string;
    readOnly?: boolean;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Checkbox = ({
    label,
    checked,
    id,
    readOnly = false,
    className = '',
    onChange,
}: Props) => {
    const trans = useTranslate();
    if (readOnly) {
        return (
            <div
                className={`flex items-center gap-1.5 ${className}`}
                role="img"
                aria-label={
                    checked
                        ? `${trans.checkbox.met}: ${label}`
                        : `${trans.checkbox.not_met}: ${label}`
                }
            >
                <span className="flex-shrink-0">
                    {checked ? (
                        <FaSquareCheck size={18} className="text-highlight" aria-hidden="true" />
                    ) : (
                        <FaRegSquare size={18} className="text-secondary" aria-hidden="true" />
                    )}
                </span>
                <span className="font-caption text-primary">{label}</span>
            </div>
        );
    }

    return (
        <label htmlFor={id} className={`flex items-center gap-1.5 cursor-pointer ${className}`}>
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <span className="flex-shrink-0">
                {checked ? (
                    <FaSquareCheck size={18} className="text-highlight" aria-hidden="true" />
                ) : (
                    <FaRegSquare size={18} className="text-secondary" aria-hidden="true" />
                )}
            </span>
            <span className="font-caption text-primary">{label}</span>
        </label>
    );
};
