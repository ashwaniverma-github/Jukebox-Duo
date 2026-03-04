/**
 * Safely serialize data for JSON-LD script tags.
 * Escapes '<' to prevent premature </script> closure and potential XSS.
 */
export function safeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}
