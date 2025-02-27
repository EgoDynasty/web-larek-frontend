import { IProduct, AppEvent } from '../../types/types';
import { Api } from '../base/api';
import { EventEmitter } from '../base/events';

export class Catalog {
  private products: IProduct[] = [];
  private events: EventEmitter;
  private api: Api;

  constructor(api: Api, events: EventEmitter) {
    this.api = api;
    this.events = events;
  }

  async loadProducts(): Promise<void> {
    try {
      const response = await this.api.getProducts();
      this.products = response.items;
      this.events.emit(AppEvent.ProductListLoaded, this.products);
    } catch (error) {
      this.events.emit(AppEvent.ErrorOccurred, { message: error instanceof Error ? error.message : "Неизвестная ошибка" });
    }
  }

  async getAllProducts(): Promise<IProduct[]> {
    if (this.products.length === 0) {
      await this.loadProducts();
    }
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find(product => product.id === id);
  }

  updateProduct(productId: string, updatedProduct: IProduct): void {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      this.products[productIndex] = updatedProduct;
      this.events.emit(AppEvent.ProductUpdated, updatedProduct);
    }
  }
}