import { AppSeo } from '@/components/common/AppSeo';
import { MarketIndexTicker } from '@/components/common/header/MarketIndexTicker';
import { NavBar } from '@/components/common/header/navigation/NavBar';

type Props = {
    children: React.ReactNode;
    title: string;
    metaDescription: string;
};

export const DefaultLayout = ({ children, title, metaDescription }: Props) => {
    return (
        <div className="h-screen flex flex-col">
            <AppSeo title={title} metaDescription={metaDescription} />
            <header className="sticky top-0 z-40 shrink-0">
                <MarketIndexTicker />
                <NavBar />
            </header>
            <main className="min-h-0 flex-1 overflow-auto bg-primary px-2 pb-2">{children}</main>
        </div>
    );
};
