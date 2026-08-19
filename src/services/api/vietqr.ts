import axios from 'axios';

import { VietQRGenerateResponse } from '@/types/vietqr';

const VIET_QR_API_URL = 'https://api.vietqr.io/v2/generate';

export const generateVietQrTransferImage = (
    accountNo: string,
    accountName: string,
    acqId: string,
) => {
    return new Promise<VietQRGenerateResponse['data']>((resolve, reject) => {
        axios
            .post<VietQRGenerateResponse>(VIET_QR_API_URL, {
                accountNo,
                accountName,
                acqId,
                template: '7lpU3k9',
            })
            .then((res) => {
                if (res.data.code === '00') {
                    resolve(res.data.data);
                } else {
                    reject({
                        code: res.data.code,
                        message: res.data.desc,
                    });
                }
            })
            .catch((err) => reject(err.response?.data || err));
    });
};
