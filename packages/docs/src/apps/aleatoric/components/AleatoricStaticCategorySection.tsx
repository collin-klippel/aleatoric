import ApiEntryCard from '@docs-shared/components/ApiEntryCard';
import DocsLinkedText from '@docs-shared/components/DocsLinkedText';
import type { ApiCategory } from '@docs-shared/lib/docs-api-reference-types';
import { CORE_API_CATEGORY_BY_ID } from '../lib/core-api-reference';

function StaticEntryList({ category }: { category: ApiCategory }) {
  return (
    <ul className="docs-api-static-list">
      {category.entries.map((e) => (
        <li key={e.id} className="docs-api-static-entry">
          <ApiEntryCard entry={e} />
        </li>
      ))}
    </ul>
  );
}

type AleatoricStaticCategorySectionProps = {
  categoryId: string;
};

export default function AleatoricStaticCategorySection({
  categoryId,
}: AleatoricStaticCategorySectionProps) {
  const category = CORE_API_CATEGORY_BY_ID[categoryId];
  if (!category) {
    return null;
  }

  return (
    <section id={categoryId} className="docs-static-api-section">
      <h2>{category.label}</h2>
      <div className="card">
        <p className="desc">
          <DocsLinkedText text={category.description} />
        </p>
        <StaticEntryList category={category} />
      </div>
    </section>
  );
}

type AleatoricStaticCategoryInsetProps = {
  categoryId: string;
};

/** Renders API entries inside an existing section (e.g. under an interactive explorer). */
export function AleatoricStaticCategoryInset({
  categoryId,
}: AleatoricStaticCategoryInsetProps) {
  const category = CORE_API_CATEGORY_BY_ID[categoryId];
  if (!category) {
    return null;
  }

  return (
    <div className="docs-static-api-inset">
      <h3 className="docs-static-api-inset-title">API surface</h3>
      <p className="desc">
        <DocsLinkedText text={category.description} />
      </p>
      <StaticEntryList category={category} />
    </div>
  );
}
