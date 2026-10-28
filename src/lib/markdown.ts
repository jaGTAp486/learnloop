/**
 * Lightweight markdown-to-HTML renderer for AI responses.
 * Supports: headings, bold, italic, lists, code blocks, inline code, blockquotes, hr.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const html: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // close list if needed
    const isListItem = /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
    if (!isListItem && inList) {
      html.push(`</${inList}>`);
      inList = null;
    }

    // headings
    if (/^###\s+/.test(line)) {
      html.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      html.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      html.push(`<h1>${inline(line.replace(/^#\s+/, ''))}</h1>`);
      continue;
    }

    // blockquote
    if (/^>\s+/.test(line)) {
      html.push(`<blockquote>${inline(line.replace(/^>\s+/, ''))}</blockquote>`);
      continue;
    }

    // hr
    if (/^---+$/.test(line.trim())) {
      html.push('<hr class="border-gray-200 my-3" />');
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      if (inList !== 'ul') {
        if (inList) html.push(`</${inList}>`);
        html.push('<ul>');
        inList = 'ul';
      }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      if (inList !== 'ol') {
        if (inList) html.push(`</${inList}>`);
        html.push('<ol>');
        inList = 'ol';
      }
      html.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      continue;
    }

    // blank line
    if (line.trim() === '') {
      continue;
    }

    // paragraph
    html.push(`<p>${inline(line)}</p>`);
  }

  if (inCodeBlock && codeBuffer.length) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }
  if (inList) html.push(`</${inList}>`);

  return html.join('\n');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}
