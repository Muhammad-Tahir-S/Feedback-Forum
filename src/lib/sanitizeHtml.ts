import DOMPurify from 'dompurify';

const PROSEMIRROR_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'del',
  'code',
  'pre',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'span',
];

/** Sanitize rich post descriptions (ProseMirror HTML) before rendering as HTML. */
export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: PROSEMIRROR_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

/** Strip markup so comment text never shows raw HTML tags. */
export function toPlainText(value: string) {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
}
