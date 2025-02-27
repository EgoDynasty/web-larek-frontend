import { IOrder } from '../../types/types';
import { EventEmitter } from '../base/events';

export class OrderProcessor {
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  validateEmail(email: string): boolean {
    if (!email.trim()) {
      this.events.emit("OrderValidationError", { message: "Введите email" });
      return false;
    }
    if (!email.includes("@")) {
      this.events.emit("OrderValidationError", { message: "Некорректный email" });
      return false;
    }
    return true;
  }

  validatePhone(phone: string): boolean {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');

    if (!cleanedPhone.match(/^(\+7|8)\d{10}$/)) {
      this.events.emit("OrderValidationError", { message: "Некорректный номер телефона" });
      return false;
    }

    return true;
  }

  validateAddress(address: string): boolean {
    if (!address.trim()) {
      this.events.emit("OrderValidationError", { message: "Введите адрес доставки" });
      return false;
    }
    return true;
  }

  validateOrder(order: IOrder): boolean {
    return (
      this.validateEmail(order.email) &&
      this.validatePhone(order.phone) &&
      this.validateAddress(order.address)
    );
  }
}