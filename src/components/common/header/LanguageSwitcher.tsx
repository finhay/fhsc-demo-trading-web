'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { FaChevronDown } from 'react-icons/fa6';

import { LANGUAGES } from '@/constants/common';

export const LanguageSwitcher = () => {
    const router = useRouter();
    const locale = router.locale || LANGUAGES[0].code;
    const [currentLanguage, setCurrentLanguage] = useState<string>(locale);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        setCurrentLanguage(locale);
        setIsDropdownOpen(false);
    }, [locale]);

    const handleChangeLanguage = (lang: string) => {
        const currentPath = router.asPath;
        router.push(currentPath, currentPath, { locale: lang });
        setIsDropdownOpen(false);
    };

    const currentLang = LANGUAGES.find((lang) => lang.code === currentLanguage) ?? LANGUAGES[0];
    const altKey = currentLanguage === LANGUAGES[0].code ? LANGUAGES[0].code : LANGUAGES[1].code;

    return (
        <nav
            className="fixed right-2 top-0 flex items-center justify-between p-3 bg-quaternary rounded-xl z-10"
            aria-label="Language switcher"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
        >
            <button
                className="flex items-center justify-center gap-8 cursor-pointer"
                type="button"
                aria-expanded={isDropdownOpen}
                aria-controls="language-menu"
            >
                <span className="flex items-center gap-2">
                    <Image
                        src={currentLang.flagSrc}
                        alt={currentLang.flagAlt[altKey]}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                        priority
                    />
                    <span className="font-caption text-primary whitespace-nowrap">
                        {currentLang.label}
                    </span>
                </span>
                <FaChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`text-primary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`absolute right-0 top-full z-10 w-full pt-1 transition-all duration-100 ease-in-out ${
                    isDropdownOpen
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible pointer-events-none'
                }`}
            >
                <menu
                    id="language-menu"
                    className="w-full p-4 bg-quaternary rounded-xl flex flex-col gap-4 justify-center"
                    role="listbox"
                    aria-label="Select language"
                >
                    {LANGUAGES.map((lang, index) => (
                        <li
                            key={lang.code}
                            className="flex flex-col gap-4 justify-center list-none"
                        >
                            {index > 0 && <hr className="h-0.5 w-full bg-quinary" />}
                            <button
                                className="flex gap-2 cursor-pointer items-center"
                                onClick={() => handleChangeLanguage(lang.code)}
                                type="button"
                                role="option"
                                aria-selected={lang.code === currentLanguage}
                            >
                                <Image
                                    src={lang.flagSrc}
                                    alt={lang.flagAlt[altKey]}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 object-contain"
                                    priority
                                />
                                <span className="font-caption text-primary">{lang.label}</span>
                            </button>
                        </li>
                    ))}
                </menu>
            </div>
        </nav>
    );
};
