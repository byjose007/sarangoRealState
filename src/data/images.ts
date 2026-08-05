/**
 * Curated Unsplash photo IDs.
 * Swap these for your own CDN assets — every consumer goes through
 * `components/shared/smart-image.tsx`, which falls back to a seeded
 * placeholder if a remote file ever disappears.
 */
const UNSPLASH = [
  '1568605114967-8130f3a36994',
  '1512917774080-9991f1c4c750',
  '1600596542815-ffad4c1539a9',
  '1580587771525-78b9dba3b914',
  '1570129477492-45c003edd2be',
  '1613490493576-7fde63acd811',
  '1600585154340-be6161a56a0c',
  '1600607687939-ce8a6c25118c',
  '1600566753086-00f18fb6b3ea',
  '1600047509807-ba8f99d2cdde',
  '1600210492486-724fe5c67fb0',
  '1600573472550-8090b5e0745e',
  '1600121848594-d8644e57abab',
  '1616486338812-3dadae4b4ace',
  '1600607687920-4e2a09cf159d',
  '1600585154526-990dced4db0d',
  '1502672260266-1c1ef2d93688',
  '1493809842364-78817add7ffb',
  '1484154218962-a197022b5858',
  '1560448204-e02f11c3d0e2',
  '1522708323590-d24dbb6b0267',
  '1583608205776-bfd35f0d9f83',
  '1554995207-c18c203602cb',
  '1556909212-d5b604d0c90d',
  '1600585152220-90363fe7e115',
  '1605276374104-dee2a0ed3cd6',
  '1512918728675-ed5a9ecdebfd',
  '1449844908441-8829872d2607',
  '1518780664697-55e3ad937233',
  '1564013799919-ab600027ffc6',
  '1523217582562-09d0def993a6',
  '1499793983690-e29da59ef1c2',
  '1505142468610-359e7d316be0',
  '1502005229762-cf1b2da7c5d6',
  '1536376072261-38c75010e6c9',
  '1524758631624-e2822e304c36',
] as const;

export function unsplash(index: number, width = 1200, height = 800) {
  const id = UNSPLASH[Math.abs(index) % UNSPLASH.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=72&h=${height}`;
}

/** Deterministic placeholder used as the on-error fallback. */
export function placeholder(seed: string, width = 1200, height = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function avatar(index: number) {
  return `https://i.pravatar.cc/320?img=${(Math.abs(index) % 70) + 1}`;
}

export const imageCount = UNSPLASH.length;
