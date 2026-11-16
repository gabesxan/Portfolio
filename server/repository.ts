import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type {
  Signature,
  SignatureInput,
  SignaturePage,
} from '../src/services/types.js';
export interface SignatureRepository {
  list(limit: number, cursor?: string): Promise<SignaturePage>;
  create(input: SignatureInput): Promise<Signature>;
  remove(id: string): Promise<boolean>;
}
interface SignatureRow extends RowDataPacket {
  id: string;
  name: string;
  kind: Signature['kind'];
  color: Signature['color'];
  font: Signature['font'];
  strokes: Signature['strokes'];
  created_at: string;
}
function serialize(row: SignatureRow): Signature {
  return {
    id: String(row.id),
    name: row.name,
    kind: row.kind,
    color: row.color,
    font: row.font,
    strokes: row.strokes,
    createdAt: new Date(row.created_at.replace(' ', 'T') + 'Z').toISOString(),
  };
}
export function mysqlRepository(pool: Pool): SignatureRepository {
  return {
    async list(limit, cursor) {
      const [rows] = await pool.execute<SignatureRow[]>(
        `SELECT * FROM signatures WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 365 DAY ${cursor ? 'AND id < ?' : ''} ORDER BY id DESC LIMIT ?`,
        cursor ? [cursor, limit + 1] : [limit + 1],
      );
      const hasMore = rows.length > limit;
      const data = rows.slice(0, limit).map(serialize);
      return {
        data,
        pagination: {
          limit,
          hasMore,
          nextCursor: hasMore ? data[data.length - 1].id : null,
        },
      };
    },
    async create(input) {
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'INSERT INTO signatures (name,kind,color,font,strokes) VALUES (?,?,?,?,?)',
          [
            input.name,
            input.kind,
            input.color,
            input.font,
            input.kind === 'drawing' ? JSON.stringify(input.strokes) : null,
          ],
        );
        const [rows] = await connection.query<SignatureRow[]>(
          'SELECT * FROM signatures WHERE id = LAST_INSERT_ID()',
        );
        return serialize(rows[0]);
      } finally {
        connection.release();
      }
    },
    async remove(id) {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM signatures WHERE id = ?',
        [id],
      );
      return result.affectedRows > 0;
    },
  };
}
