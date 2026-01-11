import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML for task descriptions.
 * Allows formatting tags for rich text editor features.
 * This prevents XSS attacks from malicious HTML input.
 */
export function sanitizeDescription(
  html: string | null | undefined
): string | null {
  if (!html) return null;

  const sanitized = sanitizeHtml(html, {
    allowedTags: [
      // Basic formatting
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      // Enhanced formatting
      'u', // underline
      's',
      'del', // strikethrough
      'a', // links
      'h2',
      'h3', // headings
      'blockquote', // blockquote
      'hr', // horizontal rule
      // Task list elements
      'input',
      'label',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      input: ['type', 'checked', 'disabled'],
      li: ['data-type', 'data-checked'],
      ul: ['data-type'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
    // Transform links to add security attributes
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
  });

  // Return null if sanitization results in empty content
  const trimmed = sanitized.trim();
  if (!trimmed || trimmed === '<p></p>') return null;

  return trimmed;
}
