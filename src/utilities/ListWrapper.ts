import { ListAPIResponse } from "../types/model";

export function listWrap<T>(data:T[]): ListAPIResponse<T[]> {
    return {
        data,
        total: data.length,
    }
}