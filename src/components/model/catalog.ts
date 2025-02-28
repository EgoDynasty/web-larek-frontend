import { IProduct, AppEvent } from '../../types/types';
import { EventEmitter } from '../base/events';

export class Catalog {
  private products: IProduct[] = [];
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit(AppEvent.ProductListLoaded, this.products);
  }

  getAllProducts(): IProduct[] {
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