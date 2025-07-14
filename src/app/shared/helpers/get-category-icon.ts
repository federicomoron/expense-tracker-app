const iconMappings = [
  {
    keywords: ['fideos', 'comida', 'cheese', 'pizza', 'food'],
    icon: '/assets/food.svg',
  },
  {
    keywords: ['verdura', 'fruta', 'carne', 'grocery', 'super', 'supermarket'],
    icon: '/assets/groceries.svg',
  },
  {
    keywords: ['rent', 'alquiler', 'depto'],
    icon: '/assets/home.svg',
  },
  {
    keywords: ['agua', 'water', 'gas', 'electricity', 'luz', 'servicio'],
    icon: '/assets/water.svg',
  },
  {
    keywords: ['gasoline', 'fuel', 'car', 'uber', 'bus'],
    icon: '/assets/transport.svg',
  },
  {
    keywords: ['pharmacy', 'medicine', 'meds', 'doctor', 'salud'],
    icon: '/assets/salud.svg',
  },
  {
    keywords: ['ropa', 'clothes', 'clothing', 'shoes', 'outfit'],
    icon: '/assets/ropa.svg',
  },
  {
    keywords: ['cine', 'pelicula', 'netflix', 'spotify', 'show', 'entertainment'],
    icon: '/assets/entertainment.svg',
  },
  {
    keywords: ['subscription', 'app', 'service', 'suscripción'],
    icon: '/assets/subscription.svg',
  },
];

export function getCategoryIcon(description: string): string {
  const desc = description.toLowerCase();
  for (const mapping of iconMappings) {
    if (mapping.keywords.some((keyword) => desc.includes(keyword))) {
      return mapping.icon;
    }
  }
  return '/assets/default.svg';
}
