'use client';

import React, { useState } from 'react';

import { FaEye, FaEyeSlash } from 'react-icons/fa6';

type Props = {
    id: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'tel' | 'number';
    error?: string;
    showError?: boolean;
    ariaDescribedBy?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function InputField({
    id,
    label,
    placeholder,
    type = 'text',
    error,
    showError = true,
    ariaDescribedBy,
    ...rest
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="flex w-full flex-col gap-2">
            <div
                className={`base-tertiary group relative flex w-full flex-col gap-2 rounded-xl border px-3 py-2 transition-colors ${
                    error ? 'border-red' : 'border-transparent focus-within:border-highlight'
                }`}
            >
                <label
                    htmlFor={id}
                    className={`body-5-highlight transition-colors ${
                        error ? 'text-red' : 'text-primary group-focus-within:text-highlight'
                    }`}
                >
                    {label}
                </label>
                <input
                    id={id}
                    type={inputType}
                    placeholder={placeholder}
                    className={`body-5 text-primary w-full bg-transparent outline-none placeholder:text-tertiary ${
                        isPassword ? 'pr-10' : ''
                    }`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : ariaDescribedBy}
                    {...rest}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-tertiary hover:text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {showPassword ? (
                            <FaEye size={20} aria-hidden="true" className="text-primary" />
                        ) : (
                            <FaEyeSlash size={20} aria-hidden="true" className="text-primary" />
                        )}
                    </button>
                )}
            </div>
            {showError && error && (
                <span id={`${id}-error`} role="alert" className="body-5 text-red">
                    {error}
                </span>
            )}
        </div>
    );
}
