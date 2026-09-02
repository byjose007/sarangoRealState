import { describe, expect, it } from 'vitest';
import { agentMessageSchema, contactSchema, viewingSchema } from './validation';

describe('viewingSchema', () => {
  const valid = {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    phone: '0991234567',
    date: '2026-08-10',
    time: '10:00',
  };

  it('accepts a minimal valid submission', () => {
    expect(viewingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = viewingSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number that is too short', () => {
    const result = viewingSchema.safeParse({ ...valid, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects a message over 600 characters', () => {
    const result = viewingSchema.safeParse({ ...valid, message: 'a'.repeat(601) });
    expect(result.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('requires a topic from the fixed enum', () => {
    const base = { name: 'Ana', email: 'ana@example.com', message: 'Me interesa una propiedad.' };
    expect(contactSchema.safeParse({ ...base, topic: 'buying' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, topic: 'not-a-real-topic' }).success).toBe(false);
  });

  it('rejects a message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Ana',
      email: 'ana@example.com',
      topic: 'other',
      message: 'hi',
    });
    expect(result.success).toBe(false);
  });
});

describe('agentMessageSchema', () => {
  it('accepts a short direct message to an agent', () => {
    const result = agentMessageSchema.safeParse({
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Hola, buenas',
    });
    expect(result.success).toBe(true);
  });
});
