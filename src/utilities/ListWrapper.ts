import { ListAPIResponse } from "../types/api";

export function listWrap<T>(data:T[]): ListAPIResponse<T[]> {
    return {
        data,
        total: data.length,
    }
}