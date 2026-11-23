/** Approximate glyph width so SVG cover titles wrap before the viewBox clips them. */
export function estimateCoverTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const ch of text) {
    if (ch === " " || ch === "\u00a0") width += fontSize * 0.34;
    else if (/[\u2e80-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(ch)) width += fontSize * 1.05;
    else if (/[A-Z]/.test(ch)) width += fontSize * 0.74;
    else if (/[0-9]/.test(ch)) width += fontSize * 0.6;
    else if (/[&@#%MW]/.test(ch)) width += fontSize * 0.86;
    else if (/[ilI.,'`:;|!]/.test(ch)) width += fontSize * 0.34;
    else width += fontSize * 0.58;
  }
  return width;
}

export function wrapCoverText(text: string, maxWidth: number, fontSize: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hasSpaces = /\s/.test(trimmed);
  const tokens = hasSpaces ? trimmed.split(/\s+/) : [...trimmed];
  const joiner = hasSpaces ? " " : "";
  const lines: string[] = [];
  let current = "";

  const pushLongToken = (token: string) => {
    let chunk = "";
    for (const ch of token) {
      const next = chunk + ch;
      if (chunk && estimateCoverTextWidth(next, fontSize) > maxWidth) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = next;
      }
    }
    current = chunk;
  };

  for (const token of tokens) {
    const next = current ? current + joiner + token : token;
    if (estimateCoverTextWidth(next, fontSize) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (estimateCoverTextWidth(token, fontSize) <= maxWidth) current = token;
    else pushLongToken(token);
  }
  if (current) lines.push(current);
  return lines.length ? lines : [trimmed];
}

export function fitCoverTitle(
  text: string,
  maxWidth: number,
  maxLines = 4,
  sizes: number[] = [64, 56, 48, 42, 36, 32, 28, 24],
): { fontSize: number; lines: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { fontSize: sizes[sizes.length - 1] ?? 24, lines: [] };
  let chosen = {
    fontSize: sizes[sizes.length - 1] ?? 24,
    lines: wrapCoverText(trimmed, maxWidth, sizes[sizes.length - 1] ?? 24),
  };
  for (const fontSize of sizes) {
    const lines = wrapCoverText(trimmed, maxWidth, fontSize);
    const fitsWidth = lines.every((line) => estimateCoverTextWidth(line, fontSize) <= maxWidth + 0.5);
    chosen = { fontSize, lines };
    if (fitsWidth && lines.length <= maxLines) return chosen;
  }
  return chosen;
}
