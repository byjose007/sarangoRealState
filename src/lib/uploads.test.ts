import { describe, expect, it } from 'vitest';
import { extensionForDocument, extensionForImage, formatFileSize, UploadError } from './uploads';

describe('extensionForImage', () => {
  it('maps supported image MIME types to their extension', () => {
    expect(extensionForImage('image/jpeg')).toBe('jpg');
    expect(extensionForImage('image/jpg')).toBe('jpg');
    expect(extensionForImage('image/pjpeg')).toBe('jpg');
    expect(extensionForImage('image/jfif')).toBe('jpg');
    expect(extensionForImage('image/png')).toBe('png');
    expect(extensionForImage('image/webp')).toBe('webp');
    expect(extensionForImage('image/avif')).toBe('avif');
  });

  it('falls back to filename extension if MIME type is missing or generic', () => {
    expect(extensionForImage('', 'casa.jpeg')).toBe('jpg');
    expect(extensionForImage('application/octet-stream', 'fachada.JPEG')).toBe('jpg');
    expect(extensionForImage('', 'foto.jpg')).toBe('jpg');
    expect(extensionForImage('', 'plano.png')).toBe('png');
  });

  it('rejects an unsupported or spoofed MIME type without valid extension', () => {
    expect(() => extensionForImage('image/svg+xml')).toThrow(UploadError);
    expect(() => extensionForImage('text/html')).toThrow(UploadError);
    expect(() => extensionForImage('')).toThrow(UploadError);
    expect(() => extensionForImage('application/octet-stream', 'archivo.exe')).toThrow(UploadError);
  });
});

describe('extensionForDocument', () => {
  it('maps supported document MIME types to their extension and type', () => {
    expect(extensionForDocument('application/pdf')).toEqual({ ext: 'pdf', type: 'PDF' });
    expect(extensionForDocument('application/zip')).toEqual({ ext: 'zip', type: 'ZIP' });
  });

  it('rejects an unsupported document MIME type', () => {
    expect(() => extensionForDocument('application/x-msdownload')).toThrow(UploadError);
  });
});

describe('formatFileSize', () => {
  it('picks the right unit for the magnitude', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
