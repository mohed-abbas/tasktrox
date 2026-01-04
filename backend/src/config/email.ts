/**
 * Email Configuration - Resend
 *
 * Provides email sending functionality using Resend.
 * Falls back gracefully in development when API key is not set.
 */

import { Resend } from 'resend';
import { env } from './env.js';

// Create Resend client (null if API key not configured)
export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Email configuration
export const emailConfig = {
  from: env.EMAIL_FROM,
  enabled: !!env.RESEND_API_KEY,
};
