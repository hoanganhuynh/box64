export interface Review {
  name: string
  city: string
  stars: number
  quote: string
}

export const REVIEWS: Review[] = [
  {
    name: 'Minh T.',
    city: 'Hanoi',
    stars: 5,
    quote: 'Better than expected. Print is razor-sharp, colours matched my source image perfectly. Already planning my next order for the Porsche collection.',
  },
  {
    name: 'Hung P.',
    city: 'Ho Chi Minh City',
    stars: 5,
    quote: 'Thick, rigid stock — no warping or bent corners in storage. Easy recommendation for any serious collector.',
  },
  {
    name: 'Long N.',
    city: 'Da Nang',
    stars: 5,
    quote: 'Packed with care, arrived in perfect condition. The team was super helpful when I needed last-minute design tweaks.',
  },
  {
    name: 'Quan L.',
    city: 'Hanoi',
    stars: 5,
    quote: 'Ordered a box for my LB Works GT-R — print came out absolutely outstanding. Every cent well spent.',
  },
  {
    name: 'Tung H.',
    city: 'Binh Duong',
    stars: 5,
    quote: 'First time ordering a custom box — the team walked me through every step. Colours accurate, details crisp.',
  },
  {
    name: 'Khanh V.',
    city: 'Hai Phong',
    stars: 5,
    quote: 'Third order already, zero complaints. Consistent quality every single time, always ships on schedule.',
  },
  {
    name: 'Nam T.',
    city: 'Can Tho',
    stars: 5,
    quote: "Had a box made from a friend's car photo as a gift — everyone loved it. Best present for any model car fan.",
  },
  {
    name: 'Bao H.',
    city: 'Hanoi',
    stars: 5,
    quote: 'Thick, stiff paper, no sagging. Fold lines are sharp and true. Clearly handmade with a high standard of craft.',
  },
  {
    name: 'Son P.',
    city: 'Ho Chi Minh City',
    stars: 5,
    quote: "Colours pop, finish is immaculate. As a designer I can tell they handled the artwork carefully — not a detail out of place.",
  },
  {
    name: 'Duc N.',
    city: 'Vung Tau',
    stars: 5,
    quote: 'Fast delivery, packed safely. Opening it felt like unboxing a luxury product. Will definitely order again.',
  },
]

/** Returns 4 reviews offset by the product's slug so each product shows different reviews. */
export function getProductReviews(slug: string): Review[] {
  const offset = slug.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % (REVIEWS.length - 3)
  return [...REVIEWS, ...REVIEWS].slice(offset, offset + 4)
}
