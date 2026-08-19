export const getSubAccountLabel = (productTypeName: string, type: string): string => {
    if (productTypeName) return `Tiểu khoản ${productTypeName}`;
    if (type) return `Tiểu khoản ${type}`;
    return 'Tiểu khoản';
};

export const isWebDeviceType = (deviceType: string): boolean => {
    return deviceType.toUpperCase() === 'WEB';
};

export const base64ToPdfUrl = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
};
