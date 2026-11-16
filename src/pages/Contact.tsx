import { useState, type FormEvent } from 'react';
import CatSprite from '../components/CatSprite';
import { contactChannelsPlaceholder, placeholderNotice } from '../data/content';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setFeedback({
        type: 'error',
        text: 'Preencha nome, e-mail e mensagem antes de testar o envio.',
      });
      return;
    }

    if (!contactChannelsPlaceholder.formServiceConfigured) {
      setFeedback({
        type: 'info',
        text: 'Serviço de envio de formulário ainda não configurado neste ambiente. Nenhuma mensagem foi disparada — utilize o canal GitHub confirmado ou aguarde a publicação do e-mail oficial de Gabriel.',
      });
    }
  };

  return (
    <section
      className="zine-page zine-page--contact"
      aria-labelledby="contact-heading"
    >
      <div className="contact-grid">
        <div className="contact-left-column">
          <div className="contact-title-block">
            <h1 id="contact-heading" className="sr-only">
              Contato
            </h1>
            <p
              className="zine-display-title contact-display-title"
              aria-hidden="true"
            >
              VAMOS
              <br />
              CONVERSAR?
            </p>
            <p className="contact-subtitle">
              Tem uma ideia ou projeto? Me conta.
            </p>
          </div>

          <p className="zine-placeholder-pill" role="note">
            <span className="zine-placeholder-dot" aria-hidden="true" />
            {placeholderNotice}
          </p>

          <div
            className="contact-channels-stack"
            aria-label="Canais de contato"
          >
            <div className="contact-channel-card contact-channel-card--primary">
              <span className="contact-channel-icon" aria-hidden="true">
                ✉
              </span>
              <div className="contact-channel-body">
                <span className="contact-channel-title">ENVIAR E-MAIL</span>
                <span className="contact-channel-status">
                  {contactChannelsPlaceholder.email ??
                    'Endereço oficial pendente de confirmação'}
                </span>
              </div>
            </div>

            <div className="contact-channel-card contact-channel-card--secondary">
              <span className="contact-channel-icon" aria-hidden="true">
                in
              </span>
              <div className="contact-channel-body">
                <span className="contact-channel-title">LINKEDIN</span>
                <span className="contact-channel-status">
                  {contactChannelsPlaceholder.linkedin ??
                    'Perfil oficial pendente de confirmação'}
                </span>
              </div>
            </div>

            {contactChannelsPlaceholder.github && (
              <a
                href={contactChannelsPlaceholder.github}
                target="_blank"
                rel="noreferrer"
                className="contact-channel-card contact-channel-card--link"
              >
                <span className="contact-channel-icon" aria-hidden="true">
                  ⌘
                </span>
                <div className="contact-channel-body">
                  <span className="contact-channel-title">
                    GITHUB CONFIRMADO
                  </span>
                  <span className="contact-channel-status">
                    github.com/gabesxan ↗
                  </span>
                </div>
              </a>
            )}
          </div>

          <div className="contact-cat-wrapper">
            <CatSprite
              name="pagina-contato"
              alt="Gato preto no canto inferior esquerdo digitando no notebook azul e olhando para o formulário de contato"
              eager
              className="cat-anim-float"
            />
          </div>
        </div>

        <div className="contact-right-column">
          <form
            className="contact-form-card"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="contact-service-banner" role="status">
              <strong>Estado da integração:</strong>{' '}
              {contactChannelsPlaceholder.statusNote}
            </div>

            <div className="zine-field">
              <label htmlFor="contact-name" className="zine-label">
                NOME
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className="zine-input"
                placeholder="Como posso te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="zine-field">
              <label htmlFor="contact-email" className="zine-label">
                E-MAIL
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="zine-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="zine-field">
              <label htmlFor="contact-message" className="zine-label">
                MENSAGEM
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                className="zine-textarea"
                placeholder="Conte sobre seu projeto, ideia ou oportunidade..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {feedback && (
              <div
                role="alert"
                className={`zine-feedback-box zine-feedback-box--${feedback.type}`}
              >
                {feedback.text}
              </div>
            )}

            <button type="submit" className="zine-btn zine-btn--submit">
              <span aria-hidden="true">➤</span> ENVIAR MENSAGEM
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
