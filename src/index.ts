import './scss/styles.scss'
import { IProduct, IOrder, IProductListResponse, AppEvent } from './types/index';

// EventEmitter для управления событиями
class EventEmitter {
    private events: { [key: string]: Function[] } = {};
  
    on(event: string, listener: Function): void {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }
  
    emit(event: string, data?: any): void {
      if (this.events[event]) {
        this.events[event].forEach(listener => listener(data));
      }
    }
  }
  
  // Класс для работы с каталогом товаров (Model)
  class Catalog {
    private products: IProduct[];
  
    constructor(products: IProduct[]) {
      this.products = products;
    }
  
    getAllProducts(): IProduct[] {
      return this.products;
    }
  }
  
  // Класс корзины (Model)
  class Basket {
    private items: IProduct[] = [];
    private events: EventEmitter;
  
    constructor(events: EventEmitter) {
      this.events = events;
    }
  
    addItem(product: IProduct): void {
      this.items.push(product);
      this.events.emit(AppEvent.ProductListLoaded, this.items);
    }
  
    removeItem(productId: string): void {
      this.items = this.items.filter(item => item.id !== productId);
      this.events.emit(AppEvent.ProductListLoaded, this.items);
    }
  
    getItems(): IProduct[] {
      return this.items;
    }
  }
  
  // Класс заказа (Model)
  class OrderProcessor {
    private events: EventEmitter;
  
    constructor(events: EventEmitter) {
      this.events = events;
    }
  
    createOrder(order: IOrder): void {
      if (!order.email || !order.phone || !order.address) {
        throw new Error('Все поля должны быть заполнены');
      }
      this.events.emit(AppEvent.OrderCreated, order);
    }
  }
  
  // Presenter
  class Presenter {
    private catalog: Catalog;
    private basket: Basket;
    private orderProcessor: OrderProcessor;
    private events: EventEmitter;
  
    constructor(catalog: Catalog, basket: Basket, orderProcessor: OrderProcessor, events: EventEmitter) {
      this.catalog = catalog;
      this.basket = basket;
      this.orderProcessor = orderProcessor;
      this.events = events;
      this.init();
    }
  
    private init(): void {
      this.events.on(AppEvent.ProductListLoaded, (products: IProduct[]) => console.log('Обновлен список товаров', products));
      this.events.on(AppEvent.OrderCreated, (order: IOrder) => console.log('Заказ создан', order));
    }
  }
  
  // Инициализация
  const events = new EventEmitter();
  const sampleProducts: IProduct[] = [
    { id: '1', title: 'Фреймворк куки судьбы', price: 2500, category: 'софт-скил', description: 'Описание товара', image: 'image1.png' },
    { id: '2', title: '+1 час в сутках', price: 750, category: 'другое', description: 'Описание товара', image: 'image2.png' }
  ];
  
  const catalog = new Catalog(sampleProducts);
  const basket = new Basket(events);
  const orderProcessor = new OrderProcessor(events);
  const presenter = new Presenter(catalog, basket, orderProcessor, events);
  
  console.log('Каталог товаров:', catalog.getAllProducts());