export function getCategoryClass(category: string): string {
    switch (category) {
      case 'софт-скил': return 'card__category_soft';
      case 'другое': return 'card__category_other';
      case 'дополнительное': return 'card__category_additional';
      case 'кнопка': return 'card__category_button';
      case 'хард-скил': return 'card__category_hard';
      default: return '';
    }
  }