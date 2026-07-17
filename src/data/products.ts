// /src/data/products.ts
import deskLampImg from "@/assets/desk-lamp.png";

// Crystal PNG frames (transparent background)
import crystalDiamond     from "@/assets/crystals/crystal-diamond.png";
import crystalGemHeart    from "@/assets/crystals/crystal-gem-heart.png";
import crystalGemRectangle from "@/assets/crystals/crystal-gem-rectangle.png";
import crystalHeart       from "@/assets/crystals/crystal-heart.png";
import crystalIceberg     from "@/assets/crystals/crystal-iceberg.png";
import crystalRectangle   from "@/assets/crystals/crystal-rectangle.png";
import crystalSquare      from "@/assets/crystals/crystal-square.png";

import c1 from "@/assets/3D_Crystals_1.avif";
import c2 from "@/assets/3D_Crystals_2.avif";
import c3 from "@/assets/3D_Crystals_3.avif";
import c4 from "@/assets/3D_Crystals_4.avif";
import c5 from "@/assets/3D_Crystals_5.avif";
import c6 from "@/assets/3D_Crystals_6.avif";


import pHeart  from "@/assets/product-rotating-heart.webp";
import pSilver from "@/assets/product-lightbase-silver-heart.webp";
import pKey    from "@/assets/product-keychain.webp";
import pWood   from "@/assets/product-wooden-premium.webp";
import incBg   from "@/assets/include-bg.webp";
import heartKey1       from "@/assets/heart-keychain-1.webp";
import ornamentStandImg from "@/assets/ornament-stand.png";

/* ─────────────────────────────── types ─────────────────────────────── */

export type Size = {
  id: string;
  label: string;
  people: string;
  dimensions: string;
  price: number;
};

export type ShapeProduct = {
  id: string;
  name: string;
  image: string;
  badge?: string;
};

export type Shape = {
  id: string;
  label: string;
  thumbImage: string;
  previewImage: string;
  crystalFramePng: string;
  crystalAspect: number; // width/height ratio of the crystal PNG
  sizes: Size[];
  products: ShapeProduct[];
};

/* ─────────────────────────────── shapes ─────────────────────────────── */

export const shapes: Shape[] = [
  /* ── Rectangle Tall ── */
  {
    id: "rectangle-tall",
    label: "Rectangle Tall",
    thumbImage: crystalRectangle,
    previewImage: c1,
    crystalFramePng: crystalRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "rt-1", name: "Classic Portrait Crystal",  image: c1, badge: "Most Popular" },
      { id: "rt-2", name: "Family Memory Crystal",     image: c1 },
      { id: "rt-3", name: "Couple's Keepsake Crystal", image: c1 },
      { id: "rt-4", name: "Individual Portrait Crystal", image: c1 },
      { id: "rt-5", name: "Premium Portrait Crystal",  image: c1 },
    ],
    sizes: [
      { id: "medium",            label: "Medium",            people: "1-2",  dimensions: "3x2x2 / 8x5x5cm",      price: 100 },
      { id: "large",             label: "Large",             people: "1-3",  dimensions: "3.5x2.5x2.5 / 9x6x6cm", price: 170 },
      { id: "extra-large",       label: "Extra Large",       people: "1-4",  dimensions: "4.8x3.2x2.4 / 12x8x6cm",price: 285 },
      { id: "mini-mantel",       label: "Mini Mantel",       people: "1-6",  dimensions: "6x4x2.5 / 15x10x6cm",   price: 325 },
      { id: "mantel",            label: "Mantel",            people: "1-8",  dimensions: "7.1x4.8x3.2 / 18x12x8cm",price: 375 },
      { id: "mini-presidential", label: "Mini Presidential", people: "1-10", dimensions: "8.7x6.3x3.2 / 22x16x8cm",price: 595 },
    ],
  },

  /* ── Rectangle Wide ── */
  {
    id: "rectangle-wide",
    label: "Rectangle Wide",
    thumbImage: crystalGemRectangle,
    previewImage: c2,
    crystalFramePng: crystalGemRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "rw-1", name: "Wide Rectangle Crystal",   image: c2, badge: "Bestseller" },
      { id: "rw-2", name: "Landscape Memory Crystal", image: c2 },
      { id: "rw-3", name: "Family Panorama Crystal",  image: c2 },
      { id: "rw-4", name: "Wide Format Crystal",      image: c2 },
    ],
    sizes: [
      { id: "medium",             label: "Medium",             people: "1-2",  dimensions: "3x2x2 / 8x5x5cm",       price: 100 },
      { id: "large",              label: "Large",              people: "1-3",  dimensions: "3.5x2.5x2.5 / 9x6x6cm",  price: 170 },
      { id: "extra-large",        label: "Extra Large",        people: "1-4",  dimensions: "4.8x3.2x2.4 / 12x8x6cm", price: 285 },
      { id: "mini-mantel",        label: "Mini Mantel",        people: "1-6",  dimensions: "6x4x2.5 / 15x10x6cm",    price: 325 },
      { id: "mantel",             label: "Mantel",             people: "1-8",  dimensions: "7.1x4.8x3.2 / 18x12x8cm",price: 375 },
      { id: "mini-presidential",  label: "Mini Presidential",  people: "1-10", dimensions: "8.7x6.3x3.2 / 22x16x8cm",price: 595 },
      { id: "large-presidential", label: "Large Presidential", people: "1-12", dimensions: "10.7x7x3.2 / 27x18x8cm", price: 1000 },
    ],
  },

  /* ── Heart ── */
  {
    id: "heart",
    label: "Heart",
    thumbImage: crystalHeart,
    previewImage: pHeart,
    crystalFramePng: crystalHeart,
    crystalAspect: 1.04,
    products: [
      { id: "h-1", name: "Wedding Heart Crystal",  image: pHeart,  badge: "Top Gift" },
      { id: "h-2", name: "Heart with Silver Base", image: pSilver },
      { id: "h-3", name: "Romantic Heart Gift",    image: pHeart },
      { id: "h-4", name: "Heart Anniversary Crystal", image: pSilver },
    ],
    sizes: [
      { id: "small",  label: "Small",  people: "1-2", dimensions: "3.2x2.8x1.6 / 8x7x4cm",  price: 89  },
      { id: "medium", label: "Medium", people: "1-3", dimensions: "4x3.5x2.4 / 10x9x5cm",    price: 155 },
      { id: "large",  label: "Large",  people: "1-8", dimensions: "5x4.3x2.4 / 13x11x5cm",   price: 205 },
    ],
  },

  /* ── Prestige ── */
  {
    id: "prestige",
    label: "Prestige",
    thumbImage: crystalSquare,
    previewImage: c4,
    crystalFramePng: crystalSquare,
    crystalAspect: 1.0,
    products: [
      { id: "pr-1", name: "Prestige Beveled Crystal", image: c4,   badge: "Premium" },
      { id: "pr-2", name: "Prestige with Wood Base",  image: pWood },
      { id: "pr-3", name: "Prestige Crystal Gift Set", image: c4 },
    ],
    sizes: [
      { id: "small",  label: "Small",  people: "1-2", dimensions: "5x4.3x2.4 / 13x11x6cm",   price: 225 },
      { id: "medium", label: "Medium", people: "1-3", dimensions: "6.8x5.3x2.4 / 17x14x6cm",  price: 295 },
      { id: "large",  label: "Large",  people: "1-8", dimensions: "8x6x2.4 / 20x16x6cm",      price: 375 },
    ],
  },

  /* ── Ball ── */
  {
    id: "ball",
    label: "Ball",
    thumbImage: crystalDiamond,
    previewImage: c6,
    crystalFramePng: crystalDiamond,
    crystalAspect: 1.0,
    products: [
      { id: "bl-1", name: "Optical Ball Crystal", image: c6 },
    ],
    sizes: [
      { id: "small", label: "Small", people: "1", dimensions: "8cm", price: 155 },
    ],
  },

  /* ── Cut Corner Diamond ── */
  {
    id: "cut-corner-diamond",
    label: "Cut Corner Diamond",
    thumbImage: crystalDiamond,
    previewImage: c3,
    crystalFramePng: crystalDiamond,
    crystalAspect: 1.0,
    products: [
      { id: "cd-1", name: "Diamond Cut Crystal", image: c3, badge: "Great Value" },
    ],
    sizes: [
      { id: "small",  label: "Small",  people: "1",   dimensions: "2x2x2 / 5x5x5cm",      price: 65  },
      { id: "medium", label: "Medium", people: "1-3", dimensions: "2.4x2.4x2.4 / 6x6x6cm", price: 100 },
      { id: "large",  label: "Large",  people: "1-6", dimensions: "3x3x3 / 8x8x8cm",       price: 125 },
    ],
  },

  /* ── Vertical Keychain ── */
  {
    id: "vertical-keychain",
    label: "Vertical Keychain",
    thumbImage: crystalRectangle,
    previewImage: pKey,
    crystalFramePng: crystalRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "vk-1", name: "Vertical Crystal Keychain", image: pKey,   badge: "Gift Idea" },
      { id: "vk-2", name: "Mini Portrait Keychain",    image: heartKey1 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "1.2x0.8x0.6 / 3x2x1.5cm", price: 40 },
    ],
  },

  /* ── Horizontal Keychain ── */
  {
    id: "horizontal-keychain",
    label: "Horizontal Keychain",
    thumbImage: crystalGemRectangle,
    previewImage: pKey,
    crystalFramePng: crystalGemRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "hk-1", name: "Horizontal Crystal Keychain", image: pKey      },
      { id: "hk-2", name: "Landscape Keychain Crystal",  image: heartKey1 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "1.2x0.8x0.6 / 3x2x1.5cm", price: 40 },
    ],
  },

  /* ── Heart Keychain ── */
  {
    id: "heart-keychain",
    label: "Heart Keychain",
    thumbImage: crystalGemHeart,
    previewImage: heartKey1,
    crystalFramePng: crystalGemHeart,
    crystalAspect: 1.0,
    products: [
      { id: "hck-1", name: "Heart Crystal Keychain", image: heartKey1, badge: "Gift Idea" },
      { id: "hck-2", name: "Mini Heart Keychain",    image: pKey },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "3.5x3.5x1.2cm", price: 40 },
    ],
  },

  /* ── Heart Necklace ── */
  {
    id: "heart-necklace",
    label: "Heart Necklace",
    thumbImage: crystalGemHeart,
    previewImage: pSilver,
    crystalFramePng: crystalGemHeart,
    crystalAspect: 1.0,
    products: [
      { id: "hn-1", name: "Heart Necklace Pendant",  image: heartKey1 },
      { id: "hn-2", name: "Silver Heart Necklace",   image: pSilver },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "1.4x1.4x0.3 / 3.5x3.5x0.8cm", price: 55 },
    ],
  },

  /* ── Ornament ── */
  {
    id: "ornament",
    label: "Ornament",
    thumbImage: crystalSquare,
    previewImage: c5,
    crystalFramePng: crystalSquare,
    crystalAspect: 1.0,
    products: [
      { id: "or-1", name: "Holiday Ornament Crystal", image: c5, badge: "Seasonal" },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-5", dimensions: "3x3 / 8x8cm", price: 100 },
    ],
  },

  /* ── Candle ── */
  {
    id: "candle",
    label: "Candle",
    thumbImage: crystalIceberg,
    previewImage: c6,
    crystalFramePng: crystalIceberg,
    crystalAspect: 0.73,
    products: [
      { id: "ca-1", name: "Candle Crystal", image: c6 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "4x2.4x2.4 / 10x6x6cm", price: 170 },
    ],
  },

  /* ── Urn ── */
  {
    id: "urn",
    label: "Urn / Candles",
    thumbImage: crystalIceberg,
    previewImage: c4,
    crystalFramePng: crystalIceberg,
    crystalAspect: 0.73,
    products: [
      { id: "ur-1", name: "Memorial Urn Crystal", image: c4 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-6", dimensions: "6x5x2.5 / 15x12x6cm", price: 195 },
    ],
  },

  /* ── Notched Tall ── */
  {
    id: "notched-tall",
    label: "Notched Tall",
    thumbImage: crystalRectangle,
    previewImage: c1,
    crystalFramePng: crystalRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "nt-1", name: "Notched Tall Crystal", image: c1 },
    ],
    sizes: [
      { id: "small",  label: "Small",  people: "1-4", dimensions: "6x4 / 15x10cm", price: 200 },
      { id: "medium", label: "Medium", people: "1-8", dimensions: "7x5 / 18x13cm", price: 225 },
    ],
  },

  /* ── Notched Wide ── */
  {
    id: "notched-wide",
    label: "Notched Wide",
    thumbImage: crystalGemRectangle,
    previewImage: c2,
    crystalFramePng: crystalGemRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "nw-1", name: "Notched Wide Crystal",  image: c2 },
    ],
    sizes: [
      { id: "small",  label: "Small",  people: "1-4", dimensions: "6x5 / 15x10cm", price: 200 },
      { id: "medium", label: "Medium", people: "1-8", dimensions: "7x5 / 18x13cm", price: 225 },
    ],
  },

  /* ── Dog Bone Vertical ── */
  {
    id: "dog-bone-vertical",
    label: "Dog Bone Vertical",
    thumbImage: crystalIceberg,
    previewImage: c1,
    crystalFramePng: crystalIceberg,
    crystalAspect: 0.73,
    products: [
      { id: "dbv-1", name: "Dog Bone Crystal (Vertical)", image: c1 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "6x4 / 15x10cm", price: 205 },
    ],
  },

  /* ── Dog Bone Horizontal ── */
  {
    id: "dog-bone-horizontal",
    label: "Dog Bone Horizontal",
    thumbImage: crystalGemRectangle,
    previewImage: c2,
    crystalFramePng: crystalGemRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "dbh-1", name: "Dog Bone Crystal (Horizontal)", image: c2 },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "6x4 / 15x10cm", price: 205 },
    ],
  },

  /* ── Desk Lamp ── */
  {
    id: "desk-lamp",
    label: "Desk Lamp",
    thumbImage: crystalRectangle,
    previewImage: deskLampImg,
    crystalFramePng: crystalRectangle,
    crystalAspect: 0.68,
    products: [
      { id: "dl-1", name: "Crystal Desk Lamp", image: pWood },
    ],
    sizes: [
      { id: "one-size", label: "One Size", people: "1-4", dimensions: "9.4x4.5 / 24x11cm", price: 250 },
    ],
  },
];

/* ─────────────────────────────── addons ─────────────────────────────── */

export type Addon = {
  id: string;
  label: string;
  image: string;
  price: number;
  hasQty: boolean;
};

export const addons: Addon[] = [
  { id: "include-bg",          label: "Include Background That's in Original Photo", image: incBg,            price: 20, hasQty: false },
  { id: "heart-keychain",      label: "Add Heart Keychain",                          image: heartKey1,        price: 25, hasQty: true  },
  { id: "rectangle-keychain",  label: "Add Rectangle Keychain",                     image: pKey,             price: 25, hasQty: true  },
  { id: "ornament-stand",      label: "Ornament Stand",                             image: ornamentStandImg, price: 25, hasQty: true  },
  { id: "concave-lightbase",   label: "Concave Lightbase",                          image: pSilver,          price: 28, hasQty: true  },
  { id: "lightbase-rectangle", label: "Lightbase Rectangle",                        image: pSilver,          price: 24, hasQty: true  },
  { id: "wooden-premium-mini", label: "Wooden Premium Base Mini",                   image: pWood,            price: 45, hasQty: true  },
  { id: "wooden-premium-small",label: "Wooden Premium Base Small",                  image: pWood,            price: 35, hasQty: true  },
  { id: "lightbase-wood-long", label: "Lightbase Wood Long",                        image: pWood,            price: 60, hasQty: true  },
  { id: "wooden-premium-medium",label: "Wooden Premium Base Medium",                image: pWood,            price: 40, hasQty: true  },
  { id: "lightbase-square",    label: "Lightbase Square",                           image: pSilver,          price: 45, hasQty: true  },
  { id: "rotating-lightbase",  label: "Rotating Light Base",                        image: pHeart,           price: 25, hasQty: true  },
];
