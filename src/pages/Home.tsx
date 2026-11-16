import { Link } from 'react-router-dom';
import CatSprite from '../components/CatSprite';
import { placeholderNotice, projectsPlaceholder } from '../data/content';

export default function Home() {
  const featuredProject = projectsPlaceholder[0];

  return (
    <section
      className="zine-page zine-page--home"
      aria-labelledby="home-heading"
    >
      {/* Hidden or visually integrated h1 "Início" so route accessibility and test expectations match */}
      <h1 id="home-heading" className="sr-only">
        Início
      </h1>

      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <p className="home-kicker">OLÁ, EU SOU</p>
          <div className="home-display-banner">
            <span className="home-display-name">GABRIEL</span>
          </div>
          <p className="home-role-title">DESENVOLVEDOR FULL STACK</p>
          <p className="home-lead">Ideias, interfaces e sistemas para a web.</p>

          <div className="home-cta-row">
            <Link to="/projetos" className="zine-btn zine-btn--primary">
              VER PROJETOS
            </Link>
            <Link to="/contato" className="zine-btn zine-btn--outline">
              ENTRAR EM CONTATO
            </Link>
            <Link to="/mural" className="zine-btn zine-btn--tag">
              MURAL DE GRAFITE ✎
            </Link>
          </div>

          <p className="zine-placeholder-pill" role="note">
            <span className="zine-placeholder-dot" aria-hidden="true" />
            {placeholderNotice}
          </p>
        </div>

        <div className="home-hero-mascot">
          <div className="cat-stage cat-stage--home">
            <CatSprite
              name="pagina-inicio"
              alt="Gato preto de estilo quadrinhos anos 90 digitando em um notebook azul com adesivo de gatinho"
              eager
              className="cat-anim-float"
            />
          </div>
        </div>
      </div>

      <div className="home-preview-section">
        <div className="home-preview-header">
          <h2 className="zine-section-title">
            PROJETOS
            <br />
            SELECIONADOS
          </h2>
          <p className="home-preview-sub">
            Recortes de trabalhos e experimentos técnicos (dados reais em
            preparação).
          </p>
        </div>

        <article
          className="home-featured-frame"
          aria-label="Prévia de projetos selecionados"
        >
          <div
            className="zine-art-canvas zine-art-canvas--mountains"
            aria-hidden="true"
          >
            <div className="zine-art-sun" />
            <div className="zine-art-mountain-back" />
            <div className="zine-art-mountain-front" />
            <span className="zine-stamp-badge">EM BREVE</span>
          </div>

          <div className="home-featured-meta">
            <span className="zine-tag-chip">{featuredProject.badge}</span>
            <h3 className="home-featured-title">{featuredProject.title}</h3>
            <p className="home-featured-desc">{featuredProject.problem}</p>
            <div className="home-featured-actions">
              <Link to="/projetos" className="zine-link-arrow">
                EXPLORAR LISTA DE PROJETOS <span aria-hidden="true">→</span>
              </Link>
              <Link to="/sobre" className="zine-link-arrow">
                CONHECER STACKS <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
