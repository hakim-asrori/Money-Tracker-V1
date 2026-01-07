import Tesseract, { createWorker } from 'tesseract.js';
import { REGEX_SOURCE, SOURCES } from './constants';

export async function runOCR(
    imageFile: File,
    onProgress?: (progress: number) => void,
) {
    const worker = await createWorker('eng', Tesseract.OEM.DEFAULT, {
        logger: (m) => {
            if (onProgress) onProgress(m.progress);
        },
    });

    const {
        data: { text },
    } = await worker.recognize(imageFile);

    await worker.terminate();
    return text;
}

export function normalizeText(text: string): string {
    return text
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/,/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function splitLines(text: string): string[] {
    return text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
}

export function scoreLine(line: string, source: string): number {
    let score = 0;

    if (source.toLowerCase() === SOURCES.INDOMARET) {
        // ❌
        if (new RegExp(REGEX_SOURCE.INDOMARET, 'i').test(line)) return 0;

        // ❌ Reject voucher
        if (/^VC\s/i.test(line)) return 0;
    }

    if (source.toLowerCase() === SOURCES.ALFAMART) {
        // ❌
        if (new RegExp(REGEX_SOURCE.ALFAMART, 'i').test(line)) return 0;
    }

    // ✅ Banyak huruf besar → indikasi nama barang
    if (/[A-Z]{3,}/.test(line)) score += 1;

    // ✅ Pola qty + price + subtotal
    if (/\d+\s+\d+\s+\d+$/.test(line)) score += 2;

    // ✅ Nama barang biasanya di awal baris
    if (/^[A-Z]/.test(line)) score += 1;

    return score;
}

export function extractProducts(lines: string[], source: string): object[] {
    const products = [];

    for (const line of lines) {
        if (scoreLine(line, source) < 3) continue;

        const match = line.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)$/);

        if (!match) continue;

        const [, name, qty, price, subtotal] = match;

        if (
            source.toLowerCase() === SOURCES.INDOMARET &&
            name.toLowerCase().includes('layanan')
        )
            continue;

        products.push({
            name: name.trim(),
            qty: Number(qty),
            price: Number(price),
            subtotal: Number(subtotal),
        });
    }

    return products;
}

export function extractTotal(text: string, source: string): number {
    let match;

    if (source.toLowerCase() === SOURCES.INDOMARET) {
        match = text.match(
            new RegExp(`(${REGEX_SOURCE.INDOMARET})[^\\d]*(\\d+)`, 'i'),
        );
    }

    if (source.toLowerCase() === SOURCES.ALFAMART) {
        match = text.match(new RegExp(`(Total Belanja)[^\\d]*(\\d+)`, 'i'));
    }

    return match ? Number(match[2]) : 0;
}

export function extractDate(text: string): string {
    const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return match ? `${match[3]}-${match[1]}-${match[2]} 00:00` : '';
}

export function extractDiscount(text: string, source: string): number {
    let match;

    if (source.toLowerCase() === SOURCES.INDOMARET) {
        match = text.match(new RegExp(`(ANDA HEMAT)[^\\d]*(\\d+)`, 'i'));
    }

    if (source.toLowerCase() === SOURCES.ALFAMART) {
        match = text.match(new RegExp(`(Total Disc)[^\\d]*(\\d+)`, 'i'));
    }

    return match ? Number(match[2]) : 0;
}
