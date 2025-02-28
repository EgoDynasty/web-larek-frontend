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

- `renderProducts(products: IProduct[]): void` — отображает список товаров, создавая для каждого экземпляр ProductCardView.
ProductCardView
Отображает одну карточку товара на витрине.

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

- `modal: Modal` — объект модального окна.
- `baseUrl: string` — базовый URL для картинок.
- `events: EventEmitter` — для отправки событий (например, добавления в корзину).

**Конструктор:**

- `constructor(events: EventEmitter)` — создаёт модальное окно с шаблоном #card-preview.

**Методы:**

- `renderProductDetails(product: IProduct): void` — заполняет модальное окно данными о товаре и открывает его.
- `getModal(): Modal` — возвращает объект модального окна.
- `close(): void` — закрывает модальное окно.
- `destroy(): void` — удаляет модальное окно из DOM.

### `BasketView`

Отвечает за отображение корзины и управление её содержимым.

**DOM-элементы:**
- `basketElement` — контейнер корзины (`#basket`).
- `counterElement` — элемент для отображения количества товаров (`#basket-counter`).
Использует #basket как шаблон для модального окна.

**Поля:**
- `modal: Modal` — объект модального окна.
- `totalPriceElement: HTMLElement` — элемент с общей суммой (.basket__price).
- `basketListElement: HTMLElement` — список товаров в корзине (.basket__list).
- `orderButtonElement: HTMLButtonElement` — кнопка оформления заказа (.basket__button).
- `events: EventEmitter` — для отправки событий.

**Конструктор:**

- `constructor(events: EventEmitter)` — находит все нужные элементы и настраивает события.

**Методы:**

- `setOrderButtonDisabled(isDisabled: boolean): void` — включает или выключает кнопку оформления.
- `setBasketItems(items: IProduct[]): void` — обновляет список товаров в корзине.
- `setOnDeleteItemCallback(callback: (productId: string) => void): void` — задаёт функцию для удаления товара.
- `render(items: IProduct[]): void` — отображает товары в корзине и обновляет счетчик и сумму.
- `updateCounter(count: number): void` — обновляет число товаров в счетчике.
- `updateTotalPrice(totalPrice: number): void` — обновляет общую сумму.
- `open(): void` — открывает модальное окно корзины.
- `close(): void` — закрывает модальное окно корзины.
- `getModal(): Modal` — возвращает объект модального окна.

### `BasketItemView`
Отображает один товар в корзине.

**DOM-элементы:**

- `element: HTMLElement` — элемент товара в корзине.

**Поля:**

- `product: IProduct` — данные о товаре.
- `index: number` — порядковый номер товара.
- `onDelete?: (productId: string) => void` — функция для удаления товара.

**Конструктор:**

- `constructor(product: IProduct & { index: number }, onDelete?: (productId: string) => void)` — создаёт элемент товара.

**Методы:**

Нет публичных методов, только рендеринг в конструкторе.

### `OrderSuccessView`

Показывает модальное окно успешного заказа.

**DOM-элементы:**

Использует #success как шаблон для модального окна.

**Поля:**

- `modal: Modal` — объект модального окна.

**Конструктор:**

- `constructor()` — создаёт модальное окно с шаблоном #success.

**Методы:**

- `render(order: IOrderResponse): void` — заполняет окно данными о заказе и открывает его.
- `getModal(): Modal` — возвращает объект модального окна.
- `close(): void` — закрывает модальное окно.
- `destroy(): void` — удаляет модальное окно из DOM.

### `OrderPaymentView`

Показывает модальное окно для ввода адреса и выбора оплаты.

**DOM-элементы:**

Использует #order как шаблон для модального окна.

**Поля:**

- `modal: Modal` — объект модального окна.
- `nextButton: HTMLElement | null` — кнопка "Далее" (.order__button).

**Конструктор:**

- `constructor()` — создаёт модальное окно с шаблоном #order.
Методы:

- `render(): void` — открывает модальное окно.
- `setOnNextButtonClick(callback: () => void): void` — задаёт функцию для кнопки "Далее".
- `getModal(): Modal` — возвращает объект модального окна.
- `close(): void` — закрывает модальное окно.
- `destroy(): void` — удаляет модальное окно из DOM.

### `OrderContactsView`

Показывает модальное окно для ввода email и телефона.

**DOM-элементы:**

Использует #contacts как шаблон для модального окна.

**Поля:**

- `modal: Modal` — объект модального окна.
- `payButton: HTMLElement | null` — кнопка "Оплатить" (.button).

**Конструктор:**

- `constructor()` — создаёт модальное окно с шаблоном #contacts.

**Методы:**

- `render(): void` — открывает модальное окно.
- `setOnPayButtonClick(callback: () => void): void` — задаёт функцию для кнопки "Оплатить".
- `getModal(): Modal` — возвращает объект модального окна.
- `close(): void` — закрывает модальное окно.
- `destroy(): void` — удаляет модальное окно из DOM.

### `Modal`

Универсальный класс для работы с модальными окнами.

**DOM-элементы:**

Создаёт .modal и .modal__container программно или использует шаблон.

**Поля:**

- `modalElement: HTMLElement` — корневой элемент модального окна.
- `closeButton: HTMLElement | null` — кнопка закрытия (.modal__close).
- `contentContainer: HTMLElement | null` — контейнер для содержимого (.modal__content).

**Конструктор:**

- `constructor(options: { templateId?: string; content?: HTMLElement | DocumentFragment; onClose?: () => void })` — создаёт модальное окно с указанным шаблоном или контентом.

**Методы:**

- `open(): void` — открывает модальное окно.
- `close(): void` — закрывает модальное окно.
- `setContent(content: HTMLElement | DocumentFragment): void` — задаёт содержимое окна.
- `getModalElement(): HTMLElement` — возвращает корневой элемент окна.
- `destroy(): void` — удаляет окно из DOM.

## Слой презентера (Presenter)

**Presenter**

Связывает модель и представление, управляет всей логикой приложения.

**Поля:**

- `catalog: Catalog` — модель каталога.
- `basket: Basket` — модель корзины.
- `orderProcessor: OrderProcessor` — модель обработки заказа.
- `events: EventEmitter` — объект событий.
- `api: Api` — объект для общения с сервером.
- `productDetailsView: ProductDetailsView` — представление деталей товара.
- `catalogView: CatalogView` — представление витрины.
- `basketView: BasketView` — представление корзины.
- `orderSuccessView: OrderSuccessView` — представление успешного заказа.
- `orderPaymentView: OrderPaymentView` — представление оплаты.
- `orderContactsView: OrderContactsView` — представление контактов.

**Конструктор:**

`constructor(catalog: Catalog, basket: Basket, orderProcessor: OrderProcessor, events: EventEmitter, api: Api)` — создаёт все представления и запускает инициализацию.

**Методы:**

- `init(): Promise<void>` — загружает товары с сервера и настраивает приложение.
- `setupEventListeners(): void` — настраивает обработку событий.
- `addToBasket(product: IProduct): void` — добавляет товар в корзину.
- `removeFromBasket(productId: string): void` — убирает товар из корзины.
- `openPaymentModal(): void` — открывает окно оплаты.
- `validatePaymentStep(): void` — проверяет данные оплаты.
- `openContactsModal(): void` — открывает окно контактов.
- `validateContactsStep(): void` — проверяет и отправляет заказ.

---

## Описание событий

Приложение использует `EventEmitter` для управления событиями.

### Основные события:

- `product_list_loaded` – загружен список товаров, обновление каталога.
- `product_loaded` – загрузка конкретного товара, отображение в модальном окне.
- `order_created` – заказ оформлен, корзина очищена.
- `error_occurred` – возникла ошибка.
- `basket_updated` – обновление корзины (товар добавлен или удален).
- `order_status_changed` – изменение статуса заказа (например, "оплачен", "в процессе").
- `product_added` – добавлен новый товар в каталог.
- `product_updated` – обновлен товар в каталоге.

При каждом событии интерфейс обновляется, обеспечивая корректную работу приложения.
