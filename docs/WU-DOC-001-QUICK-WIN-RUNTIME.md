# WU-DOC-001 Quick-Win Runtime Slice

**Status:** Implemented in code; production AI binding/quality acceptance required before promotion.  
**Route:** `/tools/english-to-urdu-document-translator`  
**API:** `POST /api/document-translate`

## Scope

This is the smallest useful vertical slice of `WU-DOC-001`:

```text
paste English or open .txt
        ↓
Workers AI IndicTrans2
        ↓
editable Urdu
        ↓
copy or continue editing in WriteUrdu
```

The route intentionally uses `noindex,follow` until real Urdu quality is reviewed. It is not added to the sitemap or primary navigation in this slice.

## Cloudflare binding required

The Pages project needs a Workers AI binding named exactly:

```text
AI
```

Cloudflare Pages dashboard path:

```text
Workers & Pages
→ write-urdu project
→ Settings
→ Bindings
→ Add
→ Workers AI
→ Variable name: AI
```

Redeploy after adding the binding.

For local Pages development, expose the same binding with Wrangler, for example:

```bash
npx wrangler pages dev . --ai AI
```

Workers AI calls are remote even during local development.

## Current model contract

```text
@cf/ai4bharat/indictrans2-en-indic-1B
English input
Urdu target: urd_Arab
```

The endpoint sends bounded paragraph/chunk arrays and expects the model's `translations[]` response. It does not persist the request, filename, source text or translated text.

## Limits

- plain text / `.txt` only;
- 12,000 source characters per request;
- `.txt` file up to 64 KB;
- 24 translation segments maximum;
- no PDF/DOCX extraction in this slice;
- no image/scanned OCR in this slice;
- no pixel-perfect layout claim.

## Acceptance before indexing

Test at least:

1. school notice;
2. business letter;
3. instructions;
4. headings + several paragraphs;
5. names, dates and numbers;
6. mixed punctuation;
7. short and near-limit inputs.

Record whether meaning, names, numerals, punctuation and paragraph boundaries remain usable. Keep the route `noindex` until the result is good enough to promote under Slice C.
