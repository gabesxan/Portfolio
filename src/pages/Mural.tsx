import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import CatSprite from '../components/CatSprite';
import { ApiError } from '../services/api';
import {
  COLORS,
  FONTS,
  listSignatures,
  publishSignature,
  type Signature,
  type SignatureInput,
  type Stroke,
} from '../services/mural';

const COLOR_LABELS: Record<(typeof COLORS)[number], string> = {
  '#153ed5': 'Azul Spray',
  '#111c42': 'Nanquim Escuro',
  '#4a83ff': 'Azul Elétrico',
  '#fff9e8': 'Giz Creme',
};

const FONT_LABELS: Record<(typeof FONTS)[number], string> = {
  marker: 'Marcador Zine',
  block: 'Estêncil Urbano',
  script: 'Tag Caligráfica',
};

const BRUSH_WIDTHS = [3, 6, 10] as const;
const PAGE_LIMIT = 12;

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, Number(val.toFixed(4))));
}

function sanitizeVisitorName(raw: string): string {
  return Array.from(raw.trim())
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join('');
}

function renderStrokesToCanvas(
  canvas: HTMLCanvasElement | null,
  strokes: Stroke[],
  strokeColor: string,
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = strokeColor;

  for (const stroke of strokes) {
    if (!stroke.points || stroke.points.length < 2) continue;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    const first = stroke.points[0];
    ctx.moveTo(first.x * width, first.y * height);
    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      ctx.lineTo(pt.x * width, pt.y * height);
    }
    ctx.stroke();
  }
}

function SignatureDrawingPreview({
  strokes,
  color,
  label,
}: {
  strokes: Stroke[];
  color: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    renderStrokesToCanvas(canvasRef.current, strokes, color);
  }, [strokes, color]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={150}
      className="mural-card-canvas"
      role="img"
      aria-label={`Assinatura desenhada por ${label}`}
    />
  );
}

export default function Mural() {
  // Wall pagination & loading state
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(true);
  const [wallError, setWallError] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Composer state
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'text' | 'drawing'>('text');
  const [color, setColor] = useState<(typeof COLORS)[number]>('#153ed5');
  const [font, setFont] = useState<(typeof FONTS)[number]>('marker');
  const [brushWidth, setBrushWidth] = useState<number>(6);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [composerFeedback, setComposerFeedback] = useState<{
    type: 'error' | 'success' | 'warning';
    text: string;
  } | null>(null);

  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointsRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef<boolean>(false);

  const currentCursor = cursorStack[cursorStack.length - 1];
  const currentPageNumber = cursorStack.length;

  const fetchWallPage = useCallback(
    async (cursorValue?: string, signal?: AbortSignal) => {
      setIsLoadingWall(true);
      setWallError(null);
      try {
        const response = await listSignatures(
          { limit: PAGE_LIMIT, cursor: cursorValue },
          signal,
        );
        setSignatures(response.data);
        setNextCursor(response.pagination.nextCursor);
        setHasMore(response.pagination.hasMore);
      } catch (err) {
        if (signal?.aborted) return;
        if (err instanceof ApiError) {
          setWallError(
            `Não foi possível carregar o mural (${err.code}): ${err.message}`,
          );
        } else {
          setWallError(
            'Falha de conexão ao carregar o mural de assinaturas. Verifique se o servidor está ativo e tente novamente.',
          );
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoadingWall(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchWallPage(currentCursor, controller.signal);
    return () => controller.abort();
  }, [currentCursor, fetchWallPage]);

  // Redraw interactive canvas whenever strokes or color change
  useEffect(() => {
    if (kind === 'drawing') {
      renderStrokesToCanvas(drawCanvasRef.current, strokes, color);
    }
  }, [kind, strokes, color]);

  const totalPointsCount = strokes.reduce((acc, s) => acc + s.points.length, 0);

  const getNormalizedPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / Math.max(1, rect.width));
    const y = clamp01((e.clientY - rect.top) / Math.max(1, rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (isConfirmStep || isPublishing) return;
    if (strokes.length >= 64 || totalPointsCount >= 2040) {
      setComposerFeedback({
        type: 'warning',
        text: 'Limite de traços atingido para uma assinatura. Limpe ou revise sua marca.',
      });
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer events in headless tests may not have an active pointerId
    }
    isDrawingRef.current = true;
    const pt = getNormalizedPoint(e);
    const initialPoints = [
      pt,
      { x: clamp01(pt.x + 0.002), y: clamp01(pt.y + 0.002) },
    ];
    activePointsRef.current = initialPoints;
    renderStrokesToCanvas(
      drawCanvasRef.current,
      [...strokes, { width: brushWidth, points: initialPoints }],
      color,
    );
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const currentPts = activePointsRef.current;
    if (
      currentPts.length >= 256 ||
      totalPointsCount + currentPts.length >= 2048
    ) {
      return;
    }
    const pt = getNormalizedPoint(e);
    const last = currentPts[currentPts.length - 1];
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    if (dist < 0.008) return;
    activePointsRef.current = [...currentPts, pt];
    renderStrokesToCanvas(
      drawCanvasRef.current,
      [...strokes, { width: brushWidth, points: activePointsRef.current }],
      color,
    );
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = activePointsRef.current;
    activePointsRef.current = [];
    if (pts.length >= 2) {
      setStrokes((prev) => [
        ...prev.slice(0, 63),
        { width: brushWidth, points: pts.slice(0, 256) },
      ]);
    }
  };

  const handleClearComposer = () => {
    setStrokes([]);
    setIsConfirmStep(false);
    setComposerFeedback(null);
  };

  const handleCancelAll = () => {
    setName('');
    setStrokes([]);
    setIsConfirmStep(false);
    setComposerFeedback(null);
  };

  const validateBeforeConfirm = (): SignatureInput | null => {
    const trimmed = sanitizeVisitorName(name);
    if (trimmed.length < 1 || trimmed.length > 40) {
      setComposerFeedback({
        type: 'error',
        text: 'Informe um nome ou apelido entre 1 e 40 caracteres.',
      });
      return null;
    }

    if (kind === 'drawing') {
      if (strokes.length === 0) {
        setComposerFeedback({
          type: 'error',
          text: 'Desenhe pelo menos um traço no quadro ou mude para o modo Tag Digitada.',
        });
        return null;
      }
      return {
        name: trimmed,
        kind: 'drawing',
        color,
        font,
        strokes,
      };
    }

    return {
      name: trimmed,
      kind: 'text',
      color,
      font,
    };
  };

  const handlePreparePublish = () => {
    setComposerFeedback(null);
    const payload = validateBeforeConfirm();
    if (!payload) return;
    setIsConfirmStep(true);
  };

  const handleExplicitPublish = async () => {
    const payload = validateBeforeConfirm();
    if (!payload || isPublishing) return;

    setIsPublishing(true);
    setComposerFeedback(null);

    try {
      await publishSignature(payload);
      // Only after 201 confirmation: reset composer and reload page 1
      setName('');
      setStrokes([]);
      setIsConfirmStep(false);
      setComposerFeedback({
        type: 'success',
        text: 'Marca publicada com sucesso no mural após confirmação do servidor!',
      });
      setCursorStack([undefined]);
      await fetchWallPage(undefined);
    } catch (err) {
      if (err instanceof ApiError) {
        setComposerFeedback({
          type: 'error',
          text: `Publicação recusada (${err.code}): ${err.message}`,
        });
      } else {
        // Uncertain network failure: never auto-retry POST; reload wall first and inform visitor
        setComposerFeedback({
          type: 'warning',
          text: 'A resposta de rede falhou ou expirou. Para evitar duplicação, não reenviamos automaticamente. Recarregamos o mural abaixo para você verificar se sua marca entrou antes de tentar novamente.',
        });
        setCursorStack([undefined]);
        await fetchWallPage(undefined);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  };

  const handlePrevPage = () => {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) => prev.slice(0, -1));
  };

  const handleRefreshFirstPage = () => {
    if (cursorStack.length === 1 && currentCursor === undefined) {
      void fetchWallPage(undefined);
    } else {
      setCursorStack([undefined]);
    }
  };

  const previewName = name.trim() || 'SUA TAG AQUI';

  return (
    <section
      className="zine-page zine-page--mural"
      aria-labelledby="mural-heading"
    >
      <div className="mural-hero-banner">
        <div className="mural-hero-copy">
          <div className="zine-cutout-banner">
            <h1 id="mural-heading" className="zine-cutout-title">
              Mural
            </h1>
          </div>
          <p className="mural-hero-kicker">
            MURAL DE ASSINATURAS · GRAFITE DIGITAL ANOS 90
          </p>
          <p className="mural-hero-desc">
            Deixe sua marca registrada na parede do portfólio! Escolha o estilo
            da sua tag ou desenhe à mão livre, confira a prévia e confirme a
            publicação.
          </p>
        </div>

        <div className="mural-hero-cat">
          <CatSprite
            name="gato-notebook-aprovado"
            alt="Gato preto com notebook azul acompanhando as assinaturas do mural"
            eager
            className="cat-anim-float"
          />
        </div>
      </div>

      <div className="mural-workspace-grid">
        {/* Left column: Tag / Graffiti Composer */}
        <section
          className="mural-composer-panel"
          aria-labelledby="mural-composer-heading"
        >
          <div className="mural-panel-header">
            <h2 id="mural-composer-heading" className="mural-panel-title">
              1. CRIAR SUA MARCA
            </h2>
            <span className="zine-tag-chip">PASSO A PASSO</span>
          </div>

          <div className="zine-field">
            <label htmlFor="mural-visitor-name" className="zine-label">
              SEU NOME OU TAG (1 A 40 CARACTERES)
            </label>
            <input
              id="mural-visitor-name"
              type="text"
              maxLength={40}
              className="zine-input"
              placeholder="Ex.: Alex_94"
              value={name}
              disabled={isConfirmStep || isPublishing}
              onChange={(e) => {
                setName(e.target.value);
                setIsConfirmStep(false);
              }}
            />
          </div>

          <fieldset
            className="mural-fieldset"
            disabled={isConfirmStep || isPublishing}
          >
            <legend className="zine-label">MODO DE CRIAÇÃO</legend>
            <div className="mural-mode-tabs">
              <button
                type="button"
                className={`mural-mode-btn ${kind === 'text' ? 'mural-mode-btn--active' : ''}`}
                aria-pressed={kind === 'text'}
                onClick={() => {
                  setKind('text');
                  setIsConfirmStep(false);
                }}
              >
                ✎ TAG DIGITADA
              </button>
              <button
                type="button"
                className={`mural-mode-btn ${kind === 'drawing' ? 'mural-mode-btn--active' : ''}`}
                aria-pressed={kind === 'drawing'}
                onClick={() => {
                  setKind('drawing');
                  setIsConfirmStep(false);
                }}
              >
                スプレー DESENHAR ASSINATURA
              </button>
            </div>
          </fieldset>

          <fieldset
            className="mural-fieldset"
            disabled={isConfirmStep || isPublishing}
          >
            <legend className="zine-label">COR DA TINTA</legend>
            <div className="mural-swatch-row">
              {COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className={`mural-swatch-btn ${
                    color === swatch ? 'mural-swatch-btn--selected' : ''
                  }`}
                  aria-pressed={color === swatch}
                  onClick={() => {
                    setColor(swatch);
                    setIsConfirmStep(false);
                  }}
                >
                  <span
                    className="mural-swatch-dot"
                    style={{ backgroundColor: swatch }}
                    aria-hidden="true"
                  />
                  <span>{COLOR_LABELS[swatch]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset
            className="mural-fieldset"
            disabled={isConfirmStep || isPublishing}
          >
            <legend className="zine-label">ESTILO DE TRAÇO / TIPOGRAFIA</legend>
            <div className="mural-font-row">
              {FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`mural-font-btn mural-font-btn--${f} ${
                    font === f ? 'mural-font-btn--selected' : ''
                  }`}
                  aria-pressed={font === f}
                  onClick={() => {
                    setFont(f);
                    setIsConfirmStep(false);
                  }}
                >
                  {FONT_LABELS[f]}
                </button>
              ))}
            </div>
          </fieldset>

          {kind === 'drawing' && (
            <div className="mural-drawing-box">
              <div className="mural-drawing-toolbar">
                <span className="zine-label">ESPESSURA DO TRAÇO:</span>
                <div
                  className="mural-brush-group"
                  role="group"
                  aria-label="Espessura do traço"
                >
                  {BRUSH_WIDTHS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      disabled={isConfirmStep || isPublishing}
                      className={`mural-brush-btn ${
                        brushWidth === w ? 'mural-brush-btn--active' : ''
                      }`}
                      aria-pressed={brushWidth === w}
                      onClick={() => setBrushWidth(w)}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="zine-btn zine-btn--small"
                  disabled={
                    strokes.length === 0 || isConfirmStep || isPublishing
                  }
                  onClick={() => setStrokes((prev) => prev.slice(0, -1))}
                >
                  DESFAZER TRAÇO
                </button>
              </div>

              <div
                className={`mural-canvas-frame ${
                  color === '#fff9e8' ? 'mural-canvas-frame--dark' : ''
                }`}
              >
                <canvas
                  ref={drawCanvasRef}
                  width={480}
                  height={220}
                  className="mural-interactive-canvas"
                  aria-label="Quadro de desenho para assinatura com mouse ou toque"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishStroke}
                  onPointerCancel={finishStroke}
                />
              </div>
              <p className="mural-canvas-caption">
                Traços: {strokes.length}/64 · Pontos: {totalPointsCount}/2048.
                Nada é enviado automaticamente enquanto você desenha.
              </p>
            </div>
          )}

          {/* Live Preview Brick */}
          <div className="mural-preview-brick" aria-live="polite">
            <div className="mural-preview-header">
              <span className="zine-label">
                PRÉVIA NA PAREDE ANTES DE PUBLICAR
              </span>
              <span className="mural-preview-tag">
                {kind === 'drawing' ? 'DESENHO + TAG' : 'TAG DE TEXTO'}
              </span>
            </div>

            <div className="mural-wall-card mural-wall-card--preview">
              <div
                className={`mural-wall-card-art ${
                  color === '#fff9e8' ? 'mural-wall-card-art--dark' : ''
                }`}
              >
                {kind === 'drawing' && strokes.length > 0 ? (
                  <SignatureDrawingPreview
                    strokes={strokes}
                    color={color}
                    label={previewName}
                  />
                ) : (
                  <p
                    className={`mural-signature-text mural-signature-text--${font}`}
                    style={{ color }}
                  >
                    {previewName}
                  </p>
                )}
              </div>
              <div className="mural-wall-card-footer">
                <span className="mural-signer-name">{previewName}</span>
                <span className="mural-signer-meta">{FONT_LABELS[font]}</span>
              </div>
            </div>
          </div>

          {composerFeedback && (
            <div
              role="alert"
              className={`zine-feedback-box zine-feedback-box--${composerFeedback.type}`}
            >
              {composerFeedback.text}
            </div>
          )}

          {/* Action / Explicit Confirmation Controls (RF-11) */}
          <div className="mural-composer-actions">
            {!isConfirmStep ? (
              <>
                <button
                  type="button"
                  className="zine-btn zine-btn--primary"
                  onClick={handlePreparePublish}
                  disabled={isPublishing}
                >
                  REVISAR E PREPARAR PUBLICAÇÃO →
                </button>
                <button
                  type="button"
                  className="zine-btn zine-btn--outline"
                  onClick={handleClearComposer}
                  disabled={isPublishing}
                >
                  LIMPAR QUADRO
                </button>
                <button
                  type="button"
                  className="zine-btn zine-btn--ghost"
                  onClick={handleCancelAll}
                  disabled={isPublishing}
                >
                  CANCELAR
                </button>
              </>
            ) : (
              <div
                className="mural-confirm-box"
                role="region"
                aria-label="Confirmação explícita de publicação"
              >
                <p className="mural-confirm-prompt">
                  <strong>Confirmação explícita:</strong> Sua assinatura ficará
                  visível publicamente no mural para outros visitantes. Deseja
                  gravar na parede agora?
                </p>
                <div className="mural-confirm-buttons">
                  <button
                    type="button"
                    className="zine-btn zine-btn--confirm"
                    onClick={() => void handleExplicitPublish()}
                    disabled={isPublishing}
                  >
                    {isPublishing
                      ? 'PUBLICANDO NO SERVIDOR...'
                      : '✓ CONFIRMAR PUBLICAÇÃO'}
                  </button>
                  <button
                    type="button"
                    className="zine-btn zine-btn--outline"
                    onClick={() => setIsConfirmStep(false)}
                    disabled={isPublishing}
                  >
                    VOLTAR E EDITAR
                  </button>
                  <button
                    type="button"
                    className="zine-btn zine-btn--ghost"
                    onClick={handleCancelAll}
                    disabled={isPublishing}
                  >
                    CANCELAR TUDO
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right column: Paginated Graffiti Wall (RF-09, RF-12, RF-13, RF-14) */}
        <section
          className="mural-wall-section"
          aria-labelledby="mural-wall-heading"
        >
          <div className="mural-wall-header">
            <div>
              <h2 id="mural-wall-heading" className="mural-wall-title">
                2. PAREDE DE GRAFITE
              </h2>
              <p className="mural-wall-subtitle">
                Página {currentPageNumber} · Exibindo até {PAGE_LIMIT} marcas
                por seção de parede para leitura limpa e acessível (RF-14).
              </p>
            </div>

            <button
              type="button"
              className="zine-btn zine-btn--small"
              onClick={handleRefreshFirstPage}
              disabled={isLoadingWall}
            >
              ↻ ATUALIZAR PAREDE
            </button>
          </div>

          {isLoadingWall && (
            <div className="mural-state-card" role="status" aria-live="polite">
              <p className="mural-state-title">CARREGANDO MARCAS DO MURAL...</p>
              <p className="mural-state-sub">
                Buscando assinaturas salvas no servidor.
              </p>
            </div>
          )}

          {!isLoadingWall && wallError && (
            <div
              className="mural-state-card mural-state-card--error"
              role="alert"
            >
              <p className="mural-state-title">OPS! FALHA AO LER O MURAL</p>
              <p className="mural-state-sub">{wallError}</p>
              <button
                type="button"
                className="zine-btn zine-btn--primary"
                onClick={() => void fetchWallPage(currentCursor)}
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          )}

          {!isLoadingWall && !wallError && signatures.length === 0 && (
            <div
              className="mural-state-card mural-state-card--empty"
              role="status"
            >
              <div className="mural-empty-sticker">
                <CatSprite
                  name="conceito-rosto"
                  alt="Rosto do gato preto em estilo adesivo zine"
                  width={180}
                  height={120}
                />
              </div>
              <p className="mural-state-title">
                PAREDE LIMPA — SEJA A PRIMEIRA PESSOA A ASSINAR!
              </p>
              <p className="mural-state-sub">
                Ainda não há marcas nesta página do mural. Use o painel ao lado
                para deixar sua tag.
              </p>
            </div>
          )}

          {!isLoadingWall && !wallError && signatures.length > 0 && (
            <ul
              className="mural-wall-grid"
              aria-label="Assinaturas publicadas no mural"
            >
              {signatures.map((sig, idx) => {
                const tiltClass = `mural-wall-card--tilt-${idx % 4}`;
                return (
                  <li key={sig.id} className={`mural-wall-card ${tiltClass}`}>
                    <div className="mural-wall-card-pin" aria-hidden="true" />
                    <div
                      className={`mural-wall-card-art ${
                        sig.color === '#fff9e8'
                          ? 'mural-wall-card-art--dark'
                          : ''
                      }`}
                    >
                      {sig.kind === 'drawing' &&
                      sig.strokes &&
                      sig.strokes.length > 0 ? (
                        <SignatureDrawingPreview
                          strokes={sig.strokes}
                          color={sig.color}
                          label={sig.name}
                        />
                      ) : (
                        <p
                          className={`mural-signature-text mural-signature-text--${sig.font}`}
                          style={{ color: sig.color }}
                        >
                          {sig.name}
                        </p>
                      )}
                    </div>
                    <div className="mural-wall-card-footer">
                      <span className="mural-signer-name">{sig.name}</span>
                      <time
                        className="mural-signer-date"
                        dateTime={sig.createdAt}
                      >
                        {new Date(sig.createdAt).toLocaleDateString('pt-BR')}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Bounded Wall Pagination Controls (RF-14) */}
          <nav
            className="mural-pagination-bar"
            aria-label="Paginação da parede de assinaturas"
          >
            <button
              type="button"
              className="zine-btn zine-btn--outline"
              onClick={handlePrevPage}
              disabled={cursorStack.length <= 1 || isLoadingWall}
            >
              ← PAREDE ANTERIOR
            </button>
            <span className="mural-page-indicator" aria-live="polite">
              PAREDE {currentPageNumber}
            </span>
            <button
              type="button"
              className="zine-btn zine-btn--outline"
              onClick={handleNextPage}
              disabled={!hasMore || !nextCursor || isLoadingWall}
            >
              PRÓXIMA PAREDE →
            </button>
          </nav>
        </section>
      </div>
    </section>
  );
}
