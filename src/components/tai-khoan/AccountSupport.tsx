import Link from 'next/link';

import { RiPhoneLine } from 'react-icons/ri';

import { ACCOUNT_SOCIAL_CHANNELS } from '@/constants/account';
import { useTranslate } from '@/hooks/useTranslate';

export const AccountSupport = () => {
    const trans = useTranslate();

    return (
        <section className="flex w-full flex-col gap-3">
            <h2 className="font-heading-4 text-primary">{trans.account.support.title}</h2>
            <div className="flex w-full flex-wrap items-start gap-3">
                <article className="flex min-w-80 flex-1 flex-col gap-6 rounded-xl bg-secondary p-4">
                    <h3 className="font-body-2-highlight text-primary">
                        {trans.account.support.connect_title}
                    </h3>
                    <ul className="flex flex-col gap-3">
                        {ACCOUNT_SOCIAL_CHANNELS.map((channel) => {
                            const Icon = channel.icon;
                            return (
                                <li key={channel.key}>
                                    <Link
                                        href={channel.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-12 items-center gap-3 rounded-xl border border-tertiary px-3"
                                    >
                                        <Icon size={24} className="shrink-0 text-secondary" />
                                        <span className="font-body-2 text-primary">
                                            {
                                                trans.account.support.social[
                                                    channel.key as keyof typeof trans.account.support.social
                                                ]
                                            }
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </article>
                <article className="flex min-w-80 flex-1 flex-col gap-6 rounded-xl bg-secondary p-4">
                    <h3 className="font-body-2-highlight text-primary">
                        {trans.account.support.hotline_title}
                    </h3>
                    <div className="flex h-12 items-center gap-3 rounded-xl border border-tertiary px-3">
                        <RiPhoneLine size={24} className="shrink-0 text-secondary" />
                        <span className="font-body-2 text-primary">024 777 789 96</span>
                    </div>
                </article>
            </div>
        </section>
    );
};
