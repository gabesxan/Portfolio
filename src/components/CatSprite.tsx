import type { CSSProperties } from 'react';

export type SpriteName =
  | 'gato-notebook-aprovado'
  | 'pagina-inicio'
  | 'pagina-projetos'
  | 'pagina-sobre'
  | 'pagina-contato'
  | 'hover-frontend'
  | 'hover-backend'
  | 'hover-integracoes'
  | 'conceito-rosto';

interface CatSpriteProps {
  name: SpriteName;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  decorative?: boolean;
  style?: CSSProperties;
}

const DIMENSIONS: Record<SpriteName, { width: number; height: number }> = {
  'gato-notebook-aprovado': { width: 960, height: 843 },
  'pagina-inicio': { width: 960, height: 648 },
  'pagina-projetos': { width: 960, height: 496 },
  'pagina-sobre': { width: 960, height: 643 },
  'pagina-contato': { width: 960, height: 770 },
  'hover-frontend': { width: 960, height: 759 },
  'hover-backend': { width: 960, height: 490 },
  'hover-integracoes': { width: 960, height: 725 },
  'conceito-rosto': { width: 960, height: 633 },
};

export default function CatSprite({
  name,
  alt,
  className = '',
  width,
  height,
  eager = false,
  decorative = false,
  style,
}: CatSpriteProps) {
  const dims = DIMENSIONS[name];
  const resolvedWidth = width ?? dims.width;
  const resolvedHeight = height ?? dims.height;

  return (
    <picture className={`cat-sprite-picture ${className}`.trim()} style={style}>
      <source srcSet={`/sprites/${name}.webp`} type="image/webp" />
      <img
        src={`/sprites/${name}.png`}
        alt={decorative ? '' : alt}
        aria-hidden={decorative ? 'true' : undefined}
        width={resolvedWidth}
        height={resolvedHeight}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="cat-sprite-img"
      />
    </picture>
  );
}
