'use client';

type TabItem = {
    key: string;
    name: string;
};

type Props = {
    items: TabItem[];
    selectedKey: string;
    onSelect: (key: string) => void;
};

export const FilterTabs = ({ items, selectedKey, onSelect }: Props) => {
    return (
        <div className="flex shrink-0 gap-3">
            {items.map((item) => {
                const isActive = selectedKey === item.key;
                return (
                    <button
                        type="button"
                        key={item.key}
                        className={`font-body-3-highlight cursor-pointer rounded-2xl px-4 py-1.5 ${
                            isActive ? 'bg-highlight text-quaternary' : 'bg-secondary text-tertiary'
                        }`}
                        onClick={() => onSelect(item.key)}
                    >
                        {item.name}
                    </button>
                );
            })}
        </div>
    );
};
