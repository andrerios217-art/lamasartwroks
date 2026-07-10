import { DEFAULT_CONTENT } from "./default-content.js";

const MAX_GALLERY_ITEMS = 30;
const MAX_TEXT = 4000;

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cleanText(value, fallback = "", max = MAX_TEXT) {
  if (typeof value !== "string") return fallback;
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

function cleanImagePath(value) {
  const path = cleanText(value, "", 500);
  if (!path) return "";
  return /^\/media\/uploads\/[a-zA-Z0-9/_\-.]+$/.test(path) ? path : "";
}

function cleanLanguageBlock(value, fallback) {
  const source = value && typeof value === "object" ? value : {};
  return {
    role: cleanText(source.role, fallback.role, 160),
    kicker: cleanText(source.kicker, fallback.kicker, 80),
    quote: cleanText(source.quote, fallback.quote, 220),
    highlight: cleanText(source.highlight, fallback.highlight, 220),
    bio: cleanText(source.bio, fallback.bio, 4000),
    photoAlt: cleanText(source.photoAlt, fallback.photoAlt, 240)
  };
}

function cleanGalleryLanguage(value, fallback) {
  const source = value && typeof value === "object" ? value : {};
  return {
    title: cleanText(source.title, fallback.title, 120),
    subtitle: cleanText(source.subtitle, fallback.subtitle, 220),
    alt: cleanText(source.alt, fallback.alt, 240)
  };
}

export function normalizeContent(input) {
  const source = input && typeof input === "object" ? input : {};
  const site = source.site && typeof source.site === "object" ? source.site : {};
  const about = source.about && typeof source.about === "object" ? source.about : {};
  const sourceGallery = Array.isArray(source.gallery) ? source.gallery.slice(0, MAX_GALLERY_ITEMS) : [];

  const gallery = sourceGallery.map((item, index) => {
    const fallback = DEFAULT_CONTENT.gallery[index % DEFAULT_CONTENT.gallery.length];
    const sourceItem = item && typeof item === "object" ? item : {};
    const rawId = cleanText(sourceItem.id, `work-${index + 1}`, 80).toLowerCase();
    const id = rawId.replace(/[^a-z0-9_-]/g, "-") || `work-${index + 1}`;
    return {
      id,
      image: cleanImagePath(sourceItem.image),
      positionX: clampNumber(sourceItem.positionX, 0, 100, 50),
      positionY: clampNumber(sourceItem.positionY, 0, 100, 50),
      "pt-BR": cleanGalleryLanguage(sourceItem["pt-BR"], fallback["pt-BR"]),
      en: cleanGalleryLanguage(sourceItem.en, fallback.en)
    };
  });

  return {
    version: 1,
    site: {
      artistName: cleanText(site.artistName, DEFAULT_CONTENT.site.artistName, 120),
      instagramUrl: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?(?:\?.*)?$/.test(cleanText(site.instagramUrl, "", 500))
        ? cleanText(site.instagramUrl, DEFAULT_CONTENT.site.instagramUrl, 500)
        : DEFAULT_CONTENT.site.instagramUrl,
      commissionsOpen: Boolean(site.commissionsOpen),
      commissionStatus: {
        "pt-BR": cleanText(site.commissionStatus?.["pt-BR"], DEFAULT_CONTENT.site.commissionStatus["pt-BR"], 160),
        en: cleanText(site.commissionStatus?.en, DEFAULT_CONTENT.site.commissionStatus.en, 160)
      }
    },
    about: {
      image: cleanImagePath(about.image),
      positionX: clampNumber(about.positionX, 0, 100, 50),
      positionY: clampNumber(about.positionY, 0, 100, 50),
      "pt-BR": cleanLanguageBlock(about["pt-BR"], DEFAULT_CONTENT.about["pt-BR"]),
      en: cleanLanguageBlock(about.en, DEFAULT_CONTENT.about.en)
    },
    gallery: gallery.length ? gallery : structuredClone(DEFAULT_CONTENT.gallery)
  };
}

export async function ensureSchema(env) {
  if (!env.DB) throw new Error("Binding D1 DB não configurado.");
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS site_content (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

export async function getSiteContent(env) {
  await ensureSchema(env);
  const row = await env.DB.prepare("SELECT content FROM site_content WHERE id = ?")
    .bind("main")
    .first();

  if (!row?.content) {
    const seeded = normalizeContent(DEFAULT_CONTENT);
    await env.DB.prepare("INSERT OR REPLACE INTO site_content (id, content, updated_at) VALUES (?, ?, ?)")
      .bind("main", JSON.stringify(seeded), new Date().toISOString())
      .run();
    return seeded;
  }

  try {
    return normalizeContent(JSON.parse(row.content));
  } catch {
    return normalizeContent(DEFAULT_CONTENT);
  }
}

export async function saveSiteContent(env, input) {
  await ensureSchema(env);
  const normalized = normalizeContent(input);
  await env.DB.prepare("INSERT OR REPLACE INTO site_content (id, content, updated_at) VALUES (?, ?, ?)")
    .bind("main", JSON.stringify(normalized), new Date().toISOString())
    .run();
  return normalized;
}
