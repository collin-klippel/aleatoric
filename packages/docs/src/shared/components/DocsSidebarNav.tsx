import { type ReactNode, useEffect, useState } from 'react';

type DocsNavSection = {
  href: string;
  label: string;
  desc: string;
  step?: number;
};

type DocsNavGroup = {
  label: string;
  start: number;
  end: number;
};

type DocsSidebarNavProps = {
  logo: string;
  tagline: string;
  sections: DocsNavSection[];
  groups: DocsNavGroup[];
  children?: ReactNode;
};

export default function DocsSidebarNav({
  logo,
  tagline,
  sections,
  groups,
  children,
}: DocsSidebarNavProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observed = document.querySelectorAll('main section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    for (const el of observed) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label={`${logo} documentation`}>
      <div className="logo">{logo}</div>
      <div className="tagline">{tagline}</div>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="group-label">{g.label}</div>
          {sections.slice(g.start, g.end).map(({ href, label, desc, step }) => {
            const isActive = activeId === href.slice(1);
            return (
              <a
                key={href}
                href={href}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="nav-link-label">
                  {step !== undefined && (
                    <span className="nav-link-step">
                      {String(step).padStart(2, '0')}
                    </span>
                  )}
                  {label}
                </span>
                <span className="nav-link-desc">{desc}</span>
              </a>
            );
          })}
        </div>
      ))}
      {children && <div className="nav-sidebar-slot">{children}</div>}
    </nav>
  );
}
