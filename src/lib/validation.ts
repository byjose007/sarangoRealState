import { z } from 'zod';

export const viewingSchema = z.object({
  name: z.string().min(2, 'Tell us who is coming'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a reachable phone number'),
  date: z.string().min(1, 'Pick a day'),
  time: z.string().min(1, 'Pick a time'),
  message: z.string().max(600, 'Keep it under 600 characters').optional(),
  propertyReference: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  topic: z.enum(['buying', 'selling', 'renting', 'investment', 'other']),
  message: z.string().min(10, 'A sentence or two is enough'),
});

export const agentMessageSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(5, 'Add a short message'),
});

export type ViewingInput = z.infer<typeof viewingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AgentMessageInput = z.infer<typeof agentMessageSchema>;
