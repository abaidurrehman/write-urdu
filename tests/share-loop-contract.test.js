const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const helper = read('functions', '_lib', 'share-artifacts.js');
const publishApi = read('functions', 'api', 'shares.js');
const shareApi = read('functions', 'api', 'shares', '[id].js');
const reportApi = read('functions', 'api', 'shares', '[id]', 'report.js');
const publicPage = read('functions', 's', '[id].js');
const media = read('functions', 'share-media', '[id].js');
const migration = read('migrations', '0004_share_artifacts.sql');
const shareTelemetry = read('js', 'share-loop-telemetry.js');
const events = read('functions', 'api', 'events.js');
const cardPublish = read('js', 'card-studio-publish.js');
const basicPublish = read('js', 'basic-writer-publish.js');
const cardUi = read('js', 'card-studio-ui.js');
const shareClient = read('js', 'share-page.js');
const shareCss = read('css', 'share-page.css');
const journey = read('js', 'card-studio-entry.js');
const guide = read('how-to-share-urdu-writing-online.html');
const privacy = read('write-urdu-privacy.html');
const sitemap = read('sitemap.xml');
const seo = read('seo.config.js');
const pulseHtml = read('os', 'product-pulse.html');
const pulseClient = read('js', 'product-pulse.js');
const pulseApi = read('functions', 'api', 'internal', 'product-pulse.js');

// Generic storage binding + hard share namespace boundary.
assert.match(helper, /env\.CONTENT_STORE/, 'Share service must use the generic CONTENT_STORE binding');
assert.doesNotMatch([helper, publishApi, shareApi, media].join('\n'), /SHARE_MEDIA/, 'Runtime must not retain the old share-specific R2 binding');
assert.match(helper, /`shares\/\$\{now\.getUTCFullYear\(\)\}/, 'Public objects must live under the shares/ namespace');
assert.match(media, /startsWith\('shares\/'\)/, 'Public media delivery must reject non-share CONTENT_STORE keys');
assert.match(publishApi, /env\.CONTENT_STORE\.put/, 'Publishing must write the rendered PNG to CONTENT_STORE');
assert.match(shareApi, /env\.CONTENT_STORE\.delete/, 'Deleting a share must remove its R2 object when possible');

// Opaque IDs, immutable snapshot metadata, and management-token protection.
assert.match(helper, /const BASE62/, 'Share IDs must use an opaque URL-safe alphabet');
assert.match(helper, /randomBase62\(8\)/, 'Share IDs must be short random opaque identifiers');
assert.match(helper, /crypto\.getRandomValues/, 'Share IDs/tokens must use cryptographic randomness');
assert.match(helper, /crypto\.subtle\.digest\('SHA-256'/, 'Management tokens must be hashed before storage');
assert.match(migration, /manage_token_hash TEXT NOT NULL/, 'D1 must store only the management-token hash');
assert.match(migration, /origin_share_id TEXT/, 'Share artifacts must retain parent-child reproduction relationships');
assert.match(shareApi, /x-writeurdu-manage-token/, 'Deletion must require a management token outside the URL');
assert.doesNotMatch(publicPage, /manage_token|manageToken|manage_token_hash/, 'Public share HTML must never expose management credentials');

// Publish endpoint only accepts bounded plain data and a validated PNG snapshot.
assert.match(publishApi, /request\.formData\(\)/, 'Share publishing must use a bounded multipart snapshot request');
assert.match(publishApi, /validatePng\(image\)/, 'Share publishing must validate the uploaded PNG');
assert.match(helper, /image\/png/, 'Only the approved PNG share artifact should be accepted');
assert.match(helper, /MAX_IMAGE_BYTES/, 'Share media must have a server-side size limit');
assert.match(helper, /cleanPlainText/, 'Public Urdu text must be normalized as plain text');
assert.match(helper, /new Set\(\['card_studio', 'basic_editor', 'rich_editor', 'urdu_keyboard'\]\)/, 'Share API source allowlist must cover all current writing publishers');
assert.doesNotMatch(publishApi, /innerHTML|dangerouslySetInnerHTML/, 'Publish API must not accept/render HTML content');
assert.match(publishApi, /origin_share_unavailable/, 'Child publication must validate its parent share');

// Public UGC pages stay acquisition surfaces, not an indexable content farm.
assert.match(publicPage, /x-robots-tag': 'noindex, follow'/i, 'Public share responses must emit a noindex HTTP header');
assert.match(publicPage, /meta name="robots" content="noindex,follow,max-image-preview:large"/, 'Public share HTML must be noindex');
assert.match(publicPage, /property="og:image"/, 'Public shares must expose server-rendered OG image metadata');
assert.match(publicPage, /twitter:card.*summary_large_image/, 'Public shares must expose a large social preview card');
assert.match(publicPage, /\/share-media\/\$\{id\}/, 'Social metadata must use controlled same-site share media delivery');
assert.match(publicPage, /data-share-public-text/, 'Published Urdu must remain real selectable HTML text');
assert.match(publicPage, /Create your own Urdu design/, 'Public share must expose a creation CTA');
assert.match(publicPage, /Use this text/, 'Public share must expose an explicit public-text continuation action');
assert.match(publicPage, /Make QR for this link/, 'Public share must expose a QR continuation action');
assert.match(publicPage, /Report this shared page/, 'Public share must expose an abuse-report path');
assert.doesNotMatch(publicPage, /adsbygoogle|googlesyndication|google_ad_client/i, 'User-generated share pages must remain ad-free');
assert.doesNotMatch(sitemap, /write-urdu\.com\/s\//, 'Individual user-generated share pages must never enter the XML sitemap');
assert.match(publicPage, /<article class="share-card"[\s\S]*<aside class="share-panel"/, 'Shared artwork must come before continuation actions in the document flow');
assert.match(publicPage, /share-button primary[^>]*data-share-use-text/, 'Use this text must be the primary recipient continuation action');
assert.doesNotMatch(shareCss, /\.share-panel\{[^}]*order:-1/, 'Mobile share layout must not move actions ahead of the shared artwork');

// Card Studio retains local export while adding an explicit public-publish boundary.
assert.match(cardUi, /card-studio-publish\.js/, 'Card Studio guided UI must load the isolated publish layer');
assert.match(cardPublish, /Publish & Share/, 'Card Studio must have an explicit public publishing action');
assert.match(cardPublish, /data-wu-share-step-publish/, 'Card Studio Step 4 must expose its own primary Publish & Share entry point');
assert.match(cardPublish, /Create a public Write-Urdu\.com link/, 'Step 4 publishing action must explain what it creates');
assert.match(cardPublish, /Share image only/, 'Existing file-only sharing must remain visibly distinct from publishing');
assert.match(cardPublish, /Download PNG/, 'Publish explanation must preserve the local download concept');
assert.match(cardPublish, /Public to anyone with the link/, 'First publish must communicate the public boundary');
assert.match(cardPublish, /Your other local drafts and project history stay in this browser/, 'Publish confirmation must protect the local-first contract');
assert.match(cardPublish, /current && current\.watermark && current\.watermark\.enabled/, 'Publishing must avoid adding a second Write Urdu mark when the card already has one');
assert.match(cardPublish, /Write-Urdu\.com/, 'Hosted publish image must carry restrained Write Urdu provenance');
assert.match(cardPublish, /writeUrdu\.shareManagement\.v1/, 'Management tokens must be retained locally for later deletion');
assert.match(cardPublish, /\/api\/shares/, 'Card Studio must publish through the first-party share API');

// Basic Writer's first-class Share command publishes through the same short-link system.
assert.match(basicPublish, /form\.append\('source_tool', 'basic_editor'\)/, 'Basic Writer must identify itself to the shared publish endpoint');
assert.match(basicPublish, /form\.append\('public_text', text\)/, 'Basic Writer public sharing must publish bounded plain text');
assert.match(basicPublish, /fetch\('\/api\/shares'/, 'Basic Writer must reuse the same first-party share API as Card Studio');
assert.match(basicPublish, /canvas\.width = 1200[\s\S]*canvas\.height = 630/, 'Basic Writer must create a social-preview PNG with a stable 1200x630 canvas');
assert.match(basicPublish, /Shared from Write-Urdu\.com/, 'Basic Writer preview must carry restrained Write Urdu provenance');
assert.match(basicPublish, /Public to anyone with the link/, 'Basic Writer must disclose the publication boundary before upload');
assert.match(basicPublish, /Publish &amp; get short link/, 'Basic Writer publication must require an explicit confirm action');
assert.match(basicPublish, /writeUrdu\.shareManagement\.v1/, 'Basic Writer management tokens must use the shared local management store');
assert.match(basicPublish, /writeUrdu\.basicShareLast\.v1/, 'Basic Writer may reuse the same unchanged short link from this browser');
assert.match(basicPublish, /navigator\.share\(\{[\s\S]*url: url/, 'Basic Writer native share must distribute the published short URL');
assert.doesNotMatch(basicPublish, /navigator\.share\(\{[\s\S]*text:\s*text/, 'Basic Writer native sharing must not send the raw Urdu document as the primary share payload');
assert.doesNotMatch(basicPublish, /location\.(?:href|search)[\s\S]*(?:text|public_text)|URLSearchParams[\s\S]*(?:text|public_text)/, 'Basic Writer must not put document text in URLs');

// Sharing remains discoverable from the real writing workspaces, with local handoff preserved.
assert.match(journey, /Create &amp; share this Urdu/, 'Core writing workspaces must promote Create & Share as a primary next step');
assert.match(journey, /class="wu-next-journey-action is-primary is-share"/, 'Create & Share must be visually primary in the writing journey');
assert.match(journey, /data-create-card/, 'Create & Share must reuse the privacy-safe Card Studio text handoff');
assert.match(journey, /public link is created only when you explicitly choose Publish &amp; Share/, 'Editor discovery copy must preserve the explicit-publication boundary');

// Recipient continuation must use the shared v2 session-local runtime and keep destination URLs clean.
assert.match(shareClient, /writeUrdu\.shareReferral\.v1/, 'Recipient creation must retain short-lived first-party referral context');
assert.match(shareClient, /Handoff\.transfer\(\{/, 'Recipient continuation must use the shared v2 handoff runtime');
assert.match(shareClient, /sourceWorkspace: 'public-share'/, 'Recipient handoffs must identify the immutable public-share source');
assert.match(shareClient, /kind: 'plain-text'/, 'Recipient continuation must carry only bounded plain text');
assert.match(shareClient, /transfer\('basic-writer', 'share-to-basic'/, 'Use this text must continue into Basic Writer');
assert.match(shareClient, /transfer\('card-studio', 'share-to-card'/, 'Create your own design must continue into Card Studio');
assert.match(shareClient, /transfer\('qr-generator', 'share-to-qr'/, 'QR action must continue into QR Generator');
assert.doesNotMatch(shareClient, /writeUrdu\.cardStudio\.incoming/, 'Public share must not couple directly to Card Studio legacy storage');
assert.doesNotMatch(shareClient, /location\.href\s*=\s*[^;]*(?:text=|share=|origin_share_id)/, 'Recipient handoff must not leak text/share identity in the destination URL');

// Anonymous telemetry normalizes the dynamic route before it reaches /api/events.
assert.match(shareTelemetry, /return '\/s\/:share'/, 'Dynamic share routes must normalize to one low-cardinality telemetry route');
assert.match(shareTelemetry, /public_share/, 'Public share pages need their own coarse tool enum');
assert.doesNotMatch(shareTelemetry, /share_id|origin_share_id|public_text|manage_token|manageToken/, 'Anonymous telemetry must not contain public share identity/content fields');
for (const event of [
  'share_publish_started', 'share_publish_completed', 'share_publish_failed', 'share_page_viewed',
  'share_page_cta_clicked', 'share_referred_creation_started', 'share_republish_completed',
  'share_deleted', 'share_reported'
]) {
  assert.ok(events.includes(`'${event}'`), `Telemetry event allowlist is missing ${event}`);
}
assert.match(events, /'basic_editor'/, 'Telemetry collector must accept Basic Writer share events');
assert.match(events, /'public_share'/, 'Telemetry collector must accept the normalized public_share tool');
assert.match(events, /share_hourly_metrics/, 'Share events must roll up separately from existing product metrics');

// Product Pulse must answer whether sharing reproduces new creation/publishing.
assert.match(pulseHtml, />Share Loop</, 'Founder Product Pulse must expose the Share Loop section');
assert.match(pulseHtml, /Publish → visit → create → republish/, 'Share Loop must show the intended funnel');
assert.match(pulseClient, /reproduction_ratio/, 'Product Pulse client must render reproduction ratio');
assert.match(pulseClient, /republish_rate/, 'Product Pulse client must render republish rate');
assert.match(pulseApi, /origin_share_id/, 'Aggregate Share Loop API must compute child-share relationships');
assert.match(pulseApi, /parent_activation_rate/, 'Aggregate Share Loop API must report parent activation');
assert.match(pulseApi, /report_rate_per_1000_views/, 'Aggregate Share Loop API must report abuse rate');
assert.doesNotMatch(pulseApi, /SELECT[^;]*(?:public_text|manage_token_hash|image_key)/i, 'Product Pulse must not select public content or management secrets');

// Guide/privacy/SEO contract ships with the feature.
assert.match(guide, /Publish &amp; Share/, 'Public guide must explain the publish action');
assert.match(guide, /Download PNG/, 'Public guide must distinguish local download from publishing');
assert.match(guide, /Manage published links/, 'Public guide must explain later deletion');
assert.match(guide, /If a local photo is visible in the finished card, it is included in that published card image/, 'Guide must accurately describe published-background privacy in user language');
assert.match(privacy, /Public share links/, 'Privacy policy must disclose public shares');
assert.match(privacy, /Clearing browser\/site storage may remove that self-service management token and does not, by itself, delete/, 'Privacy policy must explain local-token deletion semantics');
assert.match(seo, /how-to-share-urdu-writing-online/, 'Sharing guide must be registered in SEO configuration');
assert.match(sitemap, /how-to-share-urdu-writing-online/, 'Sharing guide must be in the XML sitemap');

// Anonymous publishing has bounded safety controls from launch.
assert.match(helper, /allowPublish/, 'Publishing must have a rate-limiting control');
assert.match(helper, /allowReport/, 'Reporting must have a rate-limiting control');
assert.match(reportApi, /spam.*abuse.*privacy.*copyright.*other|cleanReportReason/s, 'Reporting must use a bounded reason enum');
assert.match(migration, /status TEXT NOT NULL DEFAULT 'active'/, 'Share artifacts need an explicit moderation lifecycle');

console.log('Public share loop contracts passed.');