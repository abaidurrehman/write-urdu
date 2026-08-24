#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CLUSTERS = [
  {
    id: 'leave-application',
    label: 'Leave application in Urdu',
    terms: [
      /\bleave\s+application\b.*\burdu\b/i,
      /\burdu\b.*\bleave\s+application\b/i,
      /\bsick\s+leave\b.*\burdu\b/i,
      /\burdu\b.*\bsick\s+leave\b/i,
      /چھٹی\s+کی\s+درخواست/u,
      /رخصت\s+کی\s+درخواست/u,
      /بیماری.*رخصت/u
    ]
  },
  {
    id: 'job-application',
    label: 'Job application in Urdu',
    terms: [
      /\bjob\s+application\b.*\burdu\b/i,
      /\burdu\b.*\bjob\s+application\b/i,
      /\bapplication\s+for\s+job\b.*\burdu\b/i,
      /ملازمت\s+کی\s+درخواست/u,
      /نوکری\s+کی\s+درخواست/u
    ]
  },
  {
    id: 'resignation-letter',
    label: 'Resignation letter in Urdu',
    terms: [
      /\bresignation\s+letter\b.*\burdu\b/i,
      /\burdu\b.*\bresignation\s+letter\b/i,
      /\bresignation\b.*\burdu\b/i,
      /استعف(?:ی|یٰ)/u
    ]
  },
  {
    id: 'complaint-application',
    label: 'Complaint application in Urdu',
    terms: [
      /\bcomplaint\s+(?:application|letter)\b.*\burdu\b/i,
      /\burdu\b.*\bcomplaint\s+(?:application|letter)\b/i,
      /\bcomplaint\b.*\burdu\b/i,
      /شکایت\s+کی\s+درخواست/u,
      /شکایت\s*نامہ/u
    ]
  },
  {
    id: 'invitation-letter',
    label: 'Invitation letter in Urdu',
    terms: [
      /\binvitation\s+(?:letter|card)\b.*\burdu\b/i,
      /\burdu\b.*\binvitation\s+(?:letter|card)\b/i,
      /\binvitation\b.*\burdu\b/i,
      /دعوت\s*نامہ/u,
      /دعوت\s+کا\s+خط/u
    ]
  },
  {
    id: 'general-application',
    label: 'Urdu application / درخواست',
    terms: [
      /\bapplication\s+in\s+urdu\b/i,
      /\burdu\s+application\b/i,
      /\bapplication\b.*\burdu\b/i,
      /\burdu\b.*\bapplication\b/i,
      /درخواست/u
    ]
  }
];

function normalizeQuery(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCsv(input) {
  const text = String(input || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter((values) => values.some((value) => String(value).trim() !== ''));
}

function headerKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z]/g, '');
}

function resolveColumns(headers) {
  const keys = headers.map(headerKey);
  const find = (...names) => keys.findIndex((key) => names.includes(key));
  const columns = {
    query: find('query', 'queries', 'topqueries'),
    clicks: find('clicks'),
    impressions: find('impressions'),
    ctr: find('ctr'),
    position: find('position', 'averageposition')
  };
  if (columns.query < 0 || columns.clicks < 0 || columns.impressions < 0 || columns.position < 0) {
    throw new Error('Expected Search Console query CSV columns: Query, Clicks, Impressions, CTR, Position.');
  }
  return columns;
}

function numberValue(value) {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/%$/, '')
    .replace(/\s/g, '')
    .replace(/,(?=\d{3}(?:\D|$))/g, '');
  const parsed = Number(cleaned.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function findCluster(query) {
  const normalized = normalizeQuery(query);
  return CLUSTERS.find((cluster) => cluster.terms.some((term) => term.test(normalized))) || null;
}

function classify(metrics) {
  if (metrics.impressions >= 1000 && metrics.position <= 20) return 'promotion-review';
  if (metrics.impressions >= 500 || metrics.clicks >= 5) return 'candidate';
  if (metrics.impressions >= 100 || metrics.clicks >= 1) return 'observe';
  return 'hold';
}

function analyzeRows(rows) {
  if (!rows.length) throw new Error('CSV is empty.');
  const columns = resolveColumns(rows[0]);
  const buckets = new Map(CLUSTERS.map((cluster) => [cluster.id, {
    id: cluster.id,
    label: cluster.label,
    matchedQueries: 0,
    clicks: 0,
    impressions: 0,
    weightedPosition: 0,
    topQueries: []
  }]));

  for (const values of rows.slice(1)) {
    const query = normalizeQuery(values[columns.query]);
    if (!query) continue;
    const cluster = findCluster(query);
    if (!cluster) continue;
    const bucket = buckets.get(cluster.id);
    const clicks = numberValue(values[columns.clicks]);
    const impressions = numberValue(values[columns.impressions]);
    const position = numberValue(values[columns.position]);
    bucket.matchedQueries += 1;
    bucket.clicks += clicks;
    bucket.impressions += impressions;
    bucket.weightedPosition += position * impressions;
    bucket.topQueries.push({ query, clicks, impressions, position });
  }

  return [...buckets.values()].map((bucket) => {
    const position = bucket.impressions ? bucket.weightedPosition / bucket.impressions : 0;
    const ctr = bucket.impressions ? bucket.clicks / bucket.impressions : 0;
    const result = {
      id: bucket.id,
      label: bucket.label,
      matchedQueries: bucket.matchedQueries,
      clicks: bucket.clicks,
      impressions: bucket.impressions,
      ctr,
      position,
      recommendation: classify({ ...bucket, position }),
      topQueries: bucket.topQueries
        .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
        .slice(0, 3)
    };
    return result;
  }).sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
}

function analyzeCsv(input) {
  return analyzeRows(parseCsv(input));
}

function pct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function position(value) {
  return value ? value.toFixed(1) : '—';
}

function recommendationLabel(value) {
  return ({
    'promotion-review': 'PROMOTION REVIEW',
    candidate: 'CANDIDATE',
    observe: 'OBSERVE',
    hold: 'HOLD'
  })[value] || value;
}

function markdownReport(results, sourceName) {
  const lines = [
    '# WU-TPL-001 Search Console observation',
    '',
    `Source: ${sourceName || 'Search Console query CSV'}`,
    '',
    '| Intent cluster | Clicks | Impressions | CTR | Avg position | Signal |',
    '| --- | ---: | ---: | ---: | ---: | --- |'
  ];
  results.forEach((item) => {
    lines.push(`| ${item.label} | ${item.clicks} | ${item.impressions} | ${pct(item.ctr)} | ${position(item.position)} | ${recommendationLabel(item.recommendation)} |`);
  });

  const review = results.filter((item) => item.recommendation === 'promotion-review');
  lines.push('', '## Decision rule', '');
  if (review.length) {
    lines.push(`Review ${review.map((item) => `**${item.label}**`).join(', ')} for a dedicated landing page. This is a review trigger, not an automatic publish decision.`);
  } else {
    lines.push('No intent cluster has crossed the promotion-review threshold yet. Keep the collection page as the owner and continue observing.');
  }
  lines.push('', 'Before creating a dedicated page, confirm the query maps to `/urdu-writing-templates` in the Search Console Pages/Queries view and that the new page can provide substantially more value than the template body alone.');

  const top = results.filter((item) => item.topQueries.length);
  if (top.length) {
    lines.push('', '## Leading matched queries', '');
    top.forEach((item) => {
      lines.push(`### ${item.label}`);
      item.topQueries.forEach((query) => lines.push(`- ${query.query} — ${query.impressions} impressions, ${query.clicks} clicks, position ${position(query.position)}`));
      lines.push('');
    });
  }
  return lines.join('\n').trim() + '\n';
}

function usage() {
  return [
    'Usage:',
    '  node scripts/analyze-writing-template-gsc.js <Queries.csv>',
    '  node scripts/analyze-writing-template-gsc.js <Queries.csv> --json',
    '',
    'Use the Queries.csv file from a Google Search Console Performance export.'
  ].join('\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const filename = args.find((arg) => !arg.startsWith('--'));
  if (!filename) {
    console.error(usage());
    process.exit(2);
  }
  const absolute = path.resolve(process.cwd(), filename);
  try {
    const results = analyzeCsv(fs.readFileSync(absolute, 'utf8'));
    if (json) process.stdout.write(JSON.stringify({ source: filename, clusters: results }, null, 2) + '\n');
    else process.stdout.write(markdownReport(results, filename));
  } catch (error) {
    console.error(`WU-TPL-001 observation failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  CLUSTERS,
  normalizeQuery,
  parseCsv,
  resolveColumns,
  findCluster,
  classify,
  analyzeRows,
  analyzeCsv,
  markdownReport
};
