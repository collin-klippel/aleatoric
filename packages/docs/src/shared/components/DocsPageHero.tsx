import type { ReactNode } from 'react';

type DocsPageHeroProps = {
  id?: string;
  className?: string;
  title: string;
  children: ReactNode;
};

export default function DocsPageHero({
  id,
  className,
  title,
  children,
}: DocsPageHeroProps) {
  const rootClass = ['docs-page-hero', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={rootClass}>
      <h1>{title}</h1>
      {children}
    </section>
  );
}
