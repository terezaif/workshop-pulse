import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />
      <header className="page-header">
        <Link to="/" className="logo">
          <span className="pulse-dot" />
          Workshop Pulse
        </Link>
      </header>
      <main>{children}</main>
    </>
  );
}
