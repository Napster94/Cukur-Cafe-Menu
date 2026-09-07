export type DietaryTag = { id: string; name: string };
export type Allergen = { id: string; name: string };

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  popular: boolean;
  isNew: boolean;
  order: number;
  categoryId: string;
  dietaryTags: DietaryTag[];
  allergens: Allergen[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
  items: MenuItem[];
};

export type CafeSettings = {
  id: number;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  hours: string | null;
  instagram: string | null;
  facebook: string | null;
  currency: string;
};

export type OpeningHours = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string>>;
