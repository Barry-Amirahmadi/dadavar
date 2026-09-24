import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publishedProducts, products } from "@/content/products";
import { relatedProducts } from "@/content/relatedProducts";
import { productSchema } from "@/content/schema";
import { pageMetadata } from "@/lib/seo";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductDetails } from "@/components/products/ProductDetails";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Product detail.
 *
 * Three movements, each on a different ground, in the rhythm the homepage
 * established: the product itself on the dark ground under its own shade, the
 * reading on the light ground, the way onward back on the dark.
 *
 * What it does *not* have is as deliberate as what it does. No price, no
 * variants, no stock state, no specification table of invented attributes, no
 * reviews — none of that exists in the content model, and a portfolio piece
 * that fabricates product data to look complete is making exactly the mistake
 * §44.1 is about. Every field on the page is one the brand actually supplied.
 */
export function generateStaticParams() {
  return publishedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  return pageMetadata({
    title: product.seo?.title ?? product.name,
    /**
     * Statement *and* description, not one or the other. Either alone is about
     * fifty characters — a search snippet gets truncated at roughly a hundred
     * and sixty, and both sentences together are what the brand already says
     * about the product, so this reads as a description rather than a fragment.
     * Nothing is composed that the copy deck does not contain.
     */
    description:
      product.seo?.description ??
      [product.statement, product.description].filter(Boolean).join(" "),
    path: `/products/${product.slug}/`,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = publishedProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = relatedProducts(product, publishedProducts);

  return (
    <>
      <ProductHero product={product} />
      <ProductDetails product={product} />
      <RelatedProducts products={related} />
      {/* The product-specific inquiry is in the hero; this is the general
          consultation. Its secondary link points at the collection, which the
          breadcrumb and the hero already offer from here. */}
      <CtaSection secondary={null} />

      {/* Product structured data. Deliberately carries no `offers` — see
          src/content/schema.ts for what is left out and why. */}
      <JsonLd data={productSchema(product)} />
    </>
  );
}
