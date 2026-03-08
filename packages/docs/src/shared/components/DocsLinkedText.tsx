import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const MD_LINK_RE = /\[([^\]]+)]\(([^)]+)\)/g;

function DocInlineLink({ href, children }: { href: string; children: string }) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return <Link to={href}>{children}</Link>;
}

/** Renders plain text with inline markdown links `[label](href)` as router or external anchors. */
export default function DocsLinkedText({ text }: { text: string }) {
  const segments: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(MD_LINK_RE)) {
    const start = m.index ?? 0;
    if (start > last) {
      segments.push(
        <Fragment key={`t${key++}`}>{text.slice(last, start)}</Fragment>,
      );
    }
    segments.push(
      <Fragment key={`l${key++}`}>
        <DocInlineLink href={m[2]}>{m[1]}</DocInlineLink>
      </Fragment>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) {
    segments.push(<Fragment key={`t${key++}`}>{text.slice(last)}</Fragment>);
  }
  if (segments.length === 0) {
    return text;
  }
  return <>{segments}</>;
}
