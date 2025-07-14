const categories = [
  { keywords: ['water', 'gas', 'electricity', 'agua'], icon: '/assets/water.svg' },
  {
    keywords: ['fideos', 'comida', 'cheese', 'pizza', 'food', 'supermarket', 'grocery'],
    icon: '/assets/food.svg',
  },
  { keywords: ['rent', 'alquiler', 'depto'], icon: '/assets/home.svg' },
  { keywords: ['gasoline', 'fuel', 'car', 'uber', 'bus'], icon: '/assets/transport.svg' },
  { keywords: ['clothes', 'clothing', 'shoes', 'outfit'], icon: '/assets/ropa.svg' },
  { keywords: ['pharmacy', 'medicine', 'meds', 'doctor'], icon: '/assets/salud.svg' },
];

export function getCategoryIcon(description: string): string {
  const desc = description.toLowerCase();

  for (const category of categories) {
    if (category.keywords.some((keyword) => desc.includes(keyword))) {
      return category.icon;
    }
  }

  return '/assets/default.svg';
}
