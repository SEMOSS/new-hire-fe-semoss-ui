interface IconProps {
    color?: string;

    width?: string;

    height?: string;
}

export const ModelBrain = (props: IconProps) => {
    const { color = '#EBEEFE', width = '25', height = '25' } = props;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 24 24`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M21.33 12.91C21.42 14.46 20.71 15.95 19.44 16.86L20.21 18.35C20.44 18.8 20.47 19.33 20.27 19.8C20.08 20.27 19.69 20.64 19.21 20.8L18.42 21.05C18.25 21.11 18.06 21.14 17.88 21.14C17.37 21.14 16.89 20.91 16.56 20.5L14.44 18C13.55 17.85 12.71 17.47 12 16.9C11.5 17.05 11 17.13 10.5 17.13C9.62 17.13 8.74 16.86 8 16.34C7.47 16.5 6.93 16.57 6.38 16.56C5.59 16.57 4.81 16.41 4.08 16.11C2.65 15.47 1.7 14.07 1.65 12.5C1.57 11.78 1.69 11.05 2 10.39C1.71 9.64001 1.68 8.82001 1.93 8.06001C2.3 7.11001 3 6.32001 3.87 5.82001C4.45 4.13001 6.08 3.00001 7.87 3.12001C9.47 1.62001 11.92 1.46001 13.7 2.75001C14.12 2.64001 14.56 2.58001 15 2.58001C16.36 2.55001 17.65 3.15001 18.5 4.22001C20.54 4.75001 22 6.57001 22.08 8.69001C22.13 9.80001 21.83 10.89 21.22 11.82C21.29 12.18 21.33 12.54 21.33 12.91ZM16.33 11.5C16.9 11.57 17.35 12 17.35 12.57C17.35 12.8352 17.2446 13.0896 17.0571 13.2771C16.8696 13.4647 16.6152 13.57 16.35 13.57H15.72C15.4 14.47 14.84 15.26 14.1 15.86C14.35 15.95 14.61 16 14.87 16.07C20 16 19.4 12.87 19.4 12.82C19.34 11.39 18.14 10.27 16.71 10.33C16.4448 10.33 16.1904 10.2247 16.0029 10.0371C15.8154 9.84958 15.71 9.59523 15.71 9.33001C15.71 9.06479 15.8154 8.81044 16.0029 8.6229C16.1904 8.43537 16.4448 8.33001 16.71 8.33001C17.94 8.36001 19.12 8.82001 20.04 9.63001C20.09 9.34001 20.12 9.04001 20.12 8.74001C20.06 7.50001 19.5 6.42001 17.25 6.21001C16 3.25001 12.85 4.89001 12.85 5.81001C12.82 6.04001 13.06 6.53001 13.1 6.56001C13.3652 6.56001 13.6196 6.66537 13.8071 6.8529C13.9946 7.04044 14.1 7.29479 14.1 7.56001C14.1 8.11001 13.65 8.56001 13.1 8.56001C12.57 8.54001 12.07 8.34001 11.67 8.00001C11.19 8.31001 10.64 8.50001 10.07 8.56001C9.5 8.61001 9.03 8.21001 9 7.66001C8.92 7.10001 9.33 6.61001 9.88 6.56001C10.04 6.54001 10.82 6.42001 10.82 5.79001C10.82 5.13001 11.07 4.50001 11.5 4.00001C10.58 3.75001 9.59 4.08001 8.59 5.29001C6.75 5.00001 6 5.25001 5.45 7.20001C4.5 7.67001 4 8.00001 3.78 9.00001C4.86 8.78001 5.97 8.87001 7 9.25001C7.5 9.44001 7.78 10 7.59 10.54C7.4 11.06 6.82 11.32 6.3 11.13C5.57 10.81 4.75 10.79 4 11.07C3.68 11.34 3.68 11.9 3.68 12.34C3.68 13.08 4.05 13.77 4.68 14.17C5.21 14.44 5.8 14.58 6.39 14.57C6.24 14.31 6.11 14.04 6 13.76C5.81 13.22 6.1 12.63 6.64 12.44C7.18 12.25 7.77 12.54 7.96 13.08C8.36 14.22 9.38 15 10.58 15.13C11.95 15.06 13.17 14.25 13.77 13C14 11.62 15.11 11.5 16.33 11.5ZM18.33 18.97L17.71 17.67L17 17.83L18 19.08L18.33 18.97ZM13.68 10.36C13.7 9.83001 13.3 9.38001 12.77 9.33001C12.06 9.29001 11.37 9.53001 10.84 10C10.27 10.58 9.97 11.38 10 12.19C10 12.4552 10.1054 12.7096 10.2929 12.8971C10.4804 13.0847 10.7348 13.19 11 13.19C11.57 13.19 12 12.74 12 12.19C12 11.92 12.07 11.65 12.23 11.43C12.35 11.33 12.5 11.28 12.66 11.28C13.21 11.31 13.68 10.9 13.68 10.36Z"
                fill={color}
            />
        </svg>
    );
};
