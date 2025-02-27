import { IProduct, IOrderResponse, IOrder } from "../../types/types";

export type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export class Api {
    readonly baseUrl: string;
    protected options: RequestInit;

    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl;
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as object ?? {})
            }
        };
    }

    // Обработка ответа от сервера
    protected handleResponse(response: Response): Promise<object> {
        if (response.ok) return response.json();
        else return response.json()
            .then(data => Promise.reject(data.error ?? response.statusText));
    }

    // GET-запрос
    get<T>(uri: string): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method: 'GET'
        }).then(this.handleResponse) as Promise<T>;
    }

    // POST/PUT/DELETE-запрос
    post<T>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T> {
        return fetch(this.baseUrl + uri, {
            ...this.options,
            method,
            body: JSON.stringify(data)
        }).then(this.handleResponse) as Promise<T>;
    }

    // Получение списка товаров
    async getProducts(): Promise<ApiListResponse<IProduct>> {
        return this.get<ApiListResponse<IProduct>>("/product");
    }

    // Получение информации о конкретном товаре
    async getProductById(id: string): Promise<IProduct> {
        return this.get<IProduct>(`/product/${id}`);
    }

    // Создание заказа
    async createOrder(order: IOrder): Promise<IOrderResponse> {
        return this.post<IOrderResponse>("/order", order);
    }
}
