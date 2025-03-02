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
  private errors: { [key: string]: string } = {
    payment: '',
    address: '',
    email: '',
    phone: '',
  };

  constructor(events: EventEmitter) {
    this.events = events;
  }

  private validateEmail(email: string): boolean {
    if (!email.trim()) {
      this.errors.email = 'Введите email';
      return false;
    }
    if (!email.includes('@')) {
      this.errors.email = 'Некорректный email';
      return false;
    }
    this.errors.email = '';
    return true;
  }

  private validatePhone(phone: string): boolean {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanedPhone.match(/^(\+7|8)\d{10}$/)) {
      this.errors.phone = 'Некорректный номер телефона';
      return false;
    }
    this.errors.phone = '';
    return true;
  }

  private validateAddress(address: string): boolean {
    if (!address.trim()) {
      this.errors.address = 'Введите адрес доставки';
      return false;
    }
    this.errors.address = '';
    return true;
  }

  private validatePayment(payment: 'online' | 'cash' | null): boolean {
    if (!payment) {
      this.errors.payment = 'Выберите способ оплаты';
      return false;
    }
    this.errors.payment = '';
    return true;
  }

  validatePaymentForm(): { isValid: boolean; errors: { [key: string]: string } } {
    const isPaymentValid = this.validatePayment(this.order.payment);
    const isAddressValid = this.validateAddress(this.order.address || '');
    return {
      isValid: isPaymentValid && isAddressValid,
      errors: { payment: this.errors.payment, address: this.errors.address },
    };
  }

  validateContactsForm(): { isValid: boolean; errors: { [key: string]: string } } {
    const isEmailValid = this.validateEmail(this.order.email || '');
    const isPhoneValid = this.validatePhone(this.order.phone || '');
    return {
      isValid: isEmailValid && isPhoneValid,
      errors: { email: this.errors.email, phone: this.errors.phone },
    };
  }

  validateOrder(order: Partial<IOrder>): boolean {
    const isPaymentValid = this.validatePayment(order.payment);
    const isAddressValid = this.validateAddress(order.address || '');
    const isEmailValid = this.validateEmail(order.email || '');
    const isPhoneValid = this.validatePhone(order.phone || '');
    return isPaymentValid && isAddressValid && isEmailValid && isPhoneValid;
  }

  setPayment(payment: 'online' | 'cash'): void {
    this.order.payment = payment;
    this.validatePayment(payment);
  }

  setAddress(address: string): void {
    this.order.address = address;
    const isValid = this.validateAddress(address);
    this.events.emit(AppEvent.AddressUpdated, { address, isValid, error: this.errors.address });
  }

  setEmail(email: string): void {
    this.order.email = email;
    const isValid = this.validateEmail(email);
    this.events.emit(AppEvent.EmailUpdated, { email, isValid, error: this.errors.email });
  }

  setPhone(phone: string): void {
    this.order.phone = phone;
    const isValid = this.validatePhone(phone);
    this.events.emit(AppEvent.PhoneUpdated, { phone, isValid, error: this.errors.phone });
  }

  getOrder(): Partial<IOrder> {
    return { ...this.order };
  }

  isOrderValid(): boolean {
    return this.validateOrder(this.order);
  }

  getErrors(): { [key: string]: string } {
    return { ...this.errors };
  }
}