import { FC, SVGProps } from 'react';

const ArrowDownIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M6.67188 8.78125L10.25 5.20312L11.1875 6.14062L6 11.3281L0.8125 6.14062L1.75 5.20312L5.32812 8.78125V0.671875H6.67188V8.78125Z"
                // fill="#FF453A"
            />
        </svg>
    );
};

export default ArrowDownIcon;
