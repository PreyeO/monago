#!/usr/bin/env node
/**
 * Monago product sync — based on the working test-project implementation.
 *
 * Usage:
 *   npm run sync                  # sync all 21 categories
 *   npm run sync Skincare         # sync one category
 *
 * Token acquisition:
 *   Launches headless Chromium, navigates to the Skincare page, and captures
 *   the first request that carries an Authorization header. Uses that token
 *   for all subsequent API calls. Re-acquires if a 401 is returned.
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

// ---------- env ----------
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) { console.error('.env.local not found'); process.exit(1); }
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0) {
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------- constants ----------
const DEFAULT_MARKUP = 0.3;
const PAGE_SIZE      = 60;
const API_URL        = 'https://www.amway.co.uk/api/dnd/PLP/getUpdatedProductData';
const USER_AGENT     =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const APP_VARIABLES = { languageId: 'en-gb', locale: 'en', localeHyphnd: 'en-gb' };

const CATEGORIES = [
  // Nutrition
  'TargetedFoodSupplements',
  'FoundationalFoodSupplements',
  'WeightManagement',
  'PersonalisedSolutionsForYou',
  'FoodBeverages',
  'SportNutrition',
  'ActiveLifestyle',
  'AccessoriesNutrition',
  // Beauty
  'Make-up',
  'Skincare',
  'AccessoriesBeauty',
  'PersonalisedBeautySolutionsForYou',
  // Home
  'LaundryCare',
  'SurfaceCare',
  'DishCare',
  'SpecialityCleaning',
  'DispensersAndApplicators',
  'CookwareAndCutlery',
  'WaterTreatmentSystem',
  // Personal Care
  'HairCare',
  'OralCare',
  '10054',          // Bath and Body
];

const CODE_TO_SLUG = {
  // Nutrition
  TargetedFoodSupplements:     'targeted-food-supplements',
  FoundationalFoodSupplements: 'foundational-food-supplements',
  WeightManagement:            'weight-management',
  PersonalisedSolutionsForYou: 'personalised-solutions-for-you',
  FoodBeverages:               'food-beverages',
  SportNutrition:              'sports-nutrition',
  ActiveLifestyle:             'active-lifestyle',
  AccessoriesNutrition:        'accessories-nutrition',
  // Beauty
  'Make-up':                               'make-up',
  Skincare:                                'skincare',
  AccessoriesBeauty:                       'accessories-beauty',
  PersonalisedBeautySolutionsForYou:       'personalised-beauty-solutions',
  // Home
  LaundryCare:                 'laundry-care',
  SurfaceCare:                 'surface-care',
  DishCare:                    'dish-care',
  SpecialityCleaning:          'speciality-cleaning',
  DispensersAndApplicators:    'dispensers-and-applicators',
  CookwareAndCutlery:          'cookware',
  WaterTreatmentSystem:        'water-treatment',
  // Personal Care
  HairCare:                    'hair-care',
  OralCare:                    'oral-care',
  '10054':                     'bath-body',
};

// ---------- token ----------
function buildHeaders(token) {
  return {
    'content-type':    'application/json',
    'x-amway-channel': 'web',
    'x-amway-country': 'GB',
    'x-amway-tenant':  '040',
    'origin':          'https://www.amway.co.uk',
    'referer':         'https://www.amway.co.uk/Skincare/c/Skincare',
    'user-agent':      USER_AGENT,
    'authorization':   token,
  };
}

async function obtainAnonymousToken() {
  console.log('Acquiring auth token via headless browser...');
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage({ userAgent: USER_AGENT });

  const tokenPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Timed out waiting for auth token (60s)')),
      60000
    );

    page.on('request', (req) => {
      const auth = req.headers()['authorization'];
      if (!auth) return;
      clearTimeout(timeout);
      // Strip "Bearer " prefix if present — API expects raw JWT
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
      resolve({ token, browser });
    });
  });

  await page.goto('https://www.amway.co.uk/Skincare/c/Skincare', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  return tokenPromise;
}

// ---------- API ----------
async function fetchPage(token, categoryCode, pageNum) {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: buildHeaders(token),
    body:    JSON.stringify({
      appVariables: APP_VARIABLES,
      categoryCode,
      page:       pageNum,
      queryParam: '',
      size:       PAGE_SIZE,
    }),
  });

  if (res.status === 401) return { status: 401 };

  if (!res.ok) {
    const text = await res.text();
    console.warn(`  HTTP ${res.status}: ${text.slice(0, 200)}`);
    return { status: res.status };
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.warn(`  Bad JSON for page ${pageNum}: ${text.slice(0, 120)}`);
    return { status: 0 };
  }
  const categoryData = data.categoryData ?? data.data?.categoryData;
  return {
    status:   200,
    products: categoryData?.products ?? [],
    total:    categoryData?.pagination?.totalResults ?? 0,
  };
}

// PDP data lives in the page HTML (__NEXT_DATA__), not in an API endpoint.
// We HTTP GET the product page and parse the embedded JSON.
async function fetchProductDetail(amwayUrl) {
  if (!amwayUrl) return null;
  const fullUrl = amwayUrl.startsWith('http')
    ? amwayUrl
    : `https://www.amway.co.uk${amwayUrl}`;
  try {
    const res = await fetch(fullUrl, {
      headers: {
        'user-agent':      USER_AGENT,
        'accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-GB,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!match) return null;
    const nextData = JSON.parse(match[1]);
    return nextData?.props?.initialStateOrStore?.PDPState?.productData ?? null;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return typeof html === 'string' ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || null : null;
}

function extractDetail(pdp) {
  if (!pdp) return { overview: null, details: null, features: null, videoUrl: null, extraImages: [] };

  // productSections has the rich Overview + Details HTML from the PDP
  let overviewHtml = null;
  let detailsHtml  = null;
  for (const section of pdp.productSections ?? []) {
    if (!section.visibleOnPDP || !section.content) continue;
    if (section.sectionTypeCode === 'overview') overviewHtml = section.content;
    if (section.sectionTypeCode === 'details')  detailsHtml  = section.content;
  }

  // Fallback overview from description field
  const overview = overviewHtml ?? pdp.description ?? pdp.longDescription ?? null;

  // Feature bullet points
  let features = null;
  const rawFeatures = pdp.features ?? pdp.featureList ?? pdp.classifications?.[0]?.features ?? null;
  if (Array.isArray(rawFeatures) && rawFeatures.length) {
    features = rawFeatures
      .map((f) => (typeof f === 'string' ? f : f.name ?? f.featureValues?.[0]?.value))
      .filter(Boolean)
      .map(stripHtml)
      .filter(Boolean);
    if (!features.length) features = null;
  }

  // Extra images from amwayGallery — renditions have no format field; match by filename size token
  const extraImages = [];
  const seen = new Set();
  for (const gallery of pdp.amwayGallery ?? []) {
    if (gallery.type !== 'IMAGE') continue;
    const renditions = gallery.renditions ?? [];
    // Prefer 600_600, fallback to 800_800, fallback to first rendition
    const best =
      renditions.find((r) => r?.url?.includes('_600_600')) ??
      renditions.find((r) => r?.url?.includes('_800_800')) ??
      renditions[0];
    if (best?.url) {
      const u = best.url.startsWith('http') ? best.url : `https://media.mlp.amway.eu${best.url}`;
      if (!seen.has(u)) { seen.add(u); extraImages.push(u); }
    }
  }

  // Video URL — check amwayGallery VIDEO entries first (mp4), then fall back to YouTube/Vimeo
  let videoUrl = null;
  for (const gallery of pdp.amwayGallery ?? []) {
    if (gallery.type !== 'VIDEO') continue;
    const mp4 = (gallery.renditions ?? []).find((r) => r?.url?.endsWith('.mp4'));
    if (mp4?.url) { videoUrl = mp4.url; break; }
  }
  if (!videoUrl) {
    for (const m of [...(pdp.media ?? []), ...(pdp.videos ?? [])]) {
      const url = m?.url ?? m?.embedUrl ?? m?.videoUrl ?? '';
      if (url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo'))) {
        videoUrl = url;
        break;
      }
    }
  }

  return {
    overview: overviewHtml ?? (typeof overview === 'string' ? overview : null),
    details:  detailsHtml,
    features,
    videoUrl,
    extraImages,
  };
}

async function fetchCategory(token, categoryCode) {
  const products = [];

  for (let pageNum = 0; ; pageNum++) {
    let result = await fetchPage(token, categoryCode, pageNum);

    // Retry once on transient empty/bad response
    if (result.status === 0) {
      await new Promise((r) => setTimeout(r, 2000));
      result = await fetchPage(token, categoryCode, pageNum);
    }

    if (result.status === 401) return { products, expired: true };
    if (result.status !== 200)  break;
    if (!result.products.length) break;

    products.push(...result.products);

    const total = result.total || result.products.length;
    if (products.length >= total || result.products.length < PAGE_SIZE) break;
  }

  return { products, expired: false };
}

// ---------- normalise ----------
function extractImageUrls(product) {
  const urls = new Set();

  // Only take "product" format (600×600) — skip thumbnails, tablets etc.
  const productImages = (product.images ?? []).filter((img) => img?.format === 'product');
  if (productImages.length > 0) {
    for (const img of productImages) {
      if (img?.url) {
        const u = img.url.startsWith('http') ? img.url : `https://media.mlp.amway.eu${img.url}`;
        urls.add(u);
      }
    }
  } else {
    // Fallback: take all images if none are tagged "product"
    for (const img of product.images ?? []) {
      if (img?.url) {
        const u = img.url.startsWith('http') ? img.url : `https://media.mlp.amway.eu${img.url}`;
        urls.add(u);
      }
    }
  }

  // Also pick up gallery renditions at "product" quality
  for (const gallery of product.amwayGallery ?? []) {
    for (const rendition of (gallery.renditions ?? []).filter((r) => r?.format === 'product')) {
      if (rendition?.url) {
        const u = rendition.url.startsWith('http')
          ? rendition.url
          : `https://media.mlp.amway.eu${rendition.url}`;
        urls.add(u);
      }
    }
  }

  return [...urls];
}

function parsePriceGBP(val) {
  if (val == null) return null;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

function normalise(raw, categoryCode) {
  const code = raw.code;
  if (!code) return null;

  const brand = typeof raw.brand === 'string'
    ? raw.brand
    : (raw.brand?.name ?? null);

  const description =
    raw.description ??
    raw.summary ??
    raw.shortDescription ??
    raw.longDescription ??
    null;

  // Label names — strip any Amway-branded labels before storing
  const labels = (raw.amwayLabels ?? [])
    .filter((l) => l?.name && !l.name.toLowerCase().includes('amway'))
    .map((l) => l.name)
    .filter(Boolean);

  return {
    code,
    name:        raw.name        ?? null,
    brand,
    description: typeof description === 'string' ? description.replace(/<[^>]*>/g, '').trim() || null : null,
    size:        raw.amwaySize   ?? null,
    labels:      labels.length   ? labels : null,
    sourcePrice: parsePriceGBP(raw.price?.formattedValue ?? raw.price?.value),
    imageUrls:   extractImageUrls(raw),
    amwayUrl:    raw.url ?? `/p/${code}`,
    categoryCode,
  };
}

// ---------- supabase ----------
const slugCache = {};
async function getCategoryId(slug) {
  if (slug in slugCache) return slugCache[slug];
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();
  slugCache[slug] = data?.id ?? null;
  return slugCache[slug];
}

async function upsertProduct(p) {
  const slug       = CODE_TO_SLUG[p.categoryCode];
  const categoryId = slug ? await getCategoryId(slug) : null;
  const now        = new Date().toISOString();

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('amway_code', p.code)
    .single();

  if (existing) {
    await supabase
      .from('products')
      .update({
        name:           p.name,
        brand:          p.brand,
        description:    p.description ?? null,
        overview:       p.overview    ?? null,
        details:        p.details     ?? null,
        features:       p.features    ?? null,
        video_url:      p.videoUrl    ?? null,
        size:           p.size        ?? null,
        labels:         p.labels      ?? null,
        source_price:   p.sourcePrice,
        image_urls:     p.imageUrls,
        amway_url:      p.amwayUrl,
        category_id:    categoryId,
        last_synced_at: now,
      })
      .eq('amway_code', p.code);
    return 'updated';
  }

  await supabase.from('products').insert({
    amway_code:     p.code,
    name:           p.name,
    brand:          p.brand,
    description:    p.description ?? null,
    overview:       p.overview    ?? null,
    details:        p.details     ?? null,
    features:       p.features    ?? null,
    video_url:      p.videoUrl    ?? null,
    size:           p.size        ?? null,
    labels:         p.labels      ?? null,
    source_price:   p.sourcePrice,
    selling_price:  p.sourcePrice != null
      ? parseFloat((p.sourcePrice * (1 + DEFAULT_MARKUP)).toFixed(2))
      : null,
    image_urls:     p.imageUrls,
    amway_url:      p.amwayUrl,
    category_id:    categoryId,
    is_active:      true,
    stock_status:   'inStock',
    last_synced_at: now,
  });
  return 'inserted';
}

// ---------- main ----------
async function main() {
  console.log('Monago product sync starting...\n');

  const categoryFilter = process.argv[2] ?? null;
  const targets = categoryFilter
    ? CATEGORIES.filter((c) => c.toLowerCase() === categoryFilter.toLowerCase())
    : CATEGORIES;

  if (targets.length === 0) {
    console.error(`Unknown category: "${categoryFilter}"`);
    console.error(`Valid: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  let { token, browser } = await obtainAnonymousToken();
  console.log('Token acquired.\n');

  const allNormalised = [];
  let totalInserted   = 0;
  let totalUpdated    = 0;

  try {
    for (const categoryCode of targets) {
      process.stdout.write(`Fetching ${categoryCode}... `);

      let result = await fetchCategory(token, categoryCode);

      if (result.expired) {
        console.log('\nToken expired — re-acquiring...');
        await browser.close();
        ({ token, browser } = await obtainAnonymousToken());
        result = await fetchCategory(token, categoryCode);
      }

      process.stdout.write(`${result.products.length} products\n`);
      if (!result.products.length) continue;

      const normalised = result.products.map((p) => normalise(p, categoryCode)).filter(Boolean);
      allNormalised.push(...normalised);

      let inserted = 0, updated = 0;
      for (const p of normalised) {
        // Fetch richer PDP data from the product page HTML (__NEXT_DATA__)
        const pdpRaw = await fetchProductDetail(p.amwayUrl);
        const detail = extractDetail(pdpRaw);
        if (detail.overview)      p.overview  = detail.overview;
        if (detail.details)       p.details   = detail.details;
        if (detail.features)      p.features  = detail.features;
        if (detail.videoUrl)      p.videoUrl  = detail.videoUrl;
        // Merge extra PDP images (new angles not in PLP)
        if (detail.extraImages.length) {
          const existing = new Set(p.imageUrls);
          for (const u of detail.extraImages) if (!existing.has(u)) p.imageUrls.push(u);
        }
        await new Promise((r) => setTimeout(r, 300)); // be polite

        const outcome = await upsertProduct(p);
        if (outcome === 'inserted') inserted++;
        else updated++;
      }
      console.log(`  Inserted: ${inserted}, Updated: ${updated}`);
      totalInserted += inserted;
      totalUpdated  += updated;

      await new Promise((r) => setTimeout(r, 800));
    }
  } finally {
    await browser.close();
  }

  const outPath = path.resolve(__dirname, 'all-products.json');
  fs.writeFileSync(outPath, JSON.stringify(allNormalised, null, 2));
  console.log(`\nSaved ${allNormalised.length} products → scripts/all-products.json`);
  console.log(`Done. Inserted: ${totalInserted}, Updated: ${totalUpdated}`);
}

main().catch((err) => {
  console.error('\nSync failed:', err.message ?? err);
  process.exit(1);
});
