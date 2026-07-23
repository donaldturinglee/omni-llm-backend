export interface PaginatedResponse<T> {
    results: T[];
    result_count: number;
    page: number;
    page_size: number;
    page_count: number;
    has_next: boolean;
    has_previous: boolean;
}
