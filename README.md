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

**Конструктор:**

- `constructor(products: IProduct[])` – получает массив товаров и сохраняет их.

**Методы:**

- `getAllProducts(): IProduct[]` – возвращает полный список товаров.
- `setProducts(products: IProduct[]): void` – загружает список товаров в корзину, заменяя текущий массив товаров.
- `updateProduct(productId: string, updatedProduct: IProduct): void` – обновляет товар в каталоге и генерирует событие об обновлении товара.

### `Basket`

Отвечает за управление товарами в корзине.

**Поля:**
- `items: IProduct[]` – массив товаров, добавленных в корзину.

**Конструктор:**
- `constructor()` – создаёт пустую корзину.

**Методы:**
- `addItem(product: IProduct): void` – добавляет товар в корзину.
- `removeItem(productId: string): void` – удаляет товар по ID.
- `getItems(): IProduct[]` – возвращает список товаров в корзине.
- `clear(): void` – очищает корзину, удаляя все товары.
- `getTotalPrice(): number` – рассчитывает и возвращает общую стоимость товаров в корзине.

**Поля:**
- `items: IProduct[]` – массив товаров, добавленных в корзину.

**Конструктор:**

- `constructor()` – создаёт пустую корзину.

**Методы:**

- `addItem(product: IProduct): void` – добавляет товар в корзину.
- `removeItem(productId: string): void` – удаляет товар по ID.
- `getItems(): IProduct[]` – возвращает список товаров в корзине.

### `OrderProcessor`

Этот класс отвечает за обработку заказов и их валидацию.

**Поля:**

- `order: IOrder | null` - объект заказа

**Методы:**

- `createOrder(order: IOrder): void` – проверяет корректность данных и формирует объект заказа.  
  **Важно:** `OrderProcessor` не отправляет данные на сервер – этим занимается слой Presenter. Метод возвращает заказ для дальнейшей обработки.  
- `getOrder(); IOrder | null` - возвращает текущий заказ, если он был оформлен
- `validateOrder(order: IOrder): boolean` – проверяет корректность заполненных полей.
Если данные невалидны, метод вызывает событие OrderValidationError с текстом ошибки.

---

## Слой представления (View)

### `ProductDetailsView`

Отвечает за отображение деталей товара в модальном окне.

**DOM-элементы:**
- `modalElement` — контейнер модального окна (`#product-modal`).
- `addToCartButton` — кнопка "Добавить в корзину" (`#add-to-cart-button`).

**Методы:**
- `renderProductDetails(product: IProduct): void` — заполняет модальное окно данными о товаре.
- `updateAddToCartButton(isInCart: boolean): void` — изменяет текст кнопки.
- `closeModal(): void` — закрывает модальное окно.

### `OrderFormView`

Отвечает за отображение формы заказа и обработку ввода данных.

**DOM-элементы:**
- `formElement` — контейнер формы заказа (`#order-form`).
- `errorElement` — элемент для отображения ошибок (`#order-error`).

**Методы:**
- `render(): void` — отображает форму заказа.
- `showError(message: string): void` — отображает сообщение об ошибке.
- `clearForm(): void` — очищает форму.
- `renderOrderSuccess(order: IOrderResponse): void` — отображает успешный заказ.
- `renderOrderError(error: string): void` — отображает ошибку.

### `OrderSuccessView`

Отвечает за отображение экрана успешного оформления заказа.

**DOM-элементы:**
- `successElement` — контейнер для сообщения об успешном заказе (`#order-success`).

**Методы:**
- `render(order: IOrderResponse): void` — отображает информацию о заказе.
- `close(): void` — закрывает экран успешного заказа.

### `BasketView`

Отвечает за отображение корзины и управление её содержимым.

**DOM-элементы:**
- `basketElement` — контейнер корзины (`#basket`).
- `counterElement` — элемент для отображения количества товаров (`#basket-counter`).

**Методы:**
- `render(items: IProduct[]): void` — отображает список товаров в корзине.
- `updateCounter(count: number): void` — обновляет счетчик товаров.
- `show(): void` — отображает корзину.
- `hide(): void` — скрывает корзину.

### Кнопка открытия корзины и счетчик товаров

Кнопка открытия корзины и счетчик товаров находятся в шапке сайта (`header`). Они управляются классом `BasketView`.

**DOM-элементы:**
- Кнопка открытия корзины: `<button class="header__basket">`.
- Счетчик товаров: `<span class="header__basket-counter">0</span>`.

**Логика:**
- При добавлении товара в корзину счетчик обновляется через метод `updateCounter`.
- При нажатии на кнопку корзины вызывается метод `show`, который отображает корзину.

---

## Слой презентера (Presenter)

Этот слой координирует взаимодействие между моделью и представлением.

**Основные задачи:**

- Следит за изменениями данных в модели.
- Обновляет интерфейс при изменении состояния приложения.
- Обрабатывает пользовательские действия (например, добавление товаров в корзину, оформление заказа).

**События, связанные с товарами:**
- `ProductListLoaded` - обновляет модель Catalog и представление ProductView.
- `ProductLoaded` - обновляет представление ProductDetailsView.
- `ProductAdded` - обновляет модель Basket и представление BasketView.
- `ProductUpdated` - обновляет модель Basket и представление BasketView.

**События, связанные с корзиной:**
- `BasketUpdated` - обновляет модель Basket и представление BasketView.
- `BasketCleared` - обновляет модель Basket и представление BasketView.

**События, связанные с заказом:**
- `OrderCreated` - обновляет модель OrderProcessor и представление OrderSuccessView.
- `OrderStatusChange` - обновляет модель OrderProcessor и представление OrderView.
- `OrderFormSubmitted` - обновляет модель OrderProcessor и представление OrderFormView.

**События, связанные с ошибками:**
- `ErrorOccurred` - обновляет представление OrderFormView или ProductView.

**События, связанные с UI:**
- `ModalClosed` - обновляет представление ProductDetailsView или OrderFormView.
- `BasketOpened` - обновляет представление BasketView.
- `BasketClosed` - обновляет представление BasketView.

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