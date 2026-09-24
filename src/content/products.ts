import type { Product } from "@/types/content";
import { resolveProducts } from "./resolveProducts";

/**
 * PLACEHOLDER CONTENT — Phase 01.
 *
 * Products are named with abstract Persian words and generic format labels
 * (سرم، کرم، روغن) on purpose: no ingredient, benefit, certification or
 * result is asserted anywhere, because none has been supplied. Descriptions
 * describe *when you use it*, which is neutral and safe to show a client.
 *
 * `tone` is the one field doing design work — it is the product's own shade,
 * and it drives the ambient wash behind the showcase section. All five seed
 * products set it, and `layout`, explicitly; both are optional in the type so
 * a CMS editor can omit them, and resolveProducts() fills the gap.
 *
 * **Catalogue images share one ratio — `4/5` — and only the `feature` product
 * departs from it.** They started at four different ratios, which was read as
 * the images being mismatched rather than as editorial variety, and the reading
 * was right: a frame that changes per product means the product changes size
 * inside it, and nothing anchors the eye. Product photography is shot to a
 * single standard in practice, so a template that demands four ratios would
 * force a client to crop one consistent set of photographs four different ways.
 * Variety belongs to how much of the row a product takes, not to the shape of
 * its frame. The placeholder files under `public/media/` were normalised onto
 * one 1000×1250 canvas with one subject geometry to match; each keeps only its
 * own tone and grain seed.
 */
export const products: Product[] = [
  {
    id: "p-shab",
    slug: "shab",
    name: "سرم شب",
    latin: "SHAB",
    category: "سرم",
    description: "در پایان روز، روی پوست تمیز. آخرین مرحلهٔ روتین شب.",
    statement: "شب، وقتی کار دیگری جز خوابیدن نمانده است.",
    body: [
      "سرم شب آخرین چیزی است که روی پوست می‌نشیند. به همین دلیل کوتاه نوشته شد: هر چه قرار بود اضافه شود، جای دیگری در روتین حذف شد.",
      "برای ساعتی انتخاب شده که عجله‌ای در کار نیست. اگر صبح‌ها وقت کم می‌آورید، این محصول برای آن ساعت ساخته نشده است.",
    ],
    details: [
      { label: "زمان استفاده", value: "شب" },
      { label: "جایگاه در روتین", value: "آخرین مرحله" },
      { label: "روش استفاده", value: "روی پوست تمیز" },
    ],
    tone: "#3E4C6B",
    image: {
      src: "/media/product-shab.svg",
      alt: "سرم شب پرنیان، در نور کم روی سطحی تیره",
      ratio: "4/5",
    },
    layout: "tall",
    status: "published",
  },
  {
    id: "p-rooz",
    slug: "rooz",
    name: "کرم روز",
    latin: "ROOZ",
    category: "مرطوب‌کننده",
    description: "صبح، پیش از ضدآفتاب. بافت سبک برای استفادهٔ هر روز.",
    statement: "لایه‌ای که قرار است زیر بقیهٔ روز پنهان بماند.",
    body: [
      "کرم روز طوری نوشته شد که بتوان بعد از آن ادامه داد — ضدآفتاب، و هر چه معمولاً بعدش می‌آید.",
      "بافت سبک از سر سلیقه انتخاب نشده است؛ هر چیز سنگین‌تری مرحلهٔ بعدی را خراب می‌کند.",
    ],
    details: [
      { label: "زمان استفاده", value: "صبح" },
      { label: "جایگاه در روتین", value: "پیش از ضدآفتاب" },
      { label: "بافت", value: "سبک" },
    ],
    tone: "#B9C4BD",
    image: {
      src: "/media/product-rooz.svg",
      alt: "کرم روز پرنیان، نور طبیعی از سمت راست",
      ratio: "4/5",
    },
    layout: "wide",
    status: "published",
  },
  {
    id: "p-narm",
    slug: "narm",
    name: "روغن صورت نرم",
    latin: "NARM",
    category: "روغن",
    description: "چند قطره، صبح یا شب. می‌توان با کرم ترکیب کرد.",
    statement: "چند قطره، نه بیشتر.",
    body: [
      "روغن صورت آخرین جایی است که زیاده‌روی به چشم می‌آید. مقدارش را کم نگه داشتیم و همین را روی بسته هم نوشتیم.",
      "می‌توان تنها استفاده کرد یا با کرم ترکیب کرد؛ هر دو حالت از ابتدا در نظر بوده است.",
    ],
    details: [
      { label: "زمان استفاده", value: "صبح یا شب" },
      { label: "مقدار", value: "چند قطره" },
      { label: "ترکیب", value: "می‌توان با کرم استفاده کرد" },
    ],
    tone: "#C99A5B",
    image: {
      src: "/media/product-narm.svg",
      alt: "شیشهٔ روغن صورت نرم، بازتاب نور روی جدارهٔ شیشه",
      ratio: "4/5",
    },
    layout: "tall",
    status: "published",
  },
  {
    id: "p-aghaz",
    slug: "aghaz",
    name: "پاک‌کنندهٔ آغاز",
    latin: "AGHAZ",
    category: "پاک‌کننده",
    description: "مرحلهٔ اول روتین. صبح و شب، روی پوست مرطوب.",
    statement: "هر روتینی از اینجا شروع می‌شود.",
    body: [
      "پاک‌کننده اولین مرحله است و بیشترین تعداد دفعات استفاده را دارد. به همین دلیل ساده‌ترین محصول مجموعه هم هست.",
      "روی پوست مرطوب استفاده می‌شود، صبح و شب. بیش از این چیزی لازم نیست بدانید.",
    ],
    details: [
      { label: "زمان استفاده", value: "صبح و شب" },
      { label: "جایگاه در روتین", value: "مرحلهٔ اول" },
      { label: "روش استفاده", value: "روی پوست مرطوب" },
    ],
    tone: "#7FA3A0",
    image: {
      src: "/media/product-aghaz.svg",
      alt: "پاک‌کنندهٔ آغاز، پس‌زمینهٔ تیره",
      ratio: "4/5",
    },
    layout: "compact",
    status: "published",
  },
  {
    id: "p-aram",
    slug: "aram",
    name: "تونیک آرام",
    latin: "ARAM",
    category: "تونیک",
    description: "پس از پاک‌کننده و پیش از سرم. با پنبه یا کف دست.",
    statement: "فاصلهٔ میان پاک‌کننده و سرم.",
    body: [
      "تونیک در بیشتر روتین‌ها اولین چیزی است که حذف می‌شود. آرام برای همان مرحله نوشته شد تا حذف‌کردنش تصمیم شما باشد، نه نتیجهٔ بی‌دقتی ما.",
      "با پنبه یا کف دست، هر کدام که عادت شماست.",
    ],
    // No «زمان استفاده» row: the copy for this product never stated one, and a
    // table that is uniformly filled is a table with invented rows in it.
    details: [
      { label: "جایگاه در روتین", value: "پس از پاک‌کننده، پیش از سرم" },
      { label: "روش استفاده", value: "با پنبه یا کف دست" },
    ],
    tone: "#9D8FA8",
    image: {
      src: "/media/product-aram.svg",
      alt: "تونیک آرام در قاب عریض، نور نرم و سایهٔ بلند",
      ratio: "8/5",
    },
    layout: "feature",
    status: "published",
  },
];

/**
 * What the showcase renders: drafts filtered out, exactly as a CMS would, then
 * resolved so every product has a `tone` and a `layout`.
 *
 * Filter before resolve, never after — the `layout` fallback is positional, so
 * resolving a list that still contains drafts would shift the arrangements of
 * everything after the first hidden product.
 */
export const publishedProducts = resolveProducts(
  products.filter((p) => p.status === "published"),
);
