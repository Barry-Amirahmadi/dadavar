import type { GalleryItem } from "@/types/content";

/**
 * PLACEHOLDER CONTENT — Phase 01.
 * `category` is the axis a future gallery filter will use, so the values are
 * kept to a small controlled vocabulary rather than free text.
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "g-01",
    title: "بافت کرم روز",
    category: "بافت",
    caption: "نور طبیعی، اواخر صبح",
    image: { src: "/media/gallery-01.svg", alt: "نمای نزدیک از بافت کرم روز", ratio: "4/5" },
    order: 1,
  },
  {
    id: "g-02",
    title: "درپوش شیشه",
    category: "بسته‌بندی",
    image: { src: "/media/gallery-02.svg", alt: "جزئیات درپوش شیشهٔ محصول", ratio: "4/5" },
    order: 2,
  },
  {
    id: "g-03",
    title: "سرم شب",
    category: "محصول",
    caption: "پس‌زمینهٔ سرمه‌ای",
    image: { src: "/media/gallery-03.svg", alt: "بستهٔ سرم شب روی سطح تیره", ratio: "4/5" },
    order: 3,
  },
  {
    id: "g-04",
    title: "میز کار، صبح",
    category: "فضا",
    image: { src: "/media/gallery-04.svg", alt: "گوشه‌ای از میز کار در نور صبح", ratio: "4/5" },
    order: 4,
  },
  {
    id: "g-05",
    title: "روغن روی پوست",
    category: "بافت",
    caption: "بدون اصلاح رنگ",
    image: { src: "/media/gallery-05.svg", alt: "قطرهٔ روغن روی سطح پوست", ratio: "4/5" },
    order: 5,
  },
  {
    id: "g-06",
    title: "مجموعهٔ کامل",
    category: "محصول",
    image: { src: "/media/gallery-06.svg", alt: "همهٔ محصولات مجموعه کنار هم", ratio: "4/5" },
    order: 6,
  },
];

export const sortedGallery = [...galleryItems].sort((a, b) => a.order - b.order);
