import { AppEvent, IOrder } from '../../types/types';
import { EventEmitter } from '../base/events';

export class OrderProcessor {
  private events: EventEmitter;
  private order: Partial<IOrder> = {
    payment: null,
    address: '',
    email: '',
    phone: '',
  };

  constructor(events: EventEmitter) {
    this.events = events;
  }

  validateEmail(email: string): boolean {
    if (!email.trim()) {
      this.events.emit(AppEvent.ErrorOccurred, { message: "Введите email" });
      return false;
    }
    if (!email.includes('@')) {
      this.events.emit(AppEvent.ErrorOccurred, { message: "Некорректный email" });
      return false;
    }
    return true;
  }

  validatePhone(phone: string): boolean {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanedPhone.match(/^(\+7|8)\d{10}$/)) {
      this.events.emit(AppEvent.ErrorOccurred, { message: "Некорректный номер телефона" });
      return false;
    }
    return true;
  }

  validateAddress(address: string): boolean {
    if (!address.trim()) {
      this.events.emit(AppEvent.ErrorOccurred, { message: "Введите адрес доставки" });
      return false;
    }
    return true;
  }

  validatePaymentForm(): boolean {
    return this.order.payment !== null && this.validateAddress(this.order.address || '');
  }

  validateContactsForm(): boolean {
    return this.validateEmail(this.order.email || '') && this.validatePhone(this.order.phone || '');
  }

  validateOrder(order: Partial<IOrder>): boolean {
    return (
      this.validateEmail(order.email || '') &&
      this.validatePhone(order.phone || '') &&
      this.validateAddress(order.address || '') &&
      order.payment !== null
    );
  }

  setPayment(payment: 'online' | 'cash'): void {
    this.order.payment = payment;
  }

  setAddress(address: string): void {
    this.order.address = address;
    const isValid = this.validateAddress(address);
    this.events.emit(AppEvent.AddressUpdated, { address, isValid, error: isValid ? '' : 'Введите адрес доставки' });
  }

  setEmail(email: string): void {
    this.order.email = email;
    const isValid = this.validateEmail(email);
    this.events.emit(AppEvent.EmailUpdated, { email, isValid, error: isValid ? '' : 'Некорректный email' });
  }

  setPhone(phone: string): void {
    this.order.phone = phone;
    const isValid = this.validatePhone(phone);
    this.events.emit(AppEvent.PhoneUpdated, { phone, isValid, error: isValid ? '' : 'Некорректный номер телефона' });
  }

  getOrder(): Partial<IOrder> {
    return { ...this.order };
  }

  isOrderValid(): boolean {
    return this.validateOrder(this.order);
  }
}