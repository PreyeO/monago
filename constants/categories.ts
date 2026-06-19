export type Subcategory = {
  name: string;
  slug: string;
  amwayCode: string;
};

export type Category = {
  name: string;
  slug: string;
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    name: 'Beauty',
    slug: 'beauty',
    subcategories: [
      { name: 'Skincare',                      slug: 'skincare',                      amwayCode: 'Skincare' },
      { name: 'Make-up',                       slug: 'make-up',                       amwayCode: 'Make-up' },
      { name: 'Personalised Beauty Solutions', slug: 'personalised-beauty-solutions', amwayCode: 'PersonalisedBeautySolutionsForYou' },
      { name: 'Accessories',                   slug: 'accessories-beauty',            amwayCode: 'AccessoriesBeauty' },
    ],
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    subcategories: [
      { name: 'Hair Care',   slug: 'hair-care',  amwayCode: 'HairCare' },
      { name: 'Body Care',   slug: 'bath-body',  amwayCode: '10054' },
      { name: 'Oral Care',   slug: 'oral-care',  amwayCode: 'OralCare' },
    ],
  },
  {
    name: 'Nutrition',
    slug: 'nutrition',
    subcategories: [
      { name: 'Targeted Food Supplements',     slug: 'targeted-food-supplements',     amwayCode: 'TargetedFoodSupplements' },
      { name: 'Foundational Food Supplements', slug: 'foundational-food-supplements', amwayCode: 'FoundationalFoodSupplements' },
      { name: 'Weight Management',             slug: 'weight-management',             amwayCode: 'WeightManagement' },
      { name: 'Personalised Solutions',        slug: 'personalised-solutions-for-you',amwayCode: 'PersonalisedSolutionsForYou' },
      { name: 'Food & Beverages',              slug: 'food-beverages',                amwayCode: 'FoodBeverages' },
      { name: 'Sports Nutrition',              slug: 'sports-nutrition',              amwayCode: 'SportNutrition' },
      { name: 'Active Lifestyle',              slug: 'active-lifestyle',              amwayCode: 'ActiveLifestyle' },
      { name: 'Accessories',                   slug: 'accessories-nutrition',         amwayCode: 'AccessoriesNutrition' },
    ],
  },
  {
    name: 'Home',
    slug: 'home',
    subcategories: [
      { name: 'Laundry Care',             slug: 'laundry-care',              amwayCode: 'LaundryCare' },
      { name: 'Surface Care',             slug: 'surface-care',              amwayCode: 'SurfaceCare' },
      { name: 'Dish Care',                slug: 'dish-care',                 amwayCode: 'DishCare' },
      { name: 'Speciality Cleaning',      slug: 'speciality-cleaning',       amwayCode: 'SpecialityCleaning' },
      { name: 'Dispensers & Applicators', slug: 'dispensers-and-applicators',amwayCode: 'DispensersAndApplicators' },
      { name: 'Cookware & Cutlery',       slug: 'cookware',                  amwayCode: 'CookwareAndCutlery' },
      { name: 'Water Treatment System',   slug: 'water-treatment',           amwayCode: 'WaterTreatmentSystem' },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategoryBySlug(categorySlug: string, subSlug: string): Subcategory | undefined {
  return getCategoryBySlug(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
}

export const ALL_AMWAY_CODES = CATEGORIES.flatMap((c) => c.subcategories.map((s) => s.amwayCode));
