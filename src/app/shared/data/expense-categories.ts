export interface ExpenseCategory {
  key: string;
  label: string;
  icon: string;
  keywords?: string[];
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    key: 'Food',
    label: 'Food',
    icon: '/assets/category-food.svg',
    keywords: ['comida', 'fideos', 'pizza', 'hamburguesa', 'cheese'],
  },
  {
    key: 'Restaurant',
    label: 'Restaurant',
    icon: '/assets/category-restaurant.svg',
    keywords: [
      'restaurante',
      'salida',
      'cena afuera',
      'almuerzo afuera',
      'comer afuera',
      'merienda',
    ],
  },
  {
    key: 'Greengrocery',
    label: 'Greengrocery',
    icon: '/assets/category-vegetables.svg',
    keywords: [
      'verdura',
      'verduras',
      'verduleria',
      'fruta',
      'frutas',
      'tomate',
      'limon',
      'naranja',
      'manzana',
    ],
  },
  {
    key: 'Meat',
    label: 'Meat',
    icon: '/assets/category-meat.svg',
    keywords: ['carne', 'milanesas', 'carniceria', 'carne picada', 'bife', 'chuleta', 'limon'],
  },
  {
    key: 'Rent',
    label: 'Rent',
    icon: '/assets/category-home.svg',
    keywords: ['alquiler', 'departamento', 'casa', 'renta'],
  },
  {
    key: 'Gas',
    label: 'Gas',
    icon: '/assets/category-gas.svg',
    keywords: ['gas'],
  },
  {
    key: 'Electricity',
    label: 'Electricity',
    icon: '/assets/category-electricity.svg',
    keywords: ['luz', 'electricidad'],
  },
  {
    key: 'Water',
    label: 'Water',
    icon: '/assets/category-water.svg',
    keywords: ['agua'],
  },
  {
    key: 'Car',
    label: 'Car',
    icon: '/assets/category-car.svg',
    keywords: [
      'taxi',
      'uber',
      'bus',
      'colectivo',
      'combustible',
      'gasolina',
      'auto',
      'carro',
      'transporte',
      'nafta',
    ],
  },
  {
    key: 'Healthcare',
    label: 'Healthcare',
    icon: '/assets/category-pharmacy.svg',
    keywords: ['farmacia', 'medicina', 'doctor', 'salud', 'meds', 'consulta'],
  },
  {
    key: 'Clothes',
    label: 'Clothes',
    icon: '/assets/category-clothes.svg',
    keywords: ['ropa', 'camisa', 'pantalón', 'zapatos', 'vestido', 'outfit', 'clothes', 'clothing'],
  },
  {
    key: 'Entertainment',
    label: 'Entertainment',
    icon: '/assets/category-entertainment.svg',
    keywords: ['cine', 'pelicula', 'netflix', 'spotify', 'show', 'entretenimiento', 'juego'],
  },
  {
    key: 'Other',
    label: 'Other',
    icon: '/assets/category-default.svg',
    keywords: [],
  },
];
