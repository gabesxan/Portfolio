import { useState } from 'react';
import { Link } from 'react-router-dom';
import CatSprite, { type SpriteName } from '../components/CatSprite';
import {
  placeholderNotice,
  stackCategories,
  type StackCategory,
  type StackCategoryId,
  type StackItemPlaceholder,
} from '../data/content';

function CategoryArtwork({ id }: { id: StackCategoryId }) {
  if (id === 'frontend') {
    return (
      <svg viewBox="0 0 120 96" className="category-art-svg" aria-hidden="true">
        <rect
          x="10"
          y="10"
          width="100"
          height="76"
          rx="8"
          fill="#fbf7f0"
          stroke="#081028"
          strokeWidth="4"
        />
        <rect
          x="10"
          y="10"
          width="100"
          height="20"
          rx="6"
          fill="#a8c8f8"
          stroke="#081028"
          strokeWidth="4"
        />
        <circle cx="24" cy="20" r="3" fill="#081028" />
        <circle cx="34" cy="20" r="3" fill="#081028" />
        <circle cx="44" cy="20" r="3" fill="#081028" />
        <rect x="22" y="38" width="46" height="16" fill="#0038f8" />
        <rect x="74" y="38" width="24" height="16" fill="#0038f8" />
        <rect
          x="22"
          y="60"
          width="36"
          height="16"
          fill="#a8c8f8"
          stroke="#0038f8"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <rect
          x="64"
          y="60"
          width="34"
          height="16"
          fill="#a8c8f8"
          stroke="#0038f8"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
      </svg>
    );
  }
  if (id === 'backend') {
    return (
      <svg viewBox="0 0 120 96" className="category-art-svg" aria-hidden="true">
        <rect
          x="16"
          y="12"
          width="88"
          height="20"
          rx="6"
          fill="#a8c8f8"
          stroke="#081028"
          strokeWidth="4"
        />
        <circle cx="74" cy="22" r="3.5" fill="#081028" />
        <circle cx="84" cy="22" r="3.5" fill="#081028" />
        <circle cx="94" cy="22" r="3.5" fill="#081028" />
        <rect
          x="16"
          y="38"
          width="88"
          height="20"
          rx="6"
          fill="#fbf7f0"
          stroke="#081028"
          strokeWidth="4"
        />
        <circle cx="74" cy="48" r="3.5" fill="#081028" />
        <circle cx="84" cy="48" r="3.5" fill="#081028" />
        <circle cx="94" cy="48" r="3.5" fill="#081028" />
        <rect
          x="16"
          y="64"
          width="88"
          height="20"
          rx="6"
          fill="#a8c8f8"
          stroke="#081028"
          strokeWidth="4"
        />
        <circle cx="74" cy="74" r="3.5" fill="#081028" />
        <circle cx="84" cy="74" r="3.5" fill="#081028" />
        <circle cx="94" cy="74" r="3.5" fill="#081028" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 96" className="category-art-svg" aria-hidden="true">
      <path
        d="M22 30 H42 C42 22 52 22 52 30 H66 V46 C74 46 74 56 66 56 V72 H22 V56 C14 56 14 46 22 46 Z"
        fill="#fbf7f0"
        stroke="#081028"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M64 22 H102 V64 H64 V50 C72 50 72 40 64 40 Z"
        fill="#a8c8f8"
        stroke="#081028"
        strokeWidth="4"
        strokeLinejoin="round"
        transform="rotate(14 82 42)"
      />
    </svg>
  );
}

function TechIcon({ type }: { type: StackItemPlaceholder['iconType'] }) {
  if (type === 'laptop') {
    return (
      <svg viewBox="0 0 48 48" className="stack-item-svg" aria-hidden="true">
        <rect
          x="8"
          y="10"
          width="32"
          height="22"
          rx="3"
          fill="#fbf7f0"
          stroke="#081028"
          strokeWidth="3"
        />
        <path
          d="M4 34 H44 L40 40 H8 Z"
          fill="#a8c8f8"
          stroke="#081028"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'code') {
    return (
      <svg viewBox="0 0 48 48" className="stack-item-svg" aria-hidden="true">
        <rect
          x="6"
          y="10"
          width="36"
          height="28"
          rx="5"
          fill="#a8c8f8"
          stroke="#081028"
          strokeWidth="3"
        />
        <path
          d="M18 19 L12 24 L18 29 M30 19 L36 24 L30 29 M26 17 L22 31"
          fill="none"
          stroke="#081028"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'layers') {
    return (
      <svg viewBox="0 0 48 48" className="stack-item-svg" aria-hidden="true">
        <polygon
          points="24,8 42,17 24,26 6,17"
          fill="#fbf7f0"
          stroke="#081028"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polyline
          points="6,24 24,33 42,24"
          fill="none"
          stroke="#081028"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="6,31 24,40 42,31"
          fill="none"
          stroke="#0038f8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="stack-item-svg" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="14"
        fill="#a8c8f8"
        stroke="#081028"
        strokeWidth="3"
        strokeDasharray="6 4"
      />
      <circle
        cx="24"
        cy="24"
        r="6"
        fill="#fbf7f0"
        stroke="#081028"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function About() {
  const [openCategoryId, setOpenCategoryId] = useState<StackCategoryId | null>(
    null,
  );
  const [previewCategoryId, setPreviewCategoryId] =
    useState<StackCategoryId | null>(null);

  const activePeekingId = previewCategoryId ?? openCategoryId;
  const openCategory: StackCategory | undefined = stackCategories.find(
    (c) => c.id === openCategoryId,
  );

  const handleToggleCategory = (id: StackCategoryId) => {
    setOpenCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="zine-page zine-page--about"
      aria-labelledby="about-heading"
    >
      <div className="about-top-grid">
        <div className="about-bio-column">
          <div className="zine-cutout-banner">
            <h1 id="about-heading" className="zine-cutout-title">
              <span className="sr-only">Sobre</span>
              <span aria-hidden="true">SOBRE MIM</span>
            </h1>
          </div>

          <p className="about-lead">
            Um espaço para contar minha história, minhas experiências e o que
            gosto de criar.
          </p>

          <div className="about-bio-card">
            <p className="zine-placeholder-pill">
              <span className="zine-placeholder-dot" aria-hidden="true" />
              {placeholderNotice}
            </p>
            <p>
              <strong>Biografia pendente:</strong> Este espaço é reservado para
              a trajetória real de Gabriel como desenvolvedor Full Stack, seus
              interesses em arquitetura de software, interfaces expressivas e
              projetos autorais. Nenhuma formação, empresa ou experiência não
              confirmada foi inserida aqui.
            </p>
          </div>
        </div>

        <div className="about-polaroid-column">
          <div className="about-polaroid-frame">
            <div className="about-polaroid-tape" aria-hidden="true" />
            <div
              className="zine-art-canvas zine-art-canvas--polaroid"
              role="img"
              aria-label="Moldura ilustrada estilo Polaroid reservada para foto ou retrato de Gabriel"
            >
              <div className="zine-art-sun" />
              <div className="zine-art-mountain-back" />
              <div className="zine-art-mountain-front" />
              <span className="zine-stamp-badge">
                FOTO / ILUSTRAÇÃO PENDENTE
              </span>
            </div>

            <div className="about-polaroid-cat">
              <CatSprite
                name="pagina-sobre"
                alt="Gato preto apoiado na borda da moldura Polaroid olhando para o conteúdo da página Sobre"
                eager
                className="cat-anim-breathe"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="about-stacks-section">
        <div className="zine-cutout-banner zine-cutout-banner--sub">
          <h2 className="zine-cutout-subtitle">COMO EU TRABALHO</h2>
        </div>
        <p className="about-stacks-hint">
          Passe o mouse, navegue com Tab ou toque em uma categoria para chamar o
          gatinho e abrir o painel de tecnologias.
        </p>

        <div
          className="stack-categories-grid"
          role="group"
          aria-label="Categorias de atuação"
        >
          {stackCategories.map((category) => {
            const isOpen = openCategoryId === category.id;
            const isCatVisible = activePeekingId === category.id;
            const panelId = `stack-panel-${category.id}`;
            const buttonId = `stack-tab-${category.id}`;

            return (
              <div
                key={category.id}
                className={`stack-category-slot stack-category-slot--${category.catAlign} ${
                  isOpen ? 'stack-category-slot--open' : ''
                } ${isCatVisible ? 'stack-category-slot--peeking' : ''}`}
              >
                <div
                  className={`stack-peek-cat stack-peek-cat--${category.catAlign} ${
                    isCatVisible ? 'stack-peek-cat--visible' : ''
                  }`}
                  aria-hidden={!isCatVisible}
                >
                  <CatSprite
                    name={category.catSprite as SpriteName}
                    alt={category.catAlt}
                    decorative={!isCatVisible}
                  />
                </div>

                <button
                  id={buttonId}
                  type="button"
                  className={`stack-category-btn ${isOpen ? 'stack-category-btn--active' : ''}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onMouseEnter={() => setPreviewCategoryId(category.id)}
                  onMouseLeave={() =>
                    setPreviewCategoryId((prev) =>
                      prev === category.id ? null : prev,
                    )
                  }
                  onFocus={() => setPreviewCategoryId(category.id)}
                  onBlur={() =>
                    setPreviewCategoryId((prev) =>
                      prev === category.id ? null : prev,
                    )
                  }
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <span className="stack-category-art">
                    <CategoryArtwork id={category.id} />
                  </span>
                  <span className="stack-category-label">{category.label}</span>
                  <span
                    className="stack-category-state-indicator"
                    aria-hidden="true"
                  >
                    {isOpen ? 'PAINEL ABERTO ▲' : 'VER STACKS ▼'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {openCategory && (
          <section
            id={`stack-panel-${openCategory.id}`}
            role="region"
            aria-labelledby={`stack-panel-heading-${openCategory.id}`}
            className={`stack-drawer stack-drawer--${openCategory.catAlign}`}
          >
            <div className="stack-drawer-header">
              <div className="zine-cutout-banner zine-cutout-banner--drawer">
                <h3
                  id={`stack-panel-heading-${openCategory.id}`}
                  className="stack-drawer-title"
                >
                  {openCategory.panelTitle}
                </h3>
              </div>

              <button
                type="button"
                className="zine-btn zine-btn--close"
                onClick={() => setOpenCategoryId(null)}
                aria-label={`Fechar painel ${openCategory.panelTitle}`}
              >
                FECHAR <span aria-hidden="true">✕</span>
              </button>
            </div>

            <p className="stack-drawer-description">
              {openCategory.description}
            </p>

            <ul
              className="stack-items-grid"
              aria-label={`Lista de ${openCategory.panelTitle}`}
            >
              {openCategory.items.map((item) => (
                <li key={item.id} className="stack-item-card">
                  <div className="stack-item-icon">
                    <TechIcon type={item.iconType} />
                  </div>
                  <div className="stack-item-copy">
                    <h4 className="stack-item-title">{item.name}</h4>
                    <p className="stack-item-summary">{item.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="about-bottom-cta">
          <Link to="/contato" className="zine-splash-cta">
            <span>VAMOS CONVERSAR</span> <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
