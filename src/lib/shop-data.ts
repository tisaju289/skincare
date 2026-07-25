export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  old: number;
  tag: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  color: string;
};

export type Category = {
  slug: string;
  name: string;
  color: string;
  image: string;
};

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const categories: Category[] = [
  { slug: "makeup", name: "Makeup", color: "from-pink-400 to-rose-500", image: u("1522337360788-8b13dee7a37e") },
  { slug: "skin", name: "Skin", color: "from-fuchsia-400 to-pink-500", image: u("1596462502278-27bfdc403348") },
  { slug: "hair", name: "Hair", color: "from-purple-400 to-fuchsia-500", image: u("1631730359585-38a4935cbec4") },
  { slug: "personal-care", name: "Personal care", color: "from-rose-400 to-pink-500", image: u("1585386959984-a4155224a1ad") },
  { slug: "mom-baby", name: "Mom & Baby", color: "from-pink-300 to-rose-400", image: u("1519689680058-324335c77eba") },
  { slug: "fragrance", name: "Fragrance", color: "from-violet-400 to-purple-500", image: u("1620916566398-39f1143ab7be") },
];

export const products: Product[] = [
  {
    slug: "lakme-absolute-skin-gloss-foundation",
    name: "Lakme Absolute Skin Gloss Foundation",
    brand: "Lakme", category: "makeup", price: 1650, old: 1950, tag: "-15%",
    rating: 4.6, reviews: 320, color: "bg-rose-50",
    image: u("1583241800698-e8ab01830a07"),
    description: "A luminous liquid foundation for a natural glow finish with buildable coverage.",
  },
  {
    slug: "ponds-bright-beauty-serum-cream",
    name: "Ponds Bright Beauty Serum Cream 50g",
    brand: "Ponds", category: "skin", price: 545, old: 620, tag: "-12%",
    rating: 4.4, reviews: 189, color: "bg-pink-50",
    image: u("1556228578-8c89e6adf883"),
    description: "Hydrating brightening cream infused with 30x vitamins for radiant skin.",
  },
  {
    slug: "maybelline-fit-me-matte-foundation",
    name: "Maybelline Fit Me Matte + Poreless Foundation",
    brand: "Maybelline", category: "makeup", price: 1290, old: 1490, tag: "-13%",
    rating: 4.7, reviews: 512, color: "bg-amber-50",
    image: u("1631214540553-ff044a3ff1d4"),
    description: "Natural matte finish that refines pores for normal-to-oily skin.",
  },
  {
    slug: "the-ordinary-niacinamide-serum",
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary", category: "skin", price: 990, old: 1200, tag: "-17%",
    rating: 4.8, reviews: 890, color: "bg-emerald-50",
    image: u("1608248543803-ba4f8c70ae0b"),
    description: "High-strength vitamin & mineral blemish formula to balance sebum.",
  },
  {
    slug: "loreal-revitalift-hyaluronic-serum",
    name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum",
    brand: "L'Oreal", category: "skin", price: 1890, old: 2200, tag: "-14%",
    rating: 4.5, reviews: 245, color: "bg-fuchsia-50",
    image: u("1571781926291-c477ebfd024b"),
    description: "1.5% pure hyaluronic acid serum that plumps and hydrates for youthful skin.",
  },
  {
    slug: "nivea-soft-light-moisturizer",
    name: "Nivea Soft Light Moisturizer 100ml",
    brand: "Nivea", category: "skin", price: 420, old: 490, tag: "-14%",
    rating: 4.3, reviews: 156, color: "bg-sky-50",
    image: u("1512496015851-a90fb38ba796"),
    description: "Light, fresh moisturizer with jojoba oil and vitamin E.",
  },
  {
    slug: "garnier-micellar-water-pink",
    name: "Garnier Micellar Cleansing Water Pink",
    brand: "Garnier", category: "skin", price: 720, old: 850, tag: "-15%",
    rating: 4.6, reviews: 402, color: "bg-rose-50",
    image: u("1556228453-efd6c1ff04f6"),
    description: "All-in-one cleanser that removes makeup, cleanses & soothes.",
  },
  {
    slug: "lakme-9to5-matte-lipstick",
    name: "Lakme 9 to 5 Primer + Matte Lipstick",
    brand: "Lakme", category: "makeup", price: 640, old: 750, tag: "-14%",
    rating: 4.5, reviews: 278, color: "bg-pink-50",
    image: u("1586495777744-4413f21062fa"),
    description: "Rich matte finish with a built-in primer for long-lasting color.",
  },
  {
    slug: "ombre-iris-flare-perfume",
    name: "Ombre Perfume for Her — Iris Flare 100ml",
    brand: "Ombre", category: "fragrance", price: 850, old: 1050, tag: "-19%",
    rating: 4.4, reviews: 98, color: "bg-amber-50",
    image: u("1541643600914-78b084683601"),
    description: "Floral iris eau de parfum with warm musk base notes.",
  },
  {
    slug: "senora-feather-light-pads",
    name: "Senora Feather Light 08 Pads",
    brand: "Senora", category: "personal-care", price: 149, old: 199, tag: "-25%",
    rating: 4.7, reviews: 634, color: "bg-violet-50",
    image: u("1584362917165-526a968579e8"),
    description: "Ultra-thin sanitary pads with feather-light comfort.",
  },
  {
    slug: "dove-intense-repair-shampoo",
    name: "Dove Intense Repair Shampoo 340ml",
    brand: "Dove", category: "hair", price: 480, old: 550, tag: "-13%",
    rating: 4.5, reviews: 221, color: "bg-sky-50",
    image: u("1522337360788-8b13dee7a37e"),
    description: "Nourishing shampoo that repairs damaged hair from within.",
  },
  {
    slug: "sunsilk-black-shine-conditioner",
    name: "Sunsilk Black Shine Conditioner 320ml",
    brand: "Sunsilk", category: "hair", price: 390, old: 450, tag: "-13%",
    rating: 4.3, reviews: 145, color: "bg-purple-50",
    image: u("1631730359585-38a4935cbec4"),
    description: "Amla-infused conditioner for deep black shine.",
  },
];

export const brands = [
  "Lakme", "Maybelline", "L'Oreal", "Ponds", "Nivea", "Garnier",
  "The Ordinary", "Ombre", "Vaseline", "Dove", "Sunsilk", "Head & Shoulders",
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProductsByCategory = (slug: string) => products.filter((p) => p.category === slug);
