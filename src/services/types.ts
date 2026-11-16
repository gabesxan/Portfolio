export const COLORS = ['#153ed5', '#111c42', '#4a83ff', '#fff9e8'] as const;
export const FONTS = ['marker', 'block', 'script'] as const;
export interface Stroke {
  width: number;
  points: { x: number; y: number }[];
}
type Appearance = {
  name: string;
  color: (typeof COLORS)[number];
  font: (typeof FONTS)[number];
};
export type SignatureInput = Appearance &
  ({ kind: 'text'; strokes?: never } | { kind: 'drawing'; strokes: Stroke[] });
export type Signature = Appearance & {
  id: string;
  kind: 'text' | 'drawing';
  strokes: Stroke[] | null;
  createdAt: string;
};
export interface SignaturePage {
  data: Signature[];
  pagination: { limit: number; nextCursor: string | null; hasMore: boolean };
}
