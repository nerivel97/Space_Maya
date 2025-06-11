// src/models/word.js
import pool from '../config/db.js';

export async function getAllWords(filter = {}) {
  const { length, search } = filter;

  let query = 'SELECT * FROM palabras_maya WHERE 1=1';
  const params = [];

  if (length) {
    query += ' AND longitud_es = ?';
    params.push(length);
  }

  if (search) {
    query += ' AND (palabra_es LIKE ? OR palabra_maya LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.execute(query, params);
  return rows;
}

export async function getWordById(id) {
  const [rows] = await pool.execute('SELECT * FROM palabras_maya WHERE id = ?', [id]);
  return rows[0];
}

export async function createWord({ palabra_es, palabra_maya }) {
  const longitud_es = palabra_es.length;
  const [result] = await pool.execute(
    'INSERT INTO palabras_maya (palabra_es, palabra_maya, longitud_es) VALUES (?, ?, ?)',
    [palabra_es, palabra_maya, longitud_es]
  );
  return { id: result.insertId, palabra_es, palabra_maya, longitud_es };
}

export async function updateWord(id, { palabra_es, palabra_maya }) {
  const updates = [];
  const params = [];

  if (palabra_es) {
    updates.push('palabra_es = ?');
    params.push(palabra_es);
    updates.push('longitud_es = ?');
    params.push(palabra_es.length);
  }
  if (palabra_maya) {
    updates.push('palabra_maya = ?');
    params.push(palabra_maya);
  }
  params.push(id);

  const query = `UPDATE palabras_maya SET ${updates.join(', ')} WHERE id = ?`;
  await pool.execute(query, params);

  return getWordById(id);
}

export async function deleteWord(id) {
  await pool.execute('DELETE FROM palabras_maya WHERE id = ?', [id]);
}
