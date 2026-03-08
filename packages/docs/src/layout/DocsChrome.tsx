import { Outlet } from 'react-router-dom';

export default function DocsChrome() {
  return (
    <div className="docs-site">
      <nav className="docs-product-nav" aria-label="Documentation">
        <span className="docs-product-brand">aleatoric</span>
        <a
          className="docs-product-nav-playground"
          href={`${import.meta.env.BASE_URL}playground.html`}
        >
          Tone playground
        </a>
      </nav>
      <div className="docs-site-outlet">
        <Outlet />
      </div>
    </div>
  );
}
