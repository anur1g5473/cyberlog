/**
 * Preprocesses markdown text for blog rendering.
 * 1. Supports "\\" or "\" as bullet points at the beginning of lines (e.g. `\ Point` or `\\ Point` -> `- Point`).
 * 2. Normalizes headings with one or more "#" symbols even if a space was omitted (e.g. `#Heading` -> `# Heading`).
 */
export function preprocessBlogMarkdown(raw: string): string {
  if (!raw) return '';

  return raw
    .split('\n')
    .map((line) => {
      // Normalize backslash bullets: "  \ Item" or "  \\ Item" -> "  - Item"
      const backslashBullet = line.match(/^(\s*)(?:\\\\|\\)\s+(.*)$/);
      if (backslashBullet) {
        const [, indent, content] = backslashBullet;
        return `${indent}- ${content}`;
      }

      // If user typed just "\\" or "\" on its own line
      if (/^(\s*)(?:\\\\|\\)$/.test(line)) {
        return `${line.replace(/(?:\\\\|\\)/, '-')}`;
      }

      // Normalize headings without space after '#' (e.g. "#Heading" or "###Subheading")
      const headingNoSpace = line.match(/^(\s*)(#{1,6})([^\s#].*)$/);
      if (headingNoSpace) {
        const [, indent, hashes, content] = headingNoSpace;
        return `${indent}${hashes} ${content}`;
      }

      return line;
    })
    .join('\n');
}
