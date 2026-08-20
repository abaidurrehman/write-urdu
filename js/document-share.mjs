const MANAGEMENT_KEY = 'writeUrdu.shareManagement.v1';
export const MAX_DOCUMENT_SHARE_TEXT = 8000;

function publicText(document) {
  return String(document?.plainText || '').replace(/\r\n?/g, '\n').trim();
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('share_preview_failed')), 'image/png');
  });
}

function wrapRtlText(ctx, value, maxWidth, maxLines) {
  const lines = [];
  const paragraphs = String(value || '').split(/\n+/);
  for (const paragraph of paragraphs) {
    if (lines.length >= maxLines) break;
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
        if (lines.length >= maxLines) break;
      } else {
        line = candidate;
      }
    }
    if (lines.length < maxLines && line) lines.push(line);
  }
  if (lines.length === maxLines) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (lines.join(' ').length < normalized.length) {
      lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s،,.؛;:!?؟]+$/, '') + '…';
    }
  }
  return lines;
}

async function buildPreview(text, title) {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch {}
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('share_preview_failed');

  ctx.fillStyle = '#f4f8f5';
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(54, 48, 1092, 534);
  ctx.strokeStyle = '#d8e6dd';
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 48, 1092, 534);

  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#176b45';
  ctx.beginPath();
  ctx.arc(96, 91, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#284d3d';
  ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Write Urdu', 120, 91);

  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  const fontSize = normalized.length <= 120 ? 66 : normalized.length <= 260 ? 56 : normalized.length <= 520 ? 46 : 38;
  const maxLines = normalized.length <= 260 ? 5 : 6;
  const lineHeight = Math.round(fontSize * 1.62);
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#11251c';
  ctx.font = `600 ${fontSize}px "Noto Nastaliq Urdu", "Noto Naskh Arabic", serif`;
  const previewText = normalized.length > 1100 ? normalized.slice(0, 1100).trim() + '…' : normalized;
  const lines = wrapRtlText(ctx, previewText, 972, maxLines);
  const totalHeight = Math.max(lineHeight, lines.length * lineHeight);
  const startY = Math.max(176, 314 - totalHeight / 2 + lineHeight / 2);
  lines.forEach((line, index) => ctx.fillText(line, 1080, startY + index * lineHeight, 972));

  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#60756a';
  ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
  const label = String(title || '').trim();
  ctx.fillText(label ? `${label.slice(0, 48)} · Shared from Write-Urdu.com` : 'Shared from Write-Urdu.com', 88, 548, 1010);
  return canvasToPng(canvas);
}

function rememberShare(result) {
  try {
    const raw = localStorage.getItem(MANAGEMENT_KEY);
    const state = raw ? JSON.parse(raw) : { items: {} };
    if (!state.items || typeof state.items !== 'object') state.items = {};
    state.items[result.id] = {
      token: result.manageToken,
      url: result.url,
      createdAt: new Date().toISOString(),
      source: 'my_documents'
    };
    const ids = Object.keys(state.items).sort((a, b) => String(state.items[b].createdAt || '').localeCompare(String(state.items[a].createdAt || '')));
    ids.slice(40).forEach((id) => delete state.items[id]);
    localStorage.setItem(MANAGEMENT_KEY, JSON.stringify(state));
  } catch {}
}

export async function publishDocumentShare(document) {
  const text = publicText(document);
  if (!text) throw new Error('share_text_required');
  if (Array.from(text).length > MAX_DOCUMENT_SHARE_TEXT) throw new Error('share_text_too_long');
  const image = await buildPreview(text, document?.title);
  const form = new FormData();
  form.set('source_tool', 'basic_editor');
  form.set('public_text', text);
  form.set('preset', 'document_snapshot');
  form.set('image', image, 'write-urdu-document.png');

  const response = await fetch('/api/shares', {
    method: 'POST',
    body: form,
    credentials: 'same-origin',
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload.url) {
    const code = payload?.error || 'publish_failed';
    throw new Error(code);
  }
  rememberShare(payload);
  return payload;
}

export async function copyShareLink(url) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const field = document.createElement('textarea');
  field.value = url;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

export async function shareLink(url) {
  if (!navigator.share) {
    await copyShareLink(url);
    return 'copied';
  }
  try {
    await navigator.share({ title: 'Urdu writing on Write Urdu', text: 'Open this Urdu writing on Write Urdu.', url });
    return 'shared';
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled';
    await copyShareLink(url);
    return 'copied';
  }
}
