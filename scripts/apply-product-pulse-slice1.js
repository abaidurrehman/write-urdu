const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const RELEASE = 'wu-plat-002h-s1-2026-09-06-v1';

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function write(file, value) { fs.writeFileSync(path.join(root, file), value); }
function mustReplace(file, before, after) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`Slice 1 patch anchor missing in ${file}: ${before.slice(0, 160)}`);
  write(file, source.replace(before, after));
}

// ---------------------------------------------------------------------------
// Shared handoff metadata: stable recommendation/path identity, no user text.
// ---------------------------------------------------------------------------
mustReplace(
  'js/workspace-handoff.js',
  "    var KEY_PREFIX = 'write-urdu:workspace-handoff:v2:';\n    var ALLOWED_KINDS = ['plain-text', 'rich-text', 'template-seed', 'visual-project-seed', 'structured-seed', 'draft-reference'];\n",
  "    var KEY_PREFIX = 'write-urdu:workspace-handoff:v2:';\n    var CONTINUATION_RELEASE_MARKER = '" + RELEASE + "';\n    var ALLOWED_KINDS = ['plain-text', 'rich-text', 'template-seed', 'visual-project-seed', 'structured-seed', 'draft-reference'];\n"
);

mustReplace(
  'js/workspace-handoff.js',
  "        'card-studio': { key: 'writeUrdu.cardStudio.incoming', shape: 'destination', route: '/urdu-card-studio' },\n        'stylish-text': { key: 'writeUrdu.stylishText.incoming.v1', shape: 'destination', route: '/stylish-urdu-text-generator' },\n",
  "        'card-studio': { key: 'writeUrdu.cardStudio.incoming', shape: 'destination', route: '/urdu-card-studio' },\n        'qr-generator': { key: 'writeUrdu.qrGenerator.incoming', shape: 'destination', route: '/qr-code-generator' },\n        'stylish-text': { key: 'writeUrdu.stylishText.incoming.v1', shape: 'destination', route: '/stylish-urdu-text-generator' },\n"
);

mustReplace(
  'js/workspace-handoff.js',
  "    function telemetryDetail(envelope, outcome, failureReason) {\n        return {\n            sourceWorkspace: envelope && envelope.source ? envelope.source.workspace : null,\n            destinationWorkspace: envelope && envelope.target ? envelope.target.workspace : null,\n            actionId: envelope && envelope.actionId || null,\n            payloadKind: envelope && envelope.payload ? envelope.payload.kind : null,\n            hasContent: Boolean(envelope && hasContent(envelope.payload)),\n            outcome: outcome || null,\n            failureReason: failureReason || null\n        };\n    }\n",
  "    function telemetryDetail(envelope, outcome, failureReason) {\n        var context = envelope && envelope.context && typeof envelope.context === 'object' ? envelope.context : {};\n        return {\n            sourceWorkspace: envelope && envelope.source ? envelope.source.workspace : null,\n            destinationWorkspace: envelope && envelope.target ? envelope.target.workspace : null,\n            actionId: envelope && envelope.actionId || null,\n            recommendationId: context.recommendationId || envelope && envelope.actionId || null,\n            pathVersion: context.pathVersion || 'v2',\n            releaseMarker: context.releaseMarker || CONTINUATION_RELEASE_MARKER,\n            handoffRequired: context.handoffRequired !== false,\n            restoreRequired: context.restoreRequired !== false,\n            payloadKind: envelope && envelope.payload ? envelope.payload.kind : null,\n            hasContent: Boolean(envelope && hasContent(envelope.payload)),\n            outcome: outcome || null,\n            failureReason: failureReason || null\n        };\n    }\n"
);

mustReplace(
  'js/workspace-handoff.js',
  "            payload: { text: legacy.text },\n            actionId: 'legacy-compatibility'\n        });\n",
  "            payload: { text: legacy.text },\n            actionId: (function () {\n                var ids = {\n                    'basic-writer>rich-editor': 'basic-to-rich',\n                    'urdu-keyboard>rich-editor': 'keyboard-to-rich',\n                    'basic-writer>card-studio': 'basic-to-card',\n                    'urdu-keyboard>card-studio': 'keyboard-to-card',\n                    'rich-editor>card-studio': 'rich-to-card',\n                    'basic-writer>qr-generator': 'basic-to-qr',\n                    'urdu-keyboard>qr-generator': 'keyboard-to-qr',\n                    'rich-editor>qr-generator': 'rich-to-qr'\n                };\n                return ids[source + '>' + targetWorkspace] || 'legacy-compatibility';\n            }()),\n            context: {\n                pathVersion: 'legacy-v1',\n                releaseMarker: CONTINUATION_RELEASE_MARKER,\n                handoffRequired: true,\n                restoreRequired: true\n            }\n        });\n"
);

mustReplace(
  'js/workspace-handoff.js',
  "        KEY_PREFIX: KEY_PREFIX,\n        ALLOWED_KINDS: ALLOWED_KINDS.slice(),\n",
  "        KEY_PREFIX: KEY_PREFIX,\n        CONTINUATION_RELEASE_MARKER: CONTINUATION_RELEASE_MARKER,\n        ALLOWED_KINDS: ALLOWED_KINDS.slice(),\n"
);

// ---------------------------------------------------------------------------
// Source-side v2 transfer: carry stable recommendation ID + bounded release.
// ---------------------------------------------------------------------------
mustReplace(
  'js/core-continuity.js',
  "    function transfer(targetWorkspace) {\n",
  "    function transfer(targetWorkspace, recommendationId) {\n"
);

mustReplace(
  'js/core-continuity.js',
  "            actionId: actionId(sourceWorkspace, targetWorkspace),\n            kind: 'plain-text',\n            payload: { text: text }\n",
  "            actionId: recommendationId || actionId(sourceWorkspace, targetWorkspace),\n            kind: 'plain-text',\n            payload: { text: text },\n            context: {\n                recommendationId: recommendationId || actionId(sourceWorkspace, targetWorkspace),\n                pathVersion: 'v2',\n                releaseMarker: Handoff.CONTINUATION_RELEASE_MARKER || '" + RELEASE + "',\n                handoffRequired: true,\n                restoreRequired: true\n            }\n"
);

mustReplace(
  'js/core-continuity.js',
  "        event.preventDefault();\n        event.stopImmediatePropagation();\n        transfer(target);\n",
  "        event.preventDefault();\n        event.stopImmediatePropagation();\n        var recommendationId = control.getAttribute('data-wu-next-step-action') || actionId(source, target);\n        transfer(target, recommendationId);\n"
);

// ---------------------------------------------------------------------------
// Browser telemetry: path-level stage events with bounded, non-content fields.
// ---------------------------------------------------------------------------
mustReplace(
  'js/product-telemetry.js',
  "    var REFERRAL_DESTINATION_TOOLS = { basic_editor: true, qr_generator: true };\n",
  "    var REFERRAL_DESTINATION_TOOLS = { basic_editor: true, qr_generator: true };\n    var CONTINUATION_RELEASE_MARKER = '" + RELEASE + "';\n"
);

mustReplace(
  'js/product-telemetry.js',
  "            target_route: detail.target_route ? normalizedPath(detail.target_route) : null,\n            card_mode: detail.card_mode || null\n",
  "            target_route: detail.target_route ? normalizedPath(detail.target_route) : null,\n            card_mode: detail.card_mode || null,\n            recommendation_id: detail.recommendation_id || null,\n            source_workspace: detail.source_workspace || null,\n            destination_workspace: detail.destination_workspace || null,\n            path_version: detail.path_version || null,\n            release_marker: detail.release_marker || null,\n            handoff_required: typeof detail.handoff_required === 'boolean' ? detail.handoff_required : null,\n            restore_required: typeof detail.restore_required === 'boolean' ? detail.restore_required : null\n"
);

mustReplace(
  'js/product-telemetry.js',
  "    function trackOnce(key, eventName, detail) {\n        if (trackedOnce[key]) return false;\n        trackedOnce[key] = true;\n        track(eventName, detail);\n        return true;\n    }\n",
  "    function trackOnce(key, eventName, detail) {\n        if (trackedOnce[key]) return false;\n        trackedOnce[key] = true;\n        track(eventName, detail);\n        return true;\n    }\n\n    function normalizeContinuationDetail(detail) {\n        detail = detail || {};\n        var source = detail.source_workspace || detail.sourceWorkspace || null;\n        var destination = detail.destination_workspace || detail.destinationWorkspace || null;\n        var recommendation = detail.recommendation_id || detail.recommendationId || detail.actionId || null;\n        if (!source || !destination || !recommendation) return null;\n        return {\n            recommendation_id: recommendation,\n            source_workspace: source,\n            destination_workspace: destination,\n            path_version: detail.path_version || detail.pathVersion || 'v2',\n            release_marker: detail.release_marker || detail.releaseMarker || CONTINUATION_RELEASE_MARKER,\n            handoff_required: detail.handoff_required !== false && detail.handoffRequired !== false,\n            restore_required: detail.restore_required !== false && detail.restoreRequired !== false\n        };\n    }\n\n    function continuationContextFromDocument() {\n        var node = document.documentElement;\n        if (!node) return null;\n        return normalizeContinuationDetail({\n            recommendation_id: node.getAttribute('data-wu-continuation-recommendation'),\n            source_workspace: node.getAttribute('data-wu-continuation-source'),\n            destination_workspace: node.getAttribute('data-wu-continuation-destination'),\n            path_version: node.getAttribute('data-wu-continuation-path-version'),\n            release_marker: node.getAttribute('data-wu-continuation-release'),\n            handoff_required: node.getAttribute('data-wu-continuation-handoff-required') !== 'false',\n            restore_required: node.getAttribute('data-wu-continuation-restore-required') !== 'false'\n        });\n    }\n\n    function rememberContinuationContext(detail) {\n        var meta = normalizeContinuationDetail(detail);\n        var node = document.documentElement;\n        if (!meta || !node) return false;\n        node.setAttribute('data-wu-continuation-recommendation', meta.recommendation_id);\n        node.setAttribute('data-wu-continuation-source', meta.source_workspace);\n        node.setAttribute('data-wu-continuation-destination', meta.destination_workspace);\n        node.setAttribute('data-wu-continuation-path-version', meta.path_version);\n        node.setAttribute('data-wu-continuation-release', meta.release_marker);\n        node.setAttribute('data-wu-continuation-handoff-required', meta.handoff_required ? 'true' : 'false');\n        node.setAttribute('data-wu-continuation-restore-required', meta.restore_required ? 'true' : 'false');\n        return true;\n    }\n\n    function trackContinuationPath(stage, detail) {\n        var meta = normalizeContinuationDetail(detail);\n        if (!meta || !/^(eligible|shown|selected|handoff_created|destination_ready|payload_restored|meaningful_start|destination_outcome)$/.test(String(stage || ''))) return false;\n        if (stage === 'payload_restored') rememberContinuationContext(meta);\n        var key = ['continuation-path', stage, meta.recommendation_id, meta.source_workspace, meta.destination_workspace, meta.path_version].join(':');\n        return trackOnce(key, 'continuation_path_' + stage, meta);\n    }\n\n    function recommendationDetail(control) {\n        if (!control || !control.getAttribute) return null;\n        var panel = control.closest && control.closest('[data-wu-next-step-version=\"2\"]');\n        var recommendation = control.getAttribute('data-wu-next-step-action');\n        var source = panel && panel.getAttribute('data-wu-source-workspace');\n        var destination = control.getAttribute('data-wu-continuity-target');\n        if (!recommendation || !source || !destination) return null;\n        return normalizeContinuationDetail({\n            recommendation_id: recommendation,\n            source_workspace: source,\n            destination_workspace: destination,\n            path_version: 'v2',\n            release_marker: CONTINUATION_RELEASE_MARKER,\n            handoff_required: true,\n            restore_required: true\n        });\n    }\n\n    function trackContinuationMeaningfulInteraction() {\n        var meta = continuationContextFromDocument();\n        if (meta) trackContinuationPath('meaningful_start', meta);\n    }\n"
);

mustReplace(
  'js/product-telemetry.js',
  "    function trackContinuationMeaningfulStart() {\n        if (route !== '/urdu-editor' || !document.body.hasAttribute('data-rich-handoff-imported')) return;\n        trackOnce('continuation-destination-meaningful-start', 'continuation_destination_meaningful_start', { target_route: '/urdu-editor' });\n    }\n",
  "    function trackContinuationMeaningfulStart() {\n        if (route !== '/urdu-editor' || !document.body.hasAttribute('data-rich-handoff-imported')) return;\n        trackOnce('continuation-destination-meaningful-start', 'continuation_destination_meaningful_start', { target_route: '/urdu-editor' });\n        trackContinuationMeaningfulInteraction();\n    }\n"
);

mustReplace(
  'js/product-telemetry.js',
  "            var handoff = closest('[data-create-card], [data-create-qr], [data-wu-next-step-action], .home-actions-group-create a');\n            if (handoff) {\n                markEngaged();\n                var href = handoff.getAttribute('href');\n                var targetRoute = href || (handoff.hasAttribute('data-create-card') ? '/urdu-card-studio' : '/qr-code-generator');\n                track('tool_handoff', { target_route: targetRoute, length_bucket: lengthBucket(textLength()) });\n                return;\n            }\n",
  "            var handoff = closest('[data-create-card], [data-create-qr], [data-wu-next-step-action], .home-actions-group-create a');\n            if (handoff) {\n                markEngaged();\n                var recommendation = recommendationDetail(handoff);\n                if (recommendation) trackContinuationPath('selected', recommendation);\n                var href = handoff.getAttribute('href');\n                var targetRoute = href || (handoff.hasAttribute('data-create-card') ? '/urdu-card-studio' : '/qr-code-generator');\n                track('tool_handoff', { target_route: targetRoute, length_bucket: lengthBucket(textLength()) });\n                return;\n            }\n"
);

mustReplace(
  'js/product-telemetry.js',
  "    // WU-PLAT-002H Gate A completion: continuation funnel. Kept fully\n    // decoupled from js/card-studio-entry.js / js/core-continuity.js (two\n    // independent, order-dependent handoff-wiring systems -- see the Gate A\n    // completion plan) by listening for the v2 path's DOM events centrally\n    // and polling for the presence of any continuation control for \"shown\".\n    function bindContinuationSignals() {\n        document.addEventListener('write-urdu:handoff-started', function () { track('continuation_stored'); });\n        document.addEventListener('write-urdu:handoff-imported', function () { track('continuation_payload_restored'); });\n        var attempts = 0;\n        var timer = window.setInterval(function () {\n            attempts += 1;\n            if (document.querySelector('[data-wu-next-step-action], [data-continue-rich], [data-create-card], [data-create-qr], .home-actions-group-create a')) {\n                trackOnce('continuation-shown', 'continuation_shown');\n                window.clearInterval(timer);\n            } else if (attempts >= 40) {\n                window.clearInterval(timer);\n            }\n        }, 250);\n    }\n",
  "    // Slice 1 keeps the coarse Gate A counters for historical continuity,\n    // while adding a bounded per-recommendation diagnostic path. Hidden\n    // overflow actions are eligible but are not counted as shown until their\n    // disclosure is opened. No recommendation identity is derived from text.\n    function trackRecommendationControls() {\n        var controls = Array.prototype.slice.call(document.querySelectorAll('[data-wu-next-step-action]'));\n        controls.forEach(function (control) {\n            var meta = recommendationDetail(control);\n            if (!meta) return;\n            trackContinuationPath('eligible', meta);\n            var details = control.closest && control.closest('details');\n            if (!details || details.open) trackContinuationPath('shown', meta);\n        });\n        document.querySelectorAll('[data-wu-next-step-version=\"2\"] details').forEach(function (details) {\n            if (details.getAttribute('data-wu-continuation-toggle-bound') === 'true') return;\n            details.setAttribute('data-wu-continuation-toggle-bound', 'true');\n            details.addEventListener('toggle', function () { if (details.open) trackRecommendationControls(); });\n        });\n        return controls.length > 0;\n    }\n\n    function bindContinuationSignals() {\n        document.addEventListener('write-urdu:handoff-started', function (event) {\n            track('continuation_stored');\n            trackContinuationPath('handoff_created', event && event.detail || {});\n        });\n        document.addEventListener('write-urdu:handoff-imported', function () { track('continuation_payload_restored'); });\n        var attempts = 0;\n        var timer = window.setInterval(function () {\n            attempts += 1;\n            var hasRecommendations = trackRecommendationControls();\n            if (hasRecommendations || document.querySelector('[data-continue-rich], [data-create-card], [data-create-qr], .home-actions-group-create a')) {\n                trackOnce('continuation-shown', 'continuation_shown');\n            }\n            if (attempts >= 80) window.clearInterval(timer);\n        }, 250);\n    }\n"
);

mustReplace(
  'js/product-telemetry.js',
  "        document.addEventListener('input', function (event) {\n            if (event.target && event.target.closest && event.target.closest(rootSelector)) markEngaged();\n        }, true);\n",
  "        document.addEventListener('input', function (event) {\n            if (event.target && event.target.closest && event.target.closest(rootSelector)) {\n                markEngaged();\n                trackContinuationMeaningfulInteraction();\n            }\n        }, true);\n"
);

mustReplace(
  'js/product-telemetry.js',
  "            markEngaged();\n            if (event.target.matches && event.target.matches('input[type=\"file\"]') && event.target.files && event.target.files.length) {\n",
  "            markEngaged();\n            trackContinuationMeaningfulInteraction();\n            if (event.target.matches && event.target.matches('input[type=\"file\"]') && event.target.files && event.target.files.length) {\n"
);

mustReplace(
  'js/product-telemetry.js',
  "            if (action && action.closest(rootSelector)) markEngaged();\n",
  "            if (action && action.closest(rootSelector)) { markEngaged(); trackContinuationMeaningfulInteraction(); }\n"
);

mustReplace(
  'js/product-telemetry.js',
  "        track(name, detail);\n        if (writerFunnelEligible()) trackOnce('writer-outcome-first', 'writer_outcome_first');\n",
  "        track(name, detail);\n        var continuationContext = continuationContextFromDocument();\n        if (continuationContext) trackContinuationPath('destination_outcome', continuationContext);\n        if (writerFunnelEligible()) trackOnce('writer-outcome-first', 'writer_outcome_first');\n"
);

mustReplace(
  'js/product-telemetry.js',
  "        trackOutcome: trackOutcome,\n        lengthBucket: lengthBucket,\n",
  "        trackOutcome: trackOutcome,\n        trackContinuationPath: trackContinuationPath,\n        rememberContinuationContext: rememberContinuationContext,\n        continuationContextFromDocument: continuationContextFromDocument,\n        lengthBucket: lengthBucket,\n"
);

// ---------------------------------------------------------------------------
// Rich Editor: prefer v2 envelope, preserve conflict protection, only emit
// ready/restored after the editor can actually accept and has accepted state.
// ---------------------------------------------------------------------------
mustReplace(
  'js/card-studio-entry.js',
  "    function waitForRichEditor(incoming, html, attempt) {\n",
  "    function continuationPath(stage, envelope) {\n        if (!envelope || !window.WriteUrduWorkspaceHandoff || !window.WriteUrduTelemetry || !window.WriteUrduTelemetry.trackContinuationPath) return;\n        window.WriteUrduTelemetry.trackContinuationPath(stage, window.WriteUrduWorkspaceHandoff.telemetryDetail(envelope));\n    }\n\n    function waitForRichEditor(incoming, html, attempt) {\n"
);

mustReplace(
  'js/card-studio-entry.js',
  "        if (editor && editor.initialized) {\n            var currentText = String(editor.getContent({ format: 'text' }) || '').trim();\n",
  "        if (editor && editor.initialized) {\n            if (incoming.__wuEnvelope) continuationPath('destination_ready', incoming.__wuEnvelope);\n            var currentText = String(editor.getContent({ format: 'text' }) || '').trim();\n"
);

mustReplace(
  'js/card-studio-entry.js',
  "            editor.setContent(html);\n            track('continuation_payload_restored', { target_route: '/urdu-editor' });\n            document.body.setAttribute('data-rich-handoff-imported', 'true');\n",
  "            if (incoming.__wuPendingV2 && window.WriteUrduWorkspaceHandoff && typeof window.WriteUrduWorkspaceHandoff.take === 'function') {\n                var consumed = window.WriteUrduWorkspaceHandoff.take('rich-editor');\n                if (!consumed) return;\n                incoming.__wuEnvelope = consumed;\n                incoming.__wuPendingV2 = false;\n            }\n            editor.setContent(html);\n            track('continuation_payload_restored', { target_route: '/urdu-editor' });\n            if (incoming.__wuEnvelope) continuationPath('payload_restored', incoming.__wuEnvelope);\n            document.body.setAttribute('data-rich-handoff-imported', 'true');\n"
);

mustReplace(
  'js/card-studio-entry.js',
  "    function consumeRichHandoff() {\n        if (normalizePath() !== '/urdu-editor') return;\n        var incoming = readOneTimeHandoff('rich');\n        if (!incoming) return;\n        track('continuation_destination_ready', { target_route: '/urdu-editor' });\n        var html = plainTextToHtml(incoming.text);\n        stageRichDraft(incoming, html);\n        waitForRichEditor(incoming, html, 0);\n    }\n",
  "    function consumeRichHandoff() {\n        if (normalizePath() !== '/urdu-editor') return;\n        var handoff = window.WriteUrduWorkspaceHandoff;\n        var envelope = handoff && typeof handoff.peek === 'function' ? handoff.peek('rich-editor') : null;\n        var incoming = null;\n        if (envelope && envelope.payload && envelope.payload.kind === 'plain-text' && typeof envelope.payload.text === 'string' && envelope.payload.text.trim()) {\n            incoming = {\n                version: 1,\n                text: envelope.payload.text,\n                source: envelope.source && envelope.source.workspace || 'basic-writer',\n                createdAt: new Date(envelope.createdAt).toISOString(),\n                __wuEnvelope: envelope,\n                __wuPendingV2: true\n            };\n        } else {\n            incoming = readOneTimeHandoff('rich');\n            if (incoming && handoff && typeof handoff.fromLegacy === 'function') incoming.__wuEnvelope = handoff.fromLegacy('rich-editor', incoming);\n        }\n        if (!incoming) return;\n        var html = plainTextToHtml(incoming.text);\n        stageRichDraft(incoming, html);\n        waitForRichEditor(incoming, html, 0);\n    }\n"
);

// ---------------------------------------------------------------------------
// Card Studio: don't consume v2 state before the app is ready and has applied
// it. This turns readiness/restore into real states and preserves retry state.
// ---------------------------------------------------------------------------
mustReplace(
  'js/card-studio-handoff-adapter.js',
  "    function consume() {\n        if (normalizePath() !== '/urdu-card-studio') return null;\n        var handoff = root.WriteUrduWorkspaceHandoff;\n        if (!handoff || typeof handoff.take !== 'function' || typeof handoff.peek !== 'function') return null;\n\n        var preview = handoff.peek(TARGET);\n        if (!preview || !preview.payload) return null;\n        var kind = preview.payload.kind;\n        var template = null;\n        if (kind === 'template-seed') {\n            template = templateFromId(preview.payload.templateId || preview.context && preview.context.templateId);\n            if (!template) return null;\n        } else if (kind !== 'plain-text') return null;\n\n        var envelope = handoff.take(TARGET);\n        if (!envelope || !envelope.payload) return null;\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/urdu-card-studio' });\n        if (template) applyTemplateRoute(template);\n\n        var appliedLive = applyToRunningApp(envelope, template);\n        if (!appliedLive && !writeLegacyText(envelope)) return null;\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/urdu-card-studio' });\n\n        if (root.document && root.document.documentElement) {\n            root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);\n            root.document.documentElement.setAttribute('data-wu-card-seed-applied', appliedLive ? 'live' : 'staged');\n        }\n        return envelope;\n    }\n",
  "    function path(stage, handoff, envelope) {\n        if (!envelope || !root.WriteUrduTelemetry || !root.WriteUrduTelemetry.trackContinuationPath) return;\n        root.WriteUrduTelemetry.trackContinuationPath(stage, handoff.telemetryDetail(envelope));\n    }\n\n    function consume() {\n        if (normalizePath() !== '/urdu-card-studio') return null;\n        var handoff = root.WriteUrduWorkspaceHandoff;\n        if (!handoff || typeof handoff.take !== 'function' || typeof handoff.peek !== 'function') return null;\n\n        var preview = handoff.peek(TARGET);\n        if (!preview || !preview.payload) return null;\n        var kind = preview.payload.kind;\n        var template = null;\n        if (kind === 'template-seed') {\n            template = templateFromId(preview.payload.templateId || preview.context && preview.context.templateId);\n            if (!template) return null;\n        } else if (kind !== 'plain-text') return null;\n\n        var app = root.WriteUrduCardStudioApp;\n        var core = root.WriteUrduCardStudio;\n        if (!app || !core || typeof app.getState !== 'function') return null;\n        path('destination_ready', handoff, preview);\n        if (template) applyTemplateRoute(template);\n        if (!applyToRunningApp(preview, template)) return null;\n\n        var envelope = handoff.take(TARGET);\n        if (!envelope || !envelope.payload) return null;\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/urdu-card-studio' });\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/urdu-card-studio' });\n        path('payload_restored', handoff, envelope);\n\n        if (root.document && root.document.documentElement) {\n            root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);\n            root.document.documentElement.setAttribute('data-wu-card-seed-applied', 'live');\n        }\n        return envelope;\n    }\n"
);

// ---------------------------------------------------------------------------
// QR: wait for the actual generator to consume the legacy mirror before taking
// v2 state. If import never completes, the v2 envelope remains retryable.
// ---------------------------------------------------------------------------
mustReplace(
  'js/qr-handoff-adapter.js',
  "    function consume() {\n        if (normalizePath() !== '/qr-code-generator') return null;\n        var handoff = root.WriteUrduWorkspaceHandoff;\n        if (!handoff || typeof handoff.take !== 'function') return null;\n        var envelope = handoff.take(TARGET);\n        if (!envelope || !envelope.payload || envelope.payload.kind !== 'plain-text') return null;\n        var text = typeof envelope.payload.text === 'string' ? envelope.payload.text : '';\n        if (!text.trim()) return null;\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/qr-code-generator' });\n        try {\n            root.sessionStorage.setItem(LEGACY_KEY, JSON.stringify({\n                version: 1,\n                type: 'text',\n                text: text,\n                source: envelope.source && envelope.source.workspace || 'workspace',\n                createdAt: new Date(envelope.createdAt || Date.now()).toISOString()\n            }));\n        } catch (error) {\n            return null;\n        }\n        if (root.document && root.document.documentElement) {\n            root.document.documentElement.setAttribute('data-wu-qr-v2-imported', 'true');\n        }\n        return envelope;\n    }\n\n    var consumed = consume();\n    root.WriteUrduQrHandoffAdapter = { TARGET: TARGET, consume: consume, consumed: consumed };\n",
  "    function path(stage, handoff, envelope) {\n        if (!envelope || !root.WriteUrduTelemetry || !root.WriteUrduTelemetry.trackContinuationPath) return;\n        root.WriteUrduTelemetry.trackContinuationPath(stage, handoff.telemetryDetail(envelope));\n    }\n\n    function consume() {\n        if (normalizePath() !== '/qr-code-generator') return null;\n        var handoff = root.WriteUrduWorkspaceHandoff;\n        if (!handoff || typeof handoff.take !== 'function' || typeof handoff.peek !== 'function') return null;\n        var preview = handoff.peek(TARGET);\n        if (!preview || !preview.payload || preview.payload.kind !== 'plain-text') return null;\n        var imported = root.document && root.document.documentElement && root.document.documentElement.getAttribute('data-wu-qr-incoming-restored') === 'true';\n        if (!imported) return null;\n        path('destination_ready', handoff, preview);\n        var envelope = handoff.take(TARGET);\n        if (!envelope) return null;\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/qr-code-generator' });\n        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/qr-code-generator' });\n        path('payload_restored', handoff, envelope);\n        if (root.document && root.document.documentElement) root.document.documentElement.setAttribute('data-wu-qr-v2-imported', 'true');\n        return envelope;\n    }\n\n    var consumed = consume();\n    if (!consumed && normalizePath() === '/qr-code-generator') {\n        root.document.addEventListener('write-urdu:qr-generator-imported', function () {\n            var envelope = consume();\n            if (root.WriteUrduQrHandoffAdapter) root.WriteUrduQrHandoffAdapter.consumed = envelope;\n        }, { once: true });\n    }\n    root.WriteUrduQrHandoffAdapter = { TARGET: TARGET, consume: consume, consumed: consumed };\n"
);

mustReplace(
  'js/qr-generator.js',
  "    setState(saved); bind(); applyLocale(); restoreIndexedLogo(saved);\n}(window, document));",
  "    setState(saved); bind(); applyLocale(); restoreIndexedLogo(saved);\n    if (incoming && document.documentElement) {\n        document.documentElement.setAttribute('data-wu-qr-incoming-restored', 'true');\n        document.dispatchEvent(new CustomEvent('write-urdu:qr-generator-imported'));\n    }\n}(window, document));"
);

// ---------------------------------------------------------------------------
// API: bounded path event enums + same-D1 hourly path rollup (no raw events).
// ---------------------------------------------------------------------------
mustReplace(
  'functions/api/events.js',
  "    'continuation_destination_meaningful_start',\n    'share_destination_ready',\n",
  "    'continuation_destination_meaningful_start',\n    'continuation_path_eligible',\n    'continuation_path_shown',\n    'continuation_path_selected',\n    'continuation_path_handoff_created',\n    'continuation_path_destination_ready',\n    'continuation_path_payload_restored',\n    'continuation_path_meaningful_start',\n    'continuation_path_destination_outcome',\n    'share_destination_ready',\n"
);

mustReplace(
  'functions/api/events.js',
  "const CARD_MODES = new Set(['quick', 'advanced']);\n",
  "const CARD_MODES = new Set(['quick', 'advanced']);\nconst CONTINUATION_RECOMMENDATIONS = new Set([\n    'basic-to-rich', 'basic-to-card', 'basic-to-qr',\n    'keyboard-to-rich', 'keyboard-to-card', 'keyboard-to-qr',\n    'rich-to-card', 'rich-to-qr',\n    'cleaner-to-basic', 'cleaner-to-rich', 'cleaner-to-card', 'cleaner-to-qr',\n    'image-text-to-cleaner', 'image-text-to-basic', 'image-text-to-rich',\n    'voice-to-basic', 'voice-to-rich', 'voice-to-card',\n    'inpage-to-cleaner', 'inpage-to-basic', 'inpage-to-rich',\n    'stylish-to-name-art', 'stylish-to-card', 'share-to-card', 'share-to-basic',\n    'legacy-compatibility'\n]);\nconst CONTINUATION_WORKSPACES = new Set([\n    'basic-writer', 'urdu-keyboard', 'rich-editor', 'text-cleaner', 'image-to-urdu-text',\n    'voice-typing', 'inpage-converter', 'card-studio', 'qr-generator', 'stylish-text',\n    'name-art', 'public-share'\n]);\nconst CONTINUATION_PATH_VERSIONS = new Set(['v2', 'legacy-v1']);\nconst CONTINUATION_RELEASE_MARKERS = new Set(['" + RELEASE + "']);\nconst CONTINUATION_PATH_EVENTS = new Set([\n    'continuation_path_eligible', 'continuation_path_shown', 'continuation_path_selected',\n    'continuation_path_handoff_created', 'continuation_path_destination_ready',\n    'continuation_path_payload_restored', 'continuation_path_meaningful_start',\n    'continuation_path_destination_outcome'\n]);\nconst CONTINUATION_PATH_COLUMNS = ['eligible', 'shown', 'selected', 'handoff_created', 'destination_ready', 'payload_restored', 'meaningful_start', 'destination_outcome'];\n"
);

mustReplace(
  'functions/api/events.js',
  "    `CREATE TABLE IF NOT EXISTS product_telemetry_meta (\n",
  "    `CREATE TABLE IF NOT EXISTS continuation_hourly_paths (\n        bucket_hour TEXT NOT NULL,\n        recommendation_id TEXT NOT NULL,\n        source_workspace TEXT NOT NULL,\n        destination_workspace TEXT NOT NULL,\n        path_version TEXT NOT NULL,\n        release_marker TEXT NOT NULL,\n        device_class TEXT NOT NULL,\n        handoff_required INTEGER NOT NULL DEFAULT 1,\n        restore_required INTEGER NOT NULL DEFAULT 1,\n        eligible INTEGER NOT NULL DEFAULT 0,\n        shown INTEGER NOT NULL DEFAULT 0,\n        selected INTEGER NOT NULL DEFAULT 0,\n        handoff_created INTEGER NOT NULL DEFAULT 0,\n        destination_ready INTEGER NOT NULL DEFAULT 0,\n        payload_restored INTEGER NOT NULL DEFAULT 0,\n        meaningful_start INTEGER NOT NULL DEFAULT 0,\n        destination_outcome INTEGER NOT NULL DEFAULT 0,\n        latest_event_at TEXT,\n        PRIMARY KEY (bucket_hour, recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class)\n    )`,\n    `CREATE TABLE IF NOT EXISTS product_telemetry_meta (\n"
);

mustReplace(
  'functions/api/events.js',
  "    const targetRoute = input.target_route ? cleanRoute(input.target_route) : null;\n    if (input.target_route && !targetRoute) return null;\n\n    return {\n",
  "    const targetRoute = input.target_route ? cleanRoute(input.target_route) : null;\n    if (input.target_route && !targetRoute) return null;\n    const isContinuationPath = CONTINUATION_PATH_EVENTS.has(eventName);\n    const recommendationId = enumValue(input.recommendation_id, CONTINUATION_RECOMMENDATIONS);\n    const sourceWorkspace = enumValue(input.source_workspace, CONTINUATION_WORKSPACES);\n    const destinationWorkspace = enumValue(input.destination_workspace, CONTINUATION_WORKSPACES);\n    const pathVersion = enumValue(input.path_version, CONTINUATION_PATH_VERSIONS);\n    const releaseMarker = enumValue(input.release_marker, CONTINUATION_RELEASE_MARKERS);\n    if (isContinuationPath && (!recommendationId || !sourceWorkspace || !destinationWorkspace || !pathVersion || !releaseMarker)) return null;\n\n    return {\n"
);

mustReplace(
  'functions/api/events.js',
  "        cardMode: enumValue(input.card_mode, CARD_MODES),\n        targetRoute\n",
  "        cardMode: enumValue(input.card_mode, CARD_MODES),\n        targetRoute,\n        recommendationId,\n        sourceWorkspace,\n        destinationWorkspace,\n        pathVersion,\n        releaseMarker,\n        handoffRequired: typeof input.handoff_required === 'boolean' ? (input.handoff_required ? 1 : 0) : 1,\n        restoreRequired: typeof input.restore_required === 'boolean' ? (input.restore_required ? 1 : 0) : 1\n"
);

mustReplace(
  'functions/api/events.js',
  "function aggregateEvents(events, now) {\n    const byTool = new Map();\n",
  "function continuationPathStage(eventName) {\n    return String(eventName || '').replace(/^continuation_path_/, '');\n}\n\nfunction aggregateEvents(events, now) {\n    const byTool = new Map();\n"
);

mustReplace(
  'functions/api/events.js',
  "    const handoffs = new Map();\n",
  "    const handoffs = new Map();\n    const continuationPaths = new Map();\n"
);

mustReplace(
  'functions/api/events.js',
  "        if (event.eventName === 'tool_handoff' && event.targetRoute) {\n",
  "        if (CONTINUATION_PATH_EVENTS.has(event.eventName)) {\n            const key = [event.recommendationId, event.sourceWorkspace, event.destinationWorkspace, event.pathVersion, event.releaseMarker, event.deviceClass || 'unknown'].join('|');\n            if (!continuationPaths.has(key)) {\n                const delta = {\n                    recommendationId: event.recommendationId, sourceWorkspace: event.sourceWorkspace, destinationWorkspace: event.destinationWorkspace,\n                    pathVersion: event.pathVersion, releaseMarker: event.releaseMarker, deviceClass: event.deviceClass || 'unknown',\n                    handoffRequired: event.handoffRequired, restoreRequired: event.restoreRequired, latest_event_at: now\n                };\n                CONTINUATION_PATH_COLUMNS.forEach((column) => { delta[column] = 0; });\n                continuationPaths.set(key, delta);\n            }\n            const delta = continuationPaths.get(key);\n            const stage = continuationPathStage(event.eventName);\n            if (CONTINUATION_PATH_COLUMNS.indexOf(stage) >= 0) delta[stage] += 1;\n        }\n        if (event.eventName === 'tool_handoff' && event.targetRoute) {\n"
);

mustReplace(
  'functions/api/events.js',
  "        shareByTool: Array.from(shareByTool.values()),\n        handoffs: Array.from(handoffs.values())\n",
  "        shareByTool: Array.from(shareByTool.values()),\n        handoffs: Array.from(handoffs.values()),\n        continuationPaths: Array.from(continuationPaths.values())\n"
);

mustReplace(
  'functions/api/events.js',
  "function handoffUpsert(db, bucket, item) {\n    return db.prepare(`INSERT INTO product_hourly_handoffs (bucket_hour, tool, target_route, events)\n                       VALUES (?1, ?2, ?3, ?4)\n                       ON CONFLICT(bucket_hour, tool, target_route) DO UPDATE SET events = events + excluded.events`)\n        .bind(bucket, item.tool, item.targetRoute, item.events);\n}\n",
  "function handoffUpsert(db, bucket, item) {\n    return db.prepare(`INSERT INTO product_hourly_handoffs (bucket_hour, tool, target_route, events)\n                       VALUES (?1, ?2, ?3, ?4)\n                       ON CONFLICT(bucket_hour, tool, target_route) DO UPDATE SET events = events + excluded.events`)\n        .bind(bucket, item.tool, item.targetRoute, item.events);\n}\n\nfunction continuationPathUpsert(db, bucket, item) {\n    const columns = ['bucket_hour', 'recommendation_id', 'source_workspace', 'destination_workspace', 'path_version', 'release_marker', 'device_class', 'handoff_required', 'restore_required']\n        .concat(CONTINUATION_PATH_COLUMNS).concat(['latest_event_at']);\n    const placeholders = columns.map(() => '?').join(', ');\n    const assignments = [\n        'handoff_required = MAX(handoff_required, excluded.handoff_required)',\n        'restore_required = MAX(restore_required, excluded.restore_required)'\n    ].concat(CONTINUATION_PATH_COLUMNS.map((column) => `${column} = ${column} + excluded.${column}`))\n      .concat(['latest_event_at = MAX(COALESCE(latest_event_at, excluded.latest_event_at), excluded.latest_event_at)']);\n    const values = [bucket, item.recommendationId, item.sourceWorkspace, item.destinationWorkspace, item.pathVersion, item.releaseMarker, item.deviceClass, item.handoffRequired, item.restoreRequired]\n        .concat(CONTINUATION_PATH_COLUMNS.map((column) => item[column])).concat([item.latest_event_at]);\n    return db.prepare(`INSERT INTO continuation_hourly_paths (${columns.join(', ')}) VALUES (${placeholders})\n                       ON CONFLICT(bucket_hour, recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class)\n                       DO UPDATE SET ${assignments.join(', ')}`).bind(...values);\n}\n"
);

mustReplace(
  'functions/api/events.js',
  "            .concat(aggregated.shareByTool.map((delta) => shareMetricUpsert(db, bucket, delta)))\n            .concat(aggregated.handoffs.map((item) => handoffUpsert(db, bucket, item)));\n",
  "            .concat(aggregated.shareByTool.map((delta) => shareMetricUpsert(db, bucket, delta)))\n            .concat(aggregated.handoffs.map((item) => handoffUpsert(db, bucket, item)))\n            .concat(aggregated.continuationPaths.map((item) => continuationPathUpsert(db, bucket, item)));\n"
);

// ---------------------------------------------------------------------------
// Product Pulse API: aggregate path-level diagnostics and identify loss stage.
// ---------------------------------------------------------------------------
mustReplace(
  'functions/api/internal/product-pulse.js',
  "function continuationSection(current) {\n",
  "function continuationPathSection(pathRows) {\n  const grouped = new Map();\n  (pathRows || []).forEach((row) => {\n    const key = [row.recommendation_id, row.source_workspace, row.destination_workspace, row.path_version, row.release_marker].join('|');\n    if (!grouped.has(key)) {\n      grouped.set(key, {\n        recommendation_id: row.recommendation_id, source_workspace: row.source_workspace, destination_workspace: row.destination_workspace,\n        path_version: row.path_version, release_marker: row.release_marker, handoff_required: Boolean(Number(row.handoff_required)),\n        restore_required: Boolean(Number(row.restore_required)), eligible: 0, shown: 0, selected: 0, handoff_created: 0,\n        destination_ready: 0, payload_restored: 0, meaningful_start: 0, destination_outcome: 0, by_device: []\n      });\n    }\n    const item = grouped.get(key);\n    ['eligible','shown','selected','handoff_created','destination_ready','payload_restored','meaningful_start','destination_outcome'].forEach((field) => { item[field] += n(row, field); });\n    item.by_device.push({\n      device_class: row.device_class, shown: n(row, 'shown'), selected: n(row, 'selected'), destination_ready: n(row, 'destination_ready'), meaningful_start: n(row, 'meaningful_start')\n    });\n  });\n\n  const lossSummary = new Map();\n  function addLoss(stage, parent, child, losses) {\n    const loss = compatibleDifference(parent, child);\n    if (loss === null) return;\n    losses.push({ stage, loss });\n    lossSummary.set(stage, (lossSummary.get(stage) || 0) + loss);\n  }\n\n  const paths = Array.from(grouped.values()).map((item) => {\n    const readyDenominator = item.handoff_required ? item.handoff_created : item.selected;\n    const startDenominator = item.restore_required ? item.payload_restored : item.destination_ready;\n    const losses = [];\n    addLoss('eligible → shown', item.eligible, item.shown, losses);\n    addLoss('shown → selected', item.shown, item.selected, losses);\n    if (item.handoff_required) addLoss('selected → handoff', item.selected, item.handoff_created, losses);\n    addLoss('handoff/navigation → ready', readyDenominator, item.destination_ready, losses);\n    if (item.restore_required) addLoss('ready → restored', item.destination_ready, item.payload_restored, losses);\n    addLoss('restored/ready → meaningful start', startDenominator, item.meaningful_start, losses);\n    if (item.destination_outcome > 0) addLoss('meaningful start → outcome', item.meaningful_start, item.destination_outcome, losses);\n    losses.sort((a, b) => b.loss - a.loss);\n    item.conversion = {\n      shown_rate: boundedRate(item.shown, item.eligible),\n      selected_rate: boundedRate(item.selected, item.shown),\n      handoff_created_rate: item.handoff_required ? boundedRate(item.handoff_created, item.selected) : null,\n      destination_ready_rate: boundedRate(item.destination_ready, readyDenominator),\n      payload_restored_rate: item.restore_required ? boundedRate(item.payload_restored, item.destination_ready) : null,\n      meaningful_start_rate: boundedRate(item.meaningful_start, startDenominator),\n      destination_outcome_rate: item.destination_outcome > 0 ? boundedRate(item.destination_outcome, item.meaningful_start) : null\n    };\n    item.dominant_loss = losses[0] || null;\n    return item;\n  }).sort((a, b) => b.shown - a.shown || b.selected - a.selected);\n\n  const loss_summary = Array.from(lossSummary.entries()).map(([stage, loss]) => ({ stage, loss })).sort((a, b) => b.loss - a.loss);\n  return { ready: paths.length > 0, paths, loss_summary, dominant_loss: loss_summary[0] || null };\n}\n\nfunction continuationSection(current) {\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "  const deviceFunnelReady = await tableExists(db, 'product_hourly_device_metrics');\n",
  "  const continuationPathsReady = await tableExists(db, 'continuation_hourly_paths');\n  const continuationPathsPromise = continuationPathsReady ? db.prepare(`\n      SELECT recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class,\n             MAX(handoff_required) AS handoff_required, MAX(restore_required) AS restore_required,\n             SUM(eligible) AS eligible, SUM(shown) AS shown, SUM(selected) AS selected, SUM(handoff_created) AS handoff_created,\n             SUM(destination_ready) AS destination_ready, SUM(payload_restored) AS payload_restored,\n             SUM(meaningful_start) AS meaningful_start, SUM(destination_outcome) AS destination_outcome\n      FROM continuation_hourly_paths\n      WHERE bucket_hour >= ?1 AND bucket_hour < ?2\n      GROUP BY recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class\n    `).bind(bounds.currentStart, bounds.currentEnd).all() : Promise.resolve({ results: [] });\n  const deviceFunnelReady = await tableExists(db, 'product_hourly_device_metrics');\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "  const [current, previous, handoffResult, toolResult, dailyResult, shareLoop, localeResult, deviceFunnelResult] = await Promise.all([\n",
  "  const [current, previous, handoffResult, toolResult, dailyResult, shareLoop, localeResult, deviceFunnelResult, continuationPathResult] = await Promise.all([\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    shareLoopForWindow(db, bounds),\n    localePromise,\n    deviceFunnelPromise\n",
  "    shareLoopForWindow(db, bounds),\n    localePromise,\n    deviceFunnelPromise,\n    continuationPathsPromise\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    card_studio_funnel: cardStudioSection(rows(toolResult)),\n    continuation: continuationSection(current)\n",
  "    card_studio_funnel: cardStudioSection(rows(toolResult)),\n    continuation: continuationSection(current),\n    continuation_paths: continuationPathSection(rows(continuationPathResult))\n"
);

// ---------------------------------------------------------------------------
// Founder-only dashboard diagnostic. No public CTA/layout changes.
// ---------------------------------------------------------------------------
mustReplace(
  'os/product-pulse.html',
  "      <article class=\"os-card os-panel span-6\" id=\"continuationFunnelPanel\">\n        <div class=\"os-panel-head\"><h2>Continuation</h2><span class=\"os-panel-note\">Shown → selected conversion; downstream raw counts until path consolidation — Slice 0</span></div>\n",
  "      <article class=\"os-card os-panel span-12\" id=\"continuationFunnelPanel\">\n        <div class=\"os-panel-head\"><h2>Continuation</h2><span class=\"os-panel-note\">Slice 1 path diagnostics · stable recommendation IDs · legacy coarse counts retained</span></div>\n"
);

mustReplace(
  'os/product-pulse.html',
  "        <div class=\"os-bars\" id=\"continuationFunnelBars\"></div>\n        <div class=\"os-panel-note\" style=\"margin-top:12px\">Slice 0 deliberately suppresses incompatible downstream percentages while legacy and v2 paths emit different optional steps. Raw counts remain visible; Slice 1 owns path consolidation. No text content in any step.</div>\n",
  "        <div class=\"os-grid\">\n          <div class=\"span-5\"><div class=\"os-panel-head\"><h2>Legacy coarse counts</h2><span class=\"os-panel-note\">Historical continuity only</span></div><div class=\"os-bars\" id=\"continuationFunnelBars\"></div></div>\n          <div class=\"span-7\"><div class=\"os-panel-head\"><h2>Where continuation is lost</h2><span class=\"os-panel-note\" id=\"continuationDiagnosticNote\">Waiting for Slice 1 path data</span></div><div class=\"os-bars\" id=\"continuationLossBars\"></div></div>\n        </div>\n        <div class=\"os-table-wrap\" style=\"margin-top:18px\">\n          <table>\n            <thead><tr><th>Recommendation</th><th>Path</th><th class=\"num\">Eligible</th><th class=\"num\">Shown</th><th class=\"num\">Selected</th><th class=\"num\">Ready</th><th class=\"num\">Restored</th><th class=\"num\">Meaningful start</th><th>Largest loss</th></tr></thead>\n            <tbody id=\"continuationPathRows\"></tbody>\n          </table>\n        </div>\n        <div class=\"os-panel-note\" style=\"margin-top:12px\">Path diagnostics use bounded aggregate counters only: recommendation/source/destination enums, path version, release marker and device class. No editor text, transcript, audio, filename, document/share ID or account identity is collected. N/A steps are excluded from loss calculations.</div>\n"
);

mustReplace(
  'js/product-pulse.js',
  "    renderBars('#continuationFunnelBars', [\n      { label: 'Shown', value: funnel.shown },\n      { label: 'Selected', value: funnel.selected },\n      { label: 'Stored', value: funnel.stored },\n      { label: 'Destination ready', value: funnel.destination_ready },\n      { label: 'Payload restored', value: funnel.payload_restored },\n      { label: 'Meaningful start', value: funnel.meaningful_start }\n    ], 'label', 'value');\n  }\n",
  "    renderBars('#continuationFunnelBars', [\n      { label: 'Shown', value: funnel.shown },\n      { label: 'Selected', value: funnel.selected },\n      { label: 'Stored', value: funnel.stored },\n      { label: 'Destination ready', value: funnel.destination_ready },\n      { label: 'Payload restored', value: funnel.payload_restored },\n      { label: 'Meaningful start', value: funnel.meaningful_start }\n    ], 'label', 'value');\n\n    var diagnostics = data.continuation_paths || {};\n    var note = q('#continuationDiagnosticNote');\n    var pathRows = q('#continuationPathRows');\n    renderBars('#continuationLossBars', diagnostics.loss_summary || [], 'stage', 'loss');\n    if (note) note.textContent = diagnostics.dominant_loss ? ('Largest aggregate loss: ' + diagnostics.dominant_loss.stage + ' (' + fmt(diagnostics.dominant_loss.loss) + ')') : 'No bounded path data yet';\n    if (pathRows) {\n      pathRows.innerHTML = '';\n      var paths = diagnostics.paths || [];\n      if (!paths.length) pathRows.innerHTML = '<tr><td colspan=\"9\" class=\"os-empty\">No Slice 1 continuation path data yet for this period.</td></tr>';\n      paths.forEach(function (item) {\n        var row = document.createElement('tr');\n        var pathLabel = item.source_workspace + ' → ' + item.destination_workspace + ' · ' + item.path_version;\n        var loss = item.dominant_loss ? (item.dominant_loss.stage + ' · ' + fmt(item.dominant_loss.loss)) : '—';\n        var values = [item.recommendation_id, pathLabel, fmt(item.eligible), fmt(item.shown), fmt(item.selected), fmt(item.destination_ready), item.restore_required ? fmt(item.payload_restored) : 'N/A', fmt(item.meaningful_start), loss];\n        values.forEach(function (value, index) {\n          var cell = document.createElement('td');\n          cell.className = index >= 2 && index <= 7 ? 'num' : (index === 0 ? 'os-tool-name' : '');\n          cell.textContent = value;\n          row.appendChild(cell);\n        });\n        pathRows.appendChild(row);\n      });\n    }\n  }\n"
);

// ---------------------------------------------------------------------------
// Same-D1 migration. This is a new aggregate table, not a new database.
// ---------------------------------------------------------------------------
write('migrations/0019_continuation_path_diagnostics.sql', `-- WU-PLAT-002H Slice 1: bounded continuation path diagnostics.\n-- Aggregate hourly counters only; no editor text, transcript, audio, file, document/share ID or account identity.\nCREATE TABLE IF NOT EXISTS continuation_hourly_paths (\n    bucket_hour TEXT NOT NULL,\n    recommendation_id TEXT NOT NULL,\n    source_workspace TEXT NOT NULL,\n    destination_workspace TEXT NOT NULL,\n    path_version TEXT NOT NULL,\n    release_marker TEXT NOT NULL,\n    device_class TEXT NOT NULL,\n    handoff_required INTEGER NOT NULL DEFAULT 1,\n    restore_required INTEGER NOT NULL DEFAULT 1,\n    eligible INTEGER NOT NULL DEFAULT 0,\n    shown INTEGER NOT NULL DEFAULT 0,\n    selected INTEGER NOT NULL DEFAULT 0,\n    handoff_created INTEGER NOT NULL DEFAULT 0,\n    destination_ready INTEGER NOT NULL DEFAULT 0,\n    payload_restored INTEGER NOT NULL DEFAULT 0,\n    meaningful_start INTEGER NOT NULL DEFAULT 0,\n    destination_outcome INTEGER NOT NULL DEFAULT 0,\n    latest_event_at TEXT,\n    PRIMARY KEY (bucket_hour, recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class)\n);\n`);

// ---------------------------------------------------------------------------
// Focused contract: Slice 1 semantics, privacy, transport and diagnostic UI.
// ---------------------------------------------------------------------------
write('tests/product-pulse-slice1-contract.test.js', `const assert = require('node:assert');\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst root = path.resolve(__dirname, '..');\nconst read = (file) => fs.readFileSync(path.join(root, file), 'utf8');\n\nconst events = read('functions/api/events.js');\nconst pulse = read('functions/api/internal/product-pulse.js');\nconst telemetry = read('js/product-telemetry.js');\nconst handoff = read('js/workspace-handoff.js');\nconst continuity = read('js/core-continuity.js');\nconst rich = read('js/card-studio-entry.js');\nconst card = read('js/card-studio-handoff-adapter.js');\nconst qrAdapter = read('js/qr-handoff-adapter.js');\nconst qr = read('js/qr-generator.js');\nconst html = read('os/product-pulse.html');\nconst client = read('js/product-pulse.js');\nconst migration = read('migrations/0019_continuation_path_diagnostics.sql');\n\n['eligible','shown','selected','handoff_created','destination_ready','payload_restored','meaningful_start','destination_outcome'].forEach((stage) => {\n  assert.ok(events.includes('continuation_path_' + stage), 'Missing bounded continuation path event: ' + stage);\n});\nassert.match(events, /CONTINUATION_RECOMMENDATIONS = new Set/, 'Recommendation IDs must be server-bounded enums');\nassert.match(events, /CONTINUATION_WORKSPACES = new Set/, 'Source/destination workspace IDs must be bounded enums');\nassert.match(events, /CONTINUATION_RELEASE_MARKERS = new Set/, 'Release marker must be bounded');\nassert.match(events, /continuation_hourly_paths/, 'Path diagnostics must use a dedicated same-D1 aggregate rollup');\nassert.doesNotMatch(events, /INSERT(?: OR IGNORE)? INTO product_events/i, 'Routine Slice 1 telemetry must not reintroduce raw event writes');\nassert.doesNotMatch(migration, /editor_text|roman_urdu_text|urdu_text|transcript|audio|filename|document_id|share_id|email|account_id/i, 'Path rollup must not contain content or identity fields');\n\n['recommendation_id','source_workspace','destination_workspace','path_version','release_marker','handoff_required','restore_required'].forEach((field) => {\n  assert.ok(telemetry.includes(field), 'Client payload must include bounded path field ' + field);\n});\nassert.match(telemetry, /data-wu-next-step-action/, 'Recommendation identity must come from the stable registry-backed action ID');\nassert.match(telemetry, /details\.open/, 'Hidden overflow recommendations must not count as shown until disclosed');\nassert.match(telemetry, /trackContinuationPath\('selected'/, 'Selection must be attributed to the stable recommendation');\nassert.match(telemetry, /trackContinuationPath\('handoff_created'/, 'Handoff creation must be a distinct path stage');\nassert.match(telemetry, /trackContinuationMeaningfulInteraction/, 'Meaningful start must require destination interaction');\n\nassert.match(handoff, /CONTINUATION_RELEASE_MARKER/, 'Handoff envelope diagnostics must carry a bounded release marker');\nassert.match(handoff, /recommendationId/, 'Handoff telemetry detail must preserve stable recommendation identity');\nassert.match(continuity, /recommendationId: recommendationId \|\| actionId/, 'v2 transfer must carry the stable recommendation into the envelope');\nassert.match(continuity, /pathVersion: 'v2'/, 'v2 transfer must carry explicit path version');\n\nassert.match(rich, /handoff\.peek\('rich-editor'\)/, 'Rich destination must inspect v2 state before falling back to legacy');\nassert.match(rich, /editor && editor\.initialized[\s\S]*continuationPath\('destination_ready'/, 'Rich destination ready cannot be page load alone');\nassert.match(rich, /if \(!replace\) return/, 'Rich draft conflict must remain user-controlled');\nassert.match(rich, /continuationPath\('payload_restored'/, 'Rich restore must fire only after setContent succeeds');\nassert.match(card, /if \(!app \|\| !core \|\| typeof app\.getState !== 'function'\) return null/, 'Card destination must wait for an accept-capable app');\nassert.match(card, /applyToRunningApp\(preview, template\)[\s\S]*handoff\.take\(TARGET\)/, 'Card v2 state must remain retryable until live apply succeeds');\nassert.match(qrAdapter, /data-wu-qr-incoming-restored/, 'QR adapter must wait for actual generator import');\nassert.match(qr, /write-urdu:qr-generator-imported/, 'QR generator must announce actual import after state is applied');\n\nassert.match(pulse, /function continuationPathSection\(/, 'Product Pulse must expose a path diagnostic model');\nassert.match(pulse, /dominant_loss/, 'Product Pulse must identify the dominant bounded loss stage');\nassert.match(pulse, /continuation_hourly_paths/, 'Product Pulse must read the path rollup rather than raw events');\nassert.match(html, /id=\"continuationLossBars\"/, 'Founder dashboard must render aggregate loss stages');\nassert.match(html, /id=\"continuationPathRows\"/, 'Founder dashboard must render per-recommendation paths');\nassert.match(client, /continuation_paths/, 'Dashboard client must consume Slice 1 diagnostics');\nassert.match(client, /Largest aggregate loss/, 'Dashboard must name the observed dominant loss before public CTA changes');\n\nconsole.log('Product Pulse Slice 1 continuation diagnostic contracts passed.');\n`);

mustReplace(
  'scripts/run-contract-tests.js',
  "  'tests/product-pulse-slice0-contract.test.js',\n",
  "  'tests/product-pulse-slice0-contract.test.js',\n  'tests/product-pulse-slice1-contract.test.js',\n"
);

fs.unlinkSync(__filename);
console.log('Product Pulse Slice 1 continuation diagnostic patch applied.');
