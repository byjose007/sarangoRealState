import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Lightweight, zero-dependency ISO/IEC 18004 QR Code SVG generator (Byte mode, ECC Level L).
 * Supports versions 1–6 (up to 134 UTF-8 bytes), ideal for URLs and WhatsApp deep links
 * on digital signage screens without relying on external image APIs.
 */

interface VersionInfo {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewords: number;
  alignment: number[];
}

const VERSIONS: VersionInfo[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, alignment: [] },
  { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, alignment: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, alignment: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, alignment: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, ecCodewords: 26, alignment: [6, 30] },
  { version: 6, size: 41, dataCodewords: 136, ecCodewords: 18, alignment: [6, 34] }, // 2 blocks of (68 data, 18 ec)
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    for (let k = 0; k < ecLen - 1; k++) {
      rem[k] = rem[k + 1];
    }
    rem[ecLen - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j++) {
        rem[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return rem;
}

function toUtf8Bytes(text: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  const encoded = unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    bytes[i] = encoded.charCodeAt(i);
  }
  return bytes;
}

function encodeQrMatrix(text: string): boolean[][] {
  const bytes = toUtf8Bytes(text);
  const info =
    VERSIONS.find((v) => bytes.length + 2 <= v.dataCodewords) ?? VERSIONS[VERSIONS.length - 1];
  const payload = bytes.slice(0, info.dataCodewords - 2);

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Byte mode indicator (0100) + character count (8 bits for versions 1–9)
  pushBits(0b0100, 4);
  pushBits(payload.length, 8);
  for (const b of payload) pushBits(b, 8);

  const maxBits = info.dataCodewords * 8;
  const terminator = Math.min(4, maxBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = new Uint8Array(info.dataCodewords);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    data[i] = byte;
  }
  const padBytes = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < info.dataCodewords; i++, p++) {
    data[i] = padBytes[p % 2];
  }

  let finalCodewords: number[] = [];
  if (info.version < 6) {
    const ec = rsEncode(data, info.ecCodewords);
    finalCodewords = [...Array.from(data), ...Array.from(ec)];
  } else {
    // Version 6-L uses 2 blocks of 68 data codewords + 18 EC codewords each
    const b1 = data.slice(0, 68);
    const b2 = data.slice(68, 136);
    const ec1 = rsEncode(b1, info.ecCodewords);
    const ec2 = rsEncode(b2, info.ecCodewords);
    for (let i = 0; i < 68; i++) {
      finalCodewords.push(b1[i], b2[i]);
    }
    for (let i = 0; i < info.ecCodewords; i++) {
      finalCodewords.push(ec1[i], ec2[i]);
    }
  }

  const size = info.size;
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setModule = (r: number, c: number, dark: boolean, markReserved = true) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    modules[r][c] = dark;
    if (markReserved) reserved[r][c] = true;
  };

  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(row + r, col + c, inOuter && (onBorder || inInner));
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns
  const align = info.alignment;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      const ar = align[i];
      const ac = align[j];
      if (reserved[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          setModule(ar + r, ac + c, dark);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // Dark module + reserve format areas
  setModule(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (i < size) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  // Place data bits (upward/downward 2-column zigzag)
  const allBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
  }

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!reserved[row][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          // Apply mask 0: (row + c) % 2 === 0
          const masked = (row + c) % 2 === 0 ? !bit : bit;
          modules[row][c] = masked;
        }
      }
    }
    upward = !upward;
  }

  // Format information for ECC Level L (01) + Mask 0 (000) => 0x77c4
  const formatBits = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >> i) & 1) === 1;
    // Around top-left finder (i=0 is LSB at (0,8), i=14 is MSB at (8,0))
    if (i < 6) setModule(i, 8, bit);
    else if (i < 8) setModule(i + 1, 8, bit);
    else if (i === 8) setModule(8, 7, bit);
    else setModule(8, 14 - i, bit);

    // Split across top-right (row 8, i=0..7) and bottom-left (col 8, i=8..14)
    if (i < 8) setModule(8, size - 1 - i, bit);
    else setModule(size - 15 + i, 8, bit);
  }

  return modules;
}

interface QrCodeSvgProps {
  value: string;
  className?: string;
}

export function QrCodeSvg({ value, className }: QrCodeSvgProps) {
  const matrix = React.useMemo(() => encodeQrMatrix(value), [value]);
  const size = matrix.length;
  const quietZone = 3;
  const total = size + quietZone * 2;

  const pathData = React.useMemo(() => {
    const parts: string[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          parts.push(`M${c + quietZone},${r + quietZone}h1v1h-1z`);
        }
      }
    }
    return parts.join('');
  }, [matrix, size]);

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Código QR"
      className={cn('rounded-lg bg-white', className)}
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      <path d={pathData} fill="#0A0F0D" />
    </svg>
  );
}
