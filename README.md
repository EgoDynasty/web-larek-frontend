# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

# Web-ларёк

## Используемый стек

Проект построен с использованием следующих технологий:

- TypeScript
- HTML
- CSS
- JavaScript (ES6+)

## Инструкция по сборке и запуску

1. Установите зависимости:
   ```sh
   npm install
   ```
2. Запустите локальный сервер:
   ```sh
   npm start
   ```

### Архитектура проекта

Проект использует архитектурный паттерн **MVP (Model-View-Presenter)**, что позволяет четко разделить код на три логических слоя:

1. **Model** – отвечает за работу с данными и их обработку.
2. **View** – отображает данные и обрабатывает действия пользователя.
3. **Presenter** – связывает Model и View, управляя их взаимодействием.

---

## Слой модели (Model)

### `Catalog`

Этот класс хранит список товаров и предоставляет методы для работы с ними.

**Поля:**
- `products: IProduct[]` – массив товаров, загружаемый из API или предустановленных данных.
- `events: EventEmitter` — для отправки событий, например, когда список товаров обновляется.

**Конструктор:**

- `constructor(events: EventEmitter)` — принимает объект событий и создаёт пустой каталог.

**Методы:**
- `setProducts(products: IProduct[]): void` — заполняет каталог товарами и отправляет событие ProductListLoaded.
- `getAllProducts(): IProduct[]` – возвращает полный список товаров.
= `getProductById(id: string): IProduct | undefined` – возвращает товар по ID.
- `updateProduct(productId: string, updatedProduct: IProduct): void` – обновляет товар в каталоге и генерирует событие об обновлении товара.

### `Basket`

Отвечает за управление товарами в корзине.

**Поля:**
- `items: IProduct[]` – массив товаров, добавленных в корзину.
- `events: EventEmitter` — для уведомления о действиях с корзиной.

**Конструктор:**
- `constructor()` – создаёт пустую корзину.

**Методы:**
- `addItem(product: IProduct): void` — добавляет товар в корзину и отправляет событие ProductAdded.
- `removeItem(productId: string): void` — убирает товар из корзины по ID и отправляет событие ProductRemoved.
- `getItems(): IProduct[]` — возвращает текущий список товаров в корзине.
- `clear(): void` — полностью очищает корзину.
- `getTotalPrice(): number` — считает общую стоимость всех товаров в корзине.

### `OrderProcessor`

Этот класс отвечает за обработку заказов и их валидацию.

**Поля:**

- `events: EventEmitter` – для управления событиями.

**Методы:**

- `validateEmail(email: string): boolean` – проверяет корректность email.

- `validatePhone(phone: string): boolean` – проверяет корректность номера телефона.

- `validateAddress(address: string): boolean` – проверяет корректность адреса.

- `validateOrder(order: IOrder): boolean` – проверяет корректность заказа.

- `validatePaymentForm(): boolean` - проверяет корректность поля оплаты.

- `validateContactsForm(): boolean` - проверяет корректность поля контактов.

- `setPayment(payment: 'online' | 'cash'): void` – устанавливает способ оплаты.

- `setAddress(address: string): void` – устанавливает адрес и отправляет событие AddressUpdated.

- `setEmail(email: string): void` – устанавливает email и отправляет событие EmailUpdated.

- `setPhone(phone: string): void` – устанавливает телефон и отправляет событие PhoneUpdated.

- `getOrder(): Partial<IOrder>` – возвращает текущее состояние заказа.

- `isOrderValid(): boolean` – проверяет валидность текущего состояния заказа.

- `getErrors(): string` - выдает получаемые ошибки.

---

## Слой представления (View)

### `CatalogView`

Показывает витрину с товарами.

**DOM-элементы:**

- `galleryElement: HTMLElement` — контейнер для карточек товаров (.gallery).

**Поля:**

`events: EventEmitter` — для отправки событий, например, при клике на карточку.

**Конструктор:**

- `constructor(events: EventEmitter)` — находит контейнер .gallery и сохраняет объект событий.

**Методы:**

- `setProducts` — отображает список товаров

### `ProductCardView`

Отображает одну карточку товара на витрине.

**DOM-элементы:**

- `element: HTMLElement` — сама карточка (.gallery__item).

**Поля:**

- `events: EventEmitter` — для отправки событий, например, открытия деталей.

- `baseUrl: string` — базовый URL для картинок товаров.

**Конструктор:**

- `constructor(product: IProduct, events: EventEmitter)` — создаёт карточку на основе продукта и настраивает события.

**Методы:**

- `getElement(): HTMLElement` — возвращает DOM-элемент карточки.

### `ProductDetailsView`

Показывает модальное окно с подробностями о товаре.

**DOM-элементы:**

Использует #card-preview как шаблон для модального окна.

**Поля:**

- `content: HTMLElement` — объект модального окна.

- `baseUrl: string` — базовый URL для картинок.

- `events: EventEmitter` — для отправки событий (например, добавления в корзину).

**Конструктор:**

- `constructor(events: EventEmitter)` — создаёт модальное окно с шаблоном #card-preview.

**Методы:**

- `renderProductDetails(product: IProduct): void` — заполняет модальное окно данными о товаре и открывает его.

- `getContent(): HTMLElement` — возвращает объект модального окна.


### `BasketView`

Отвечает за отображение корзины и управление её содержимым.

**DOM-элементы:**

- `basketElement` — контейнер корзины (`#basket`).

- `counterElement` — элемент для отображения количества товаров (`#basket-counter`).

Использует #basket как шаблон для модального окна.

**Поля:**

- `basketContainer: HTMLElement` – содержимое корзины.

- `totalPriceElement: HTMLElement` — элемент с общей суммой (.basket__price).

- `basketListElement: HTMLElement` — список товаров в корзине (.basket__list).

- `orderButtonElement: HTMLButtonElement` — кнопка оформления заказа (.basket__button).

- `events: EventEmitter` — для отправки событий.

**Конструктор:**

- `constructor(events: EventEmitter)` — находит все нужные элементы и настраивает события.

**Методы:**

- `setOrderButtonDisabled(isDisabled: boolean): void` — включает или выключает кнопку оформления.

- `setItems(items: IProduct[]): void` — обновляет список товаров в корзине..

- `updateCounter(count: number): void` — обновляет число товаров в счетчике.

- `updateTotalPrice(totalPrice: number): void` — обновляет общую сумму.

- `getContent(): HTMLElement` – возвращает содержимое корзины.


### `BasketItemView`

Отображает один товар в корзине.

**DOM-элементы:**

- `itemElement: HTMLElement` – элемент товара (.basket__item).

**Конструктор:**

- `constructor(product: IProduct & { index: number }, onDelete?: (productId: string) => void)` — создаёт элемент товара.

**Методы:**

- `get element(): HTMLElement` – возвращает DOM-элемент товара.

### `OrderSuccessView`

Показывает модальное окно успешного заказа.

**DOM-элементы:**

Использует #success как шаблон для модального окна.

**Поля:**

- `content: HTMLElement` – содержимое сообщения.

**Конструктор:**

- `constructor()` — создаёт модальное окно с шаблоном #success.

**Методы:**

- `render(order: IOrderResponse): void` – заполняет содержимое данными о заказе.

- `getContent(): HTMLElement` – возвращает содержимое сообщения.

### `OrderPaymentView`

Показывает модальное окно для ввода адреса и выбора оплаты.

**DOM-элементы:**

Использует #order как шаблон для модального окна.

**Поля:**

- `paymentContainer: HTMLElement` – содержимое формы.

- `addressInput: HTMLInputElement` – поле ввода адреса (input[name="address"]).

- `nextButton: HTMLButtonElement` – кнопка "Далее" (.order__button).

- `paymentButtons: NodeListOf<HTMLElement>` – кнопки выбора оплаты (.button_alt).

- `errorsElement: HTMLElement` – элемент для ошибок (.form__errors).

- `events: EventEmitter` – для отправки событий.

**Конструктор:**

- `constructor()` — создаёт модальное окно с шаблоном #order.

**Методы:**

- `setError(error: string): void` – отображает сообщение об ошибке.

- `setButtonState(isEnabled: boolean): void` – включает или выключает кнопку "Далее".

- `getContent(): HTMLElement` – возвращает содержимое формы.

### `OrderContactsView`

Показывает модальное окно для ввода email и телефона.

**DOM-элементы:**

Использует #contacts как шаблон для модального окна.

**Поля:**

- `contactsContainer: HTMLElement` – содержимое формы.

- `emailInput: HTMLInputElement` – поле ввода email (input[name="email"]).

- `phoneInput: HTMLInputElement` – поле ввода телефона (input[name="phone"]).

- `payButton: HTMLButtonElement` – кнопка "Оплатить" (.button).

- `errorsElement: HTMLElement` – элемент для ошибок (.form__errors).

- `events: EventEmitter` – для отправки событий.

**Конструктор:**

- `constructor(events: EventEmitter)` — создаёт модальное окно с шаблоном #contacts.

**Методы:**

- `setError(error: string): void` – отображает сообщение об ошибке.

- `setButtonState(isEnabled: boolean): void` – включает или выключает кнопку "Оплатить".

- `getContent(): HTMLElement` – возвращает содержимое формы.

### `Modal`

Универсальный класс для работы с модальными окнами.

**DOM-элементы:**

- `modalElement: HTMLElement` – корневой элемент (.modal).

- `closeButton: HTMLElement | null` – кнопка закрытия (.modal__close).

- `contentContainer: HTMLElement | null` – контейнер для содержимого (.modal__content).

**Поля:**

 - `events: EventEmitter` – для работы с событиями.

**Конструктор:**

- `constructor(events: EventEmitter)` – находит существующий .modal и настраивает события.

**Методы:**

- `open(): void` — открывает модальное окно.

- `close(): void` — закрывает модальное окно.

- `setContent(content: HTMLElement): void` — задаёт содержимое окна.

## Слой презентера (Presenter)

**Presenter**

Связывает модель и представление, управляет всей логикой приложения.

**Поля:**

- `catalog: Catalog` — модель каталога.

- `basket: Basket` — модель корзины.

- `orderProcessor: OrderProcessor` — модель обработки заказа.

- `events: EventEmitter` — объект событий.

- `api: Api` — объект для общения с сервером.

- `modal: Modal` - единое модальное окно.

- `productDetailsView: ProductDetailsView` — представление деталей товара.

- `catalogView: CatalogView` — представление витрины.

- `basketView: BasketView` — представление корзины.

- `orderSuccessView: OrderSuccessView` — представление успешного заказа.

- `orderPaymentView: OrderPaymentView` — представление оплаты.

- `orderContactsView: OrderContactsView` — представление контактов.

**Конструктор:**

`constructor(catalog: Catalog, basket: Basket, orderProcessor: OrderProcessor, events: EventEmitter, api: Api)` — создаёт все представления и запускает инициализацию.

**Методы:**

- `init(): Promise<void>` – загружает товары с сервера.

- `setupEventListeners(): void` – настраивает обработчики событий.

- `addToBasket(product: IProduct): void` – добавляет товар в корзину и обновляет UI.

- `removeFromBasket(productId: string): void` – удаляет товар из корзины и обновляет UI.

---

## Описание событий

Приложение использует `EventEmitter` для управления событиями.

### Основные события:

- `ProductListLoaded` – товары загружены с сервера, витрина обновляется.
- `ProductDetailsOpened` – открыто окно с деталями товара.
- `ProductAdded` – товар добавлен в корзину, обновляется счётчик и UI.
- `ProductRemoved` – товар удалён из корзины, корзина перерендерится.
- `BasketOpened` – открыта корзина.
- `OrderStarted` – начат процесс оформления, открывается окно оплаты.
- `PaymentSelected` – выбран способ оплаты.
- `AddressChanged` – изменён адрес доставки.
- `AddressUpdated` – обновлена валидация адреса.
- `EmailChanged` – изменён email.
- `EmailUpdated`– обновлена валидация email.
- `PhoneChanged` – изменён телефон.
- `PhoneUpdated` – обновлена валидация телефона.
- `PaymentSubmitted` – отправлена форма оплаты, переход к контактам.
- `ContactsSubmitted` – отправлена форма контактов, создание заказа.
- `OrderCreated` – заказ успешно создан, показ успеха.
- `ErrorOccurred` – возникла ошибка.

Эти события обеспечивают связь между слоями, позволяя Presenter реагировать на действия пользователя и обновлять интерфейс.
