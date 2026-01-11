/**
 * Strips HTML tags and converts to plain text for preview.
 * Preserves word boundaries from block elements.
 */
export function stripHtml(html: string | null): string {
  if (!html) return '';

  return (
    html
      // Replace block-ending tags with spaces
      .replace(/<\/(p|div|li|br)\s*>/gi, ' ')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Checks if a string contains HTML tags.
 * Used for migration of plain text descriptions.
 */
export function isHtml(str: string | null): boolean {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Wraps plain text in paragraph tags for editor compatibility.
 * Converts existing plain text descriptions to HTML format.
 */
export function wrapPlainText(text: string | null): string {
  if (!text) return '<p></p>';
  if (isHtml(text)) return text;

  // Split by newlines and wrap each line in <p> tags
  return (
    text
      .split(/\n+/)
      .filter((line) => line.trim())
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join('') || '<p></p>'
  );
}

/**
 * Escapes HTML special characters to prevent XSS when wrapping plain text.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
