import { Outlet, useLocation, Link } from 'react-router-dom';
import Nav from './Nav';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="zine-shell">
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>

      <div className="zine-corner zine-corner--top-left" aria-hidden="true" />
      <div className="zine-corner zine-corner--top-right" aria-hidden="true" />
      <div
        className="zine-corner zine-corner--bottom-left"
        aria-hidden="true"
      />
      <div
        className="zine-corner zine-corner--bottom-right"
        aria-hidden="true"
      />

      <header className="zine-header">
        <Nav />
      </header>

      <main id="main" className="zine-main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="zine-footer">
        <div className="zine-footer-inner">
          <p className="zine-footer-note">
            <strong>GABRIEL</strong> · Portfólio Full Stack · Estética Zine
            &amp; Grafite Anos 90
          </p>
          <div className="zine-footer-cta">
            <span className="zine-footer-prompt">VAMOS CONVERSAR?</span>
            <Link to="/contato" className="zine-btn zine-btn--footer">
              CONTATO <span aria-hidden="true">→</span>
            </Link>
            <Link to="/mural" className="zine-btn zine-btn--footer-alt">
              ASSINAR MURAL <span aria-hidden="true">✎</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
