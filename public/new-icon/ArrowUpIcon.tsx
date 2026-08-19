import { FC, SVGProps } from 'react';

const ArrowUpIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
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
                d="M6.67188 3.21875V11.3281H5.32812V3.21875L1.75 6.79688L0.8125 5.85938L6 0.671875L11.1875 5.85938L10.25 6.79688L6.67188 3.21875Z"
                // fill="#BF5AF2"
            />
        </svg>
    );
};

export default ArrowUpIcon;
