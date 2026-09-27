import type { MediaAsset } from "@/types/content";

/**
 * The six plates — the whole image budget of the site.
 *
 * Six rather than the twenty-odd of a sibling template is a decision, not a
 * shortage: on a reading site an image interrupts the column and has to earn
 * its place. None contains a person, a face, a hand or a silhouette — a
 * fictional firm with a photographed lawyer is the one picture that would make
 * the whole site read as a claim.
 *
 * Each `src` is the exact path and ratio the real photograph will use, so the
 * swap is a file replacement with no edit here. `alt` describes that intended
 * photograph; the placeholders from `scripts/generate-media.mjs` are tonal
 * studies of the same composition.
 */
const landscape = { ratio: "3/2", width: 1536, height: 1024 } as const;
const square = { ratio: "1/1", width: 1024, height: 1024 } as const;

export const media = {
  meetingRoom: {
    ...landscape,
    src: "/media/o-01.jpg",
    alt: "میزی بلند و خالی کنار پنجره‌ای بلند، با صندلی‌هایی که مرتب زیر آن جا گرفته‌اند",
    caption: "اتاق جلسه، پیش از آغاز.",
  },
  shelves: {
    ...landscape,
    src: "/media/o-02.jpg",
    alt: "دیواری از قفسه‌های چوبی تیره، پر از مجلدهای صحافی‌شده‌ی بی‌نشان",
    caption: "مجلدها، بی‌نام و به ترتیب.",
  },
  stairwell: {
    ...landscape,
    src: "/media/o-03.jpg",
    alt: "راه‌پله‌ای سنگی و خالی با نرده، و نوری که از بالا بر پله‌ها می‌تابد",
    caption: "ساختار، پیش از هر چیز دیگر.",
  },
  corridor: {
    ...landscape,
    src: "/media/o-04.jpg",
    alt: "راهرویی با درهای بسته‌ی قاب‌دار که در دوردست کوچک و کوچک‌تر می‌شوند",
    caption: "درها، هر کدام به اتاقی دیگر.",
  },
  paper: {
    ...square,
    src: "/media/d-01.jpg",
    alt: "نمای نزدیک از بالا: دسته‌ای کاغذ سفید و یک پوشه‌ی بسته روی میز",
    caption: "کاغذ، پیش از آنکه متن شود.",
  },
  table: {
    ...square,
    src: "/media/d-02.jpg",
    alt: "یک لیوان آب و یک خودکار دربسته روی سطحی خالی",
    caption: "میز، پیش از رسیدگی.",
  },
} satisfies Record<string, MediaAsset>;
