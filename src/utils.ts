export function sanitizeHtmlOutput(value: string) {
  return value.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}
