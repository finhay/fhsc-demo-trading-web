import { vnscService } from '@/services/interceptor';
import { OrderFileListResponse } from '@/types/utilities';

export const importOrdersFromExcelFile = (file?: any): Promise<OrderFileListResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise<OrderFileListResponse>((resolve, reject) => {
        vnscService
            .post(`/utilities/order/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
