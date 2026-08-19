import { FC, SVGProps } from 'react';

const ArrowLeftRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M8.67188 9.67188V7L12 10.3281L8.67188 13.6719V11H0.671875V9.67188H8.67188ZM3.32812 0.328125V3H11.3281V4.32812H3.32812V7L0 3.67188L3.32812 0.328125Z"
                // fill="#FF9F0A"
            />
        </svg>
    );
};

export default ArrowLeftRightIcon;
