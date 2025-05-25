import pool from '../config/db.js';

class Myth {
  static async findAll({ page = 1, limit = 10, search, category, region, culture }) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, 
        u.username AS author
      FROM myths_legends m
      LEFT JOIN users u ON m.created_by = u.id
    `;
    
    const whereClauses = [];
    const params = [];
    
    if (search) {
      whereClauses.push('(m.title LIKE ? OR m.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category) {
      whereClauses.push('m.category = ?');
      params.push(category);
    }
    
    if (region) {
      whereClauses.push('m.origin_region = ?');
      params.push(region);
    }
    
    if (culture) {
      whereClauses.push('m.origin_culture = ?');
      params.push(culture);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [myths] = await pool.execute(query, params);
    
    // Consulta para el total
    let countQuery = 'SELECT COUNT(*) as total FROM myths_legends m';
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    const [totalResult] = await pool.execute(countQuery, params.slice(0, -2));
    const total = totalResult[0].total;
    
    return {
      data: myths,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  }

  static async findById(id) {
    const [myth] = await pool.execute(`
      SELECT m.*, 
        u.username AS author,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'image_url', i.image_url,
            'caption', i.caption,
            'is_primary', i.is_primary
          )
        ) FROM myth_images i WHERE i.myth_id = m.id
      ) AS images,
      (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', v.id,
          'version_title', v.version_title,
          'version_content', v.version_content,
          'language', v.language,
          'contributor', v.contributor,
          'created_at', v.created_at
        )
      ) FROM myth_versions v WHERE v.myth_id = m.id
      ) AS versions
      FROM myths_legends m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
      GROUP BY m.id
    `, [id]);
    
    if (myth.length === 0) return null;
    
    return {
      ...myth[0],
      images: myth[0].images ? JSON.parse(myth[0].images) : [],
      versions: myth[0].versions ? JSON.parse(myth[0].versions) : []
    };
  }

  static async create({
    title,
    content,
    origin_region,
    origin_culture,
    category,
    estimated_origin_year,
    is_verified,
    featured_image,
    images,
    created_by
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const [result] = await conn.execute(
        `INSERT INTO myths_legends 
        (title, content, origin_region, origin_culture, category, 
         estimated_origin_year, is_verified, featured_image, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          content,
          origin_region,
          origin_culture,
          category,
          estimated_origin_year,
          is_verified,
          featured_image,
          created_by
        ]
      );
      
      const mythId = result.insertId;
      
      // Procesar imágenes
      if (images && images.length > 0) {
        await this.processImages(conn, mythId, images);
      }
      
      await conn.commit();
      return mythId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, {
    title,
    content,
    origin_region,
    origin_culture,
    category,
    estimated_origin_year,
    is_verified,
    featured_image,
    images,
    deleted_images = []
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      await conn.execute(
        `UPDATE myths_legends SET
          title = ?,
          content = ?,
          origin_region = ?,
          origin_culture = ?,
          category = ?,
          estimated_origin_year = ?,
          is_verified = ?,
          featured_image = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          title,
          content,
          origin_region,
          origin_culture,
          category,
          estimated_origin_year,
          is_verified,
          featured_image,
          id
        ]
      );
      
      // Eliminar imágenes marcadas para borrar
      if (deleted_images.length > 0) {
        await conn.execute(
          'DELETE FROM myth_images WHERE id IN (?)',
          [deleted_images]
        );
      }
      
      // Añadir nuevas imágenes
      if (images && images.length > 0) {
        await this.processImages(conn, id, images);
      }
      
      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM myths_legends WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getCategories() {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM myths_legends ORDER BY category'
    );
    return categories.map(c => c.category);
  }

  static async getRegions() {
    const [regions] = await pool.execute(
      'SELECT DISTINCT origin_region FROM myths_legends ORDER BY origin_region'
    );
    return regions.map(r => r.origin_region);
  }

  static async getCultures() {
    const [cultures] = await pool.execute(
      'SELECT DISTINCT origin_culture FROM myths_legends ORDER BY origin_culture'
    );
    return cultures.map(c => c.origin_culture);
  }

  static async processImages(conn, mythId, images) {
    const imageValues = images.map(image => [
      mythId,
      image.image_url,
      image.caption || '',
      image.is_primary || false
    ]);
    
    await conn.query(
      'INSERT INTO myth_images (myth_id, image_url, caption, is_primary) VALUES ?',
      [imageValues]
    );
  }
}

export default Myth;