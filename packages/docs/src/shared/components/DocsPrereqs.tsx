type DocsPrereqItem = {
  label: string;
  href: string;
};

type DocsPrereqsProps = {
  items: DocsPrereqItem[];
};

export default function DocsPrereqs({ items }: DocsPrereqsProps) {
  if (!items.length) return null;
  return (
    <div className="docs-prereqs">
      <span className="docs-prereqs-label">Builds on</span>
      {items.map(({ label, href }) => (
        <a key={href} href={href} className="docs-prereq-chip">
          {label}
          <span className="docs-prereq-chip-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}
