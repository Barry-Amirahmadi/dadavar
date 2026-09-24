import type { CategoryEntry } from "@/content/categories";
import { collection } from "@/content/sections";
import { toFa } from "@/lib/digits";

interface CategoryIndexProps {
  categories: CategoryEntry[];
  total: number;
}

/**
 * The collection's contents line.
 *
 * This is the "light structure" the category field earns at this catalog size
 * (MASTER-HANDOFF §40): a hairline index that says what is in the collection
 * and jumps to it — the opening page of a magazine, not a filter rail. A chip
 * row with active states, result counts and an empty state would be a filtering
 * interface built for five products, where every filter returns one of them.
 *
 * It is a `<nav>` because that is what it is: a list of links into this
 * document. When the catalog grows the same markup keeps working, and the
 * decision about whether it should *become* a filter can be made then, on real
 * numbers.
 */
export function CategoryIndex({ categories, total }: CategoryIndexProps) {
  return (
    <div className="collection-index plane-raised">
      <nav aria-label={collection.indexLabel}>
        <ul className="collection-index__list">
          {categories.map((category) => (
            <li key={category.name}>
              <a href={`#${category.anchor}`} className="collection-index__link">
                <span>{category.name}</span>
                {/* The count appears only once it carries information. With one
                    product per category it would print a column of «۱»s that
                    reads as a rendering fault rather than as data. */}
                {category.count > 1 ? (
                  <span className="collection-index__count">{toFa(category.count)}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="t-meta">
        {toFa(total)} {collection.countLabel}
      </p>
    </div>
  );
}
