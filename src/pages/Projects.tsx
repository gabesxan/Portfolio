import { useState } from 'react';
import { Link } from 'react-router-dom';
import CatSprite from '../components/CatSprite';
import {
  placeholderNotice,
  projectsPlaceholder,
  type ProjectPlaceholder,
} from '../data/content';

function ProjectArtwork({
  variant,
  badge,
}: {
  variant: ProjectPlaceholder['artworkVariant'];
  badge: string;
}) {
  return (
    <div
      className={`zine-art-canvas zine-art-canvas--${variant}`}
      aria-hidden="true"
    >
      <div className="zine-art-sun" />
      <div className="zine-art-mountain-back" />
      <div className="zine-art-mountain-front" />
      <span className="zine-stamp-badge zine-stamp-badge--corner">{badge}</span>
    </div>
  );
}

export default function Projects() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section
      className="zine-page zine-page--projects"
      aria-labelledby="projects-heading"
    >
      <div className="projects-header-row">
        <div className="projects-title-group">
          <h1 id="projects-heading" className="zine-display-title">
            Projetos
          </h1>
          <p className="projects-subtitle-brush">
            Uma seleção do que venho criando.
          </p>
          <p className="zine-placeholder-pill" role="note">
            <span className="zine-placeholder-dot" aria-hidden="true" />
            {placeholderNotice}
          </p>
        </div>

        <div className="projects-header-cat">
          <CatSprite
            name="pagina-projetos"
            alt="Gato preto apoiado sobre a moldura dos projetos com seu notebook azul"
            eager
            className="cat-anim-float"
          />
        </div>
      </div>

      <div className="projects-bento-grid">
        {projectsPlaceholder.map((project, index) => {
          const isExpanded = expandedId === project.id;
          const detailsId = `project-details-${project.id}`;

          return (
            <article
              key={project.id}
              className={`project-card ${
                index === 0
                  ? 'project-card--featured'
                  : 'project-card--horizontal'
              }`}
              aria-labelledby={`project-title-${project.id}`}
            >
              <div className="project-card-media">
                <ProjectArtwork
                  variant={project.artworkVariant}
                  badge="EXEMPLO VISUAL"
                />
              </div>

              <div className="project-card-body">
                <div className="project-card-head">
                  <span className="zine-tag-chip">{project.badge}</span>
                  <h2
                    id={`project-title-${project.id}`}
                    className="project-card-title"
                  >
                    {project.title}
                  </h2>
                </div>

                <div className="project-card-section">
                  <h3 className="project-meta-label">
                    DESCRIÇÃO DO PROJETO (PROBLEMA)
                  </h3>
                  <p className="project-card-text">{project.problem}</p>
                </div>

                <div className="project-card-section">
                  <h3 className="project-meta-label">
                    TECNOLOGIAS (PENDENTES)
                  </h3>
                  <ul
                    className="project-tech-pills"
                    aria-label={`Tecnologias do ${project.title}`}
                  >
                    {project.technologies.map((tech) => (
                      <li key={tech} className="project-tech-pill">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                {isExpanded && (
                  <div id={detailsId} className="project-card-expanded">
                    <div className="project-card-section">
                      <h3 className="project-meta-label">SOLUÇÃO TÉCNICA</h3>
                      <p className="project-card-text">{project.solution}</p>
                    </div>
                    <div className="project-card-section">
                      <h3 className="project-meta-label">
                        PARTICIPAÇÃO &amp; LINKS
                      </h3>
                      <p className="project-card-text">{project.role}</p>
                      <p className="project-links-pending">
                        Repositório e demonstração pública serão adicionados
                        assim que Gabriel confirmar os projetos reais.
                      </p>
                    </div>
                  </div>
                )}

                <div className="project-card-footer">
                  <button
                    type="button"
                    className="zine-btn zine-btn--chip"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : project.id)
                    }
                  >
                    {isExpanded ? 'OCULTAR DETALHES ↑' : 'VER DETALHES →'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="projects-bottom-banner">
        <p className="projects-bottom-text">
          Quer discutir um projeto real ou parceria técnica?
        </p>
        <Link to="/contato" className="zine-btn zine-btn--primary">
          IR PARA CONTATO →
        </Link>
      </div>
    </section>
  );
}
