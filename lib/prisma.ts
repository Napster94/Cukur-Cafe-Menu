import { randomUUID } from 'crypto';
import { rawDb } from './db-core';

const newId = () => randomUUID();
const nowIso = () => new Date().toISOString();
const b = (v: unknown) => (v ? 1 : 0);

// ---------- Dietary tags & allergens (shared helpers) ----------

function getDietaryTagsForItem(itemId: string) {
  return rawDb
    .prepare(
      `SELECT dt.* FROM DietaryTag dt
       JOIN MenuItemDietaryTag link ON link.dietaryTagId = dt.id
       WHERE link.menuItemId = ? ORDER BY dt.name ASC`,
    )
    .all(itemId) as { id: string; name: string }[];
}

function getAllergensForItem(itemId: string) {
  return rawDb
    .prepare(
      `SELECT a.* FROM Allergen a
       JOIN MenuItemAllergen link ON link.allergenId = a.id
       WHERE link.menuItemId = ? ORDER BY a.name ASC`,
    )
    .all(itemId) as { id: string; name: string }[];
}

function linkDietaryTag(itemId: string, tagId: string) {
  rawDb
    .prepare('INSERT OR IGNORE INTO MenuItemDietaryTag (menuItemId, dietaryTagId) VALUES (?, ?)')
    .run(itemId, tagId);
}

function linkAllergen(itemId: string, allergenId: string) {
  rawDb.prepare('INSERT OR IGNORE INTO MenuItemAllergen (menuItemId, allergenId) VALUES (?, ?)').run(itemId, allergenId);
}

// ---------- Category ----------

function mapCategory(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    order: row.order,
    active: !!row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function categoryFindUnique(where: any): any {
  let row: any;
  if (where.slug !== undefined) row = rawDb.prepare('SELECT * FROM Category WHERE slug = ?').get(where.slug);
  else if (where.id !== undefined) row = rawDb.prepare('SELECT * FROM Category WHERE id = ?').get(where.id);
  return mapCategory(row);
}

function menuItemFindManySync(args: any = {}): any[] {
  const { where = {}, orderBy, take } = args;
  const conds: string[] = [];
  const params: any[] = [];
  if (where.categoryId !== undefined) {
    conds.push('categoryId = ?');
    params.push(where.categoryId);
  }
  if (where.available !== undefined) {
    conds.push('available = ?');
    params.push(b(where.available));
  }
  if (where.popular !== undefined) {
    conds.push('popular = ?');
    params.push(b(where.popular));
  }

  let sql = 'SELECT * FROM MenuItem';
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');

  const orderArr = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [{ order: 'asc' }];
  const orderClauses = orderArr.map((ob: any) => {
    const [field, dir] = Object.entries(ob)[0] as [string, string];
    const col = field === 'order' ? '"order"' : field;
    return `${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
  });
  sql += ' ORDER BY ' + orderClauses.join(', ');
  if (take) sql += ` LIMIT ${Number(take)}`;

  const rows = rawDb.prepare(sql).all(...params) as any[];
  return rows.map(hydrateMenuItem);
}

function hydrateMenuItem(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    available: !!row.available,
    popular: !!row.popular,
    isNew: !!row.isNew,
    order: row.order,
    categoryId: row.categoryId,
    category: categoryFindUnique({ id: row.categoryId }),
    dietaryTags: getDietaryTagsForItem(row.id),
    allergens: getAllergensForItem(row.id),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const category = {
  async findMany(args: any = {}) {
    const { where = {}, include } = args;
    const conds: string[] = [];
    const params: any[] = [];
    if (where.active !== undefined) {
      conds.push('active = ?');
      params.push(b(where.active));
    }
    let sql = 'SELECT * FROM Category';
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY "order" ASC';
    const rows = rawDb.prepare(sql).all(...params) as any[];
    return rows.map((row) => {
      const cat = mapCategory(row) as any;
      if (include?.items) {
        cat.items = menuItemFindManySync({
          where: { categoryId: cat.id, ...(include.items.where ?? {}) },
          orderBy: include.items.orderBy,
        });
      }
      return cat;
    });
  },

  async findUnique(args: any) {
    return categoryFindUnique(args.where);
  },

  async create(args: any) {
    const { data } = args;
    const id = newId();
    const now = nowIso();
    rawDb
      .prepare('INSERT INTO Category (id, name, slug, "order", active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, data.name, data.slug, data.order ?? 0, data.active === undefined ? 1 : b(data.active), now, now);
    return categoryFindUnique({ id });
  },

  async update(args: any) {
    const { where, data } = args;
    const sets: string[] = [];
    const params: any[] = [];
    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }
    if (data.active !== undefined) {
      sets.push('active = ?');
      params.push(b(data.active));
    }
    if (data.order !== undefined) {
      sets.push('"order" = ?');
      params.push(data.order);
    }
    sets.push('updatedAt = ?');
    params.push(nowIso());
    params.push(where.id);
    rawDb.prepare(`UPDATE Category SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return categoryFindUnique({ id: where.id });
  },

  async delete(args: any) {
    rawDb.prepare('DELETE FROM Category WHERE id = ?').run(args.where.id);
    return { id: args.where.id };
  },

  async aggregate(_args: any) {
    const row = rawDb.prepare('SELECT MAX("order") as m FROM Category').get() as any;
    return { _max: { order: row.m } };
  },

  async count() {
    return (rawDb.prepare('SELECT COUNT(*) as c FROM Category').get() as any).c;
  },

  async upsert(args: any) {
    const { where, update, create } = args;
    const existing = where.slug !== undefined ? categoryFindUnique({ slug: where.slug }) : null;
    if (existing) return category.update({ where: { id: existing.id }, data: update });
    return category.create({ data: create });
  },
};

// ---------- MenuItem ----------

function menuItemFindUnique(where: any) {
  const row = rawDb.prepare('SELECT * FROM MenuItem WHERE id = ?').get(where.id) as any;
  return row ? hydrateMenuItem(row) : null;
}

const menuItem = {
  async findMany(args: any = {}) {
    return menuItemFindManySync(args);
  },

  async findFirst(args: any = {}) {
    const { where = {} } = args;
    const conds: string[] = [];
    const params: any[] = [];
    if (where.name !== undefined) {
      conds.push('name = ?');
      params.push(where.name);
    }
    if (where.categoryId !== undefined) {
      conds.push('categoryId = ?');
      params.push(where.categoryId);
    }
    const sql = 'SELECT * FROM MenuItem' + (conds.length ? ' WHERE ' + conds.join(' AND ') : '') + ' LIMIT 1';
    const row = rawDb.prepare(sql).get(...params) as any;
    return row ? hydrateMenuItem(row) : null;
  },

  async create(args: any) {
    const { data } = args;
    const id = newId();
    const now = nowIso();
    rawDb
      .prepare(
        `INSERT INTO MenuItem (id, name, description, price, image, available, popular, isNew, "order", categoryId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        data.name,
        data.description ?? null,
        data.price,
        data.image ?? null,
        data.available === undefined ? 1 : b(data.available),
        b(data.popular),
        b(data.isNew),
        data.order ?? 0,
        data.categoryId,
        now,
        now,
      );
    if (data.dietaryTags?.connect) for (const t of data.dietaryTags.connect) linkDietaryTag(id, t.id);
    if (data.allergens?.connect) for (const a of data.allergens.connect) linkAllergen(id, a.id);
    return menuItemFindUnique({ id });
  },

  async update(args: any) {
    const { where, data } = args;
    const sets: string[] = [];
    const params: any[] = [];
    const scalarMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      image: 'image',
      categoryId: 'categoryId',
      order: '"order"',
    };
    for (const [key, col] of Object.entries(scalarMap)) {
      if (data[key] !== undefined) {
        sets.push(`${col} = ?`);
        params.push(data[key]);
      }
    }
    for (const boolField of ['available', 'popular', 'isNew']) {
      if (data[boolField] !== undefined) {
        sets.push(`${boolField} = ?`);
        params.push(b(data[boolField]));
      }
    }
    sets.push('updatedAt = ?');
    params.push(nowIso());
    params.push(where.id);
    rawDb.prepare(`UPDATE MenuItem SET ${sets.join(', ')} WHERE id = ?`).run(...params);

    if (data.dietaryTags?.set) {
      rawDb.prepare('DELETE FROM MenuItemDietaryTag WHERE menuItemId = ?').run(where.id);
      for (const t of data.dietaryTags.set) linkDietaryTag(where.id, t.id);
    }
    if (data.allergens?.set) {
      rawDb.prepare('DELETE FROM MenuItemAllergen WHERE menuItemId = ?').run(where.id);
      for (const a of data.allergens.set) linkAllergen(where.id, a.id);
    }

    return menuItemFindUnique({ id: where.id });
  },

  async delete(args: any) {
    rawDb.prepare('DELETE FROM MenuItem WHERE id = ?').run(args.where.id);
    return { id: args.where.id };
  },

  async count(args: any = {}) {
    const { where = {} } = args;
    const conds: string[] = [];
    const params: any[] = [];
    if (where.available !== undefined) {
      conds.push('available = ?');
      params.push(b(where.available));
    }
    if (where.popular !== undefined) {
      conds.push('popular = ?');
      params.push(b(where.popular));
    }
    if (where.categoryId !== undefined) {
      conds.push('categoryId = ?');
      params.push(where.categoryId);
    }
    const sql = 'SELECT COUNT(*) as c FROM MenuItem' + (conds.length ? ' WHERE ' + conds.join(' AND ') : '');
    return (rawDb.prepare(sql).get(...params) as any).c;
  },

  async aggregate(args: any = {}) {
    const { where = {} } = args;
    const conds: string[] = [];
    const params: any[] = [];
    if (where.categoryId !== undefined) {
      conds.push('categoryId = ?');
      params.push(where.categoryId);
    }
    const sql = 'SELECT MAX("order") as m FROM MenuItem' + (conds.length ? ' WHERE ' + conds.join(' AND ') : '');
    const row = rawDb.prepare(sql).get(...params) as any;
    return { _max: { order: row.m } };
  },
};

// ---------- DietaryTag & Allergen ----------

const dietaryTag = {
  async findMany(_args?: any) {
    return rawDb.prepare('SELECT * FROM DietaryTag ORDER BY name ASC').all();
  },
  async upsert(args: any) {
    const { where, create } = args;
    const existing = rawDb.prepare('SELECT * FROM DietaryTag WHERE name = ?').get(where.name) as any;
    if (existing) return existing;
    const id = newId();
    rawDb.prepare('INSERT INTO DietaryTag (id, name) VALUES (?, ?)').run(id, create.name);
    return { id, name: create.name };
  },
};

const allergen = {
  async findMany(_args?: any) {
    return rawDb.prepare('SELECT * FROM Allergen ORDER BY name ASC').all();
  },
  async upsert(args: any) {
    const { where, create } = args;
    const existing = rawDb.prepare('SELECT * FROM Allergen WHERE name = ?').get(where.name) as any;
    if (existing) return existing;
    const id = newId();
    rawDb.prepare('INSERT INTO Allergen (id, name) VALUES (?, ?)').run(id, create.name);
    return { id, name: create.name };
  },
};

// ---------- CafeSettings ----------

const SETTINGS_FIELDS = [
  'name',
  'tagline',
  'logoUrl',
  'description',
  'address',
  'phone',
  'hours',
  'instagram',
  'facebook',
  'currency',
];

const cafeSettings = {
  async upsert(args: any = {}) {
    const { update = {}, create = {} } = args;
    const existing = rawDb.prepare('SELECT * FROM CafeSettings WHERE id = 1').get() as any;
    if (existing) {
      const sets: string[] = [];
      const params: any[] = [];
      for (const f of SETTINGS_FIELDS) {
        if (update[f] !== undefined) {
          sets.push(`${f} = ?`);
          params.push(update[f]);
        }
      }
      if (sets.length) {
        params.push(1);
        rawDb.prepare(`UPDATE CafeSettings SET ${sets.join(', ')} WHERE id = 1`).run(...params);
      }
      return rawDb.prepare('SELECT * FROM CafeSettings WHERE id = 1').get();
    }
    const data: any = { name: 'Çukur Café', tagline: 'Good Drinks, Good Food, Good Mood', currency: '$', ...create };
    rawDb
      .prepare(
        `INSERT INTO CafeSettings (id, name, tagline, logoUrl, description, address, phone, hours, instagram, facebook, currency)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.name,
        data.tagline ?? null,
        data.logoUrl ?? null,
        data.description ?? null,
        data.address ?? null,
        data.phone ?? null,
        data.hours ?? null,
        data.instagram ?? null,
        data.facebook ?? null,
        data.currency ?? '$',
      );
    return rawDb.prepare('SELECT * FROM CafeSettings WHERE id = 1').get();
  },
};

// ---------- Admin ----------

type AdminRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
};

const admin = {
  async findUnique(args: any): Promise<AdminRow | null> {
    return (rawDb.prepare('SELECT * FROM Admin WHERE email = ?').get(args.where.email) as AdminRow | undefined) ?? null;
  },
  async findById(id: string): Promise<AdminRow | null> {
    return (rawDb.prepare('SELECT * FROM Admin WHERE id = ?').get(id) as AdminRow | undefined) ?? null;
  },
  async updatePassword(id: string, passwordHash: string) {
    rawDb.prepare('UPDATE Admin SET passwordHash = ? WHERE id = ?').run(passwordHash, id);
  },
  async upsert(args: any): Promise<AdminRow> {
    const { where, create } = args;
    const existing = rawDb.prepare('SELECT * FROM Admin WHERE email = ?').get(where.email) as AdminRow | undefined;
    if (existing) return existing;
    const id = newId();
    rawDb
      .prepare('INSERT INTO Admin (id, name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, create.name, create.email, create.passwordHash, create.role ?? 'admin', nowIso());
    return { id, name: create.name, email: create.email, passwordHash: create.passwordHash, role: create.role ?? 'admin', createdAt: nowIso() };
  },
};

// ---------- Transactions ----------
// Our facade executes each operation synchronously/eagerly (like real Prisma's
// lazy promises, but resolved immediately since there's no real async I/O here),
// so $transaction just needs to await the already-run operations together.
async function $transaction(ops: Promise<any>[]) {
  return Promise.all(ops);
}

export const prisma = {
  category,
  menuItem,
  dietaryTag,
  allergen,
  cafeSettings,
  admin,
  $transaction,
};
