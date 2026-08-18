(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWorkspaceRegistry = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var EDGE_TYPES = ['handoff', 'transformation', 'embedded'];
    var STATUSES = ['current', 'planned', 'research'];

    var WORKSPACES = [
        {
            id: 'basic-writer', routes: ['/'], status: 'current', category: 'Write', stages: ['Capture', 'Write'],
            label: 'Start writing in Urdu', technicalLabel: 'Basic writer',
            jobs: ['write a message', 'convert Roman Urdu to Urdu'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'local draft', conflictPolicy: 'preserve current local draft/history before replacement',
            next: [
                { id: 'basic-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' },
                { id: 'basic-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' },
                { id: 'basic-to-qr', target: 'qr-generator', type: 'transformation', label: 'Make a QR code from this text', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'urdu-keyboard', routes: ['/urdu-keyboard'], status: 'current', category: 'Write', stages: ['Capture', 'Write'],
            label: 'Type directly in Urdu', technicalLabel: 'Urdu Keyboard',
            jobs: ['type Urdu directly'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'local draft', conflictPolicy: 'preserve current local draft/history before replacement',
            next: [
                { id: 'keyboard-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' },
                { id: 'keyboard-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' },
                { id: 'keyboard-to-qr', target: 'qr-generator', type: 'transformation', label: 'Make a QR code from this text', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'rich-editor', routes: ['/urdu-editor'], status: 'current', category: 'Write', stages: ['Write', 'Refine', 'Work'],
            label: 'Format an assignment or document', technicalLabel: 'Rich Text Editor',
            jobs: ['format an assignment', 'prepare a document', 'export Word or PDF'], accepts: ['plain-text', 'rich-text'], produces: ['plain-text', 'rich-text'],
            persistence: 'local draft/history', conflictPolicy: 'preserve current rich draft in history before replacement',
            next: [
                { id: 'rich-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' },
                { id: 'rich-to-qr', target: 'qr-generator', type: 'transformation', label: 'Make a QR code from this text', payloadKind: 'plain-text' },
                { id: 'rich-export', target: null, type: 'embedded', label: 'Download or print this document', payloadKind: null }
            ]
        },
        {
            id: 'text-cleaner', routes: ['/urdu-text-cleaner'], status: 'current', category: 'Write', stages: ['Fix'],
            label: 'Fix spacing and Urdu text direction', technicalLabel: 'Urdu Text Cleaner & RTL Fixer',
            jobs: ['clean pasted Urdu', 'fix spacing', 'fix Unicode and direction issues'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'source/result local only', conflictPolicy: 'never overwrite source input automatically',
            next: [
                { id: 'cleaner-to-basic', target: 'basic-writer', type: 'handoff', label: 'Continue writing', payloadKind: 'plain-text' },
                { id: 'cleaner-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' },
                { id: 'cleaner-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' },
                { id: 'cleaner-to-qr', target: 'qr-generator', type: 'transformation', label: 'Make a QR code from this text', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'image-to-urdu-text', routes: ['/urdu-ocr'], status: 'current', category: 'Write', stages: ['Capture'],
            label: 'Image to Urdu Text', technicalLabel: 'Urdu OCR',
            jobs: ['turn a screenshot into editable Urdu text', 'turn a photo or scanned page into editable Urdu text'], accepts: ['image'], produces: ['plain-text'],
            persistence: 'source/result local only', conflictPolicy: 'never overwrite source image/result automatically',
            next: [
                { id: 'image-text-to-cleaner', target: 'text-cleaner', type: 'handoff', label: 'Fix this Urdu text', payloadKind: 'plain-text' },
                { id: 'image-text-to-basic', target: 'basic-writer', type: 'handoff', label: 'Continue writing', payloadKind: 'plain-text' },
                { id: 'image-text-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'voice-typing', routes: ['/tools/urdu-voice-typing'], status: 'current', category: 'Write', stages: ['Capture'],
            label: 'Speak and turn it into Urdu text', technicalLabel: 'Urdu Voice Typing',
            jobs: ['speak Urdu and get editable text'], accepts: ['speech'], produces: ['plain-text'],
            persistence: 'result local only', conflictPolicy: 'never overwrite recognized text automatically',
            next: [
                { id: 'voice-to-basic', target: 'basic-writer', type: 'handoff', label: 'Continue writing', payloadKind: 'plain-text' },
                { id: 'voice-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' },
                { id: 'voice-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'inpage-converter', routes: ['/tools/inpage-unicode-converter'], status: 'current', category: 'Write', stages: ['Capture', 'Fix'],
            label: 'Convert old InPage text to Unicode Urdu', technicalLabel: 'InPage ↔ Unicode Converter',
            jobs: ['convert legacy InPage text to Unicode Urdu', 'convert Unicode Urdu for a legacy workflow'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'source/result local only', conflictPolicy: 'never overwrite source input automatically',
            next: [
                { id: 'inpage-to-cleaner', target: 'text-cleaner', type: 'handoff', label: 'Fix this Urdu text', payloadKind: 'plain-text' },
                { id: 'inpage-to-basic', target: 'basic-writer', type: 'handoff', label: 'Continue writing', payloadKind: 'plain-text' },
                { id: 'inpage-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'card-studio', routes: ['/urdu-card-studio'], status: 'current', category: 'Create', stages: ['Create', 'Publish'],
            label: 'Make a poetry, quote or announcement image', technicalLabel: 'Card Studio',
            jobs: ['make an Urdu card', 'put Urdu on a photo', 'create a Facebook post'], accepts: ['plain-text', 'template-seed', 'visual-project-seed'], produces: ['plain-text', 'visual-project-seed'],
            persistence: 'local project', conflictPolicy: 'preserve existing project before applying incompatible incoming seed',
            next: [
                { id: 'card-download', target: null, type: 'embedded', label: 'Download this image', payloadKind: null },
                { id: 'card-publish', target: null, type: 'embedded', label: 'Publish and share', payloadKind: null },
                { id: 'card-caption', target: null, type: 'embedded', label: 'Copy caption text', payloadKind: null }
            ]
        },
        {
            id: 'templates', routes: ['/urdu-templates'], status: 'current', category: 'Create', stages: ['Create'],
            label: 'Start from an Urdu template', technicalLabel: 'Template Library',
            jobs: ['choose a ready-made Urdu design'], accepts: ['plain-text'], produces: ['template-seed'],
            persistence: 'favorites/recent local only', conflictPolicy: 'template selection never deletes source writing',
            next: [
                { id: 'template-to-card', target: 'card-studio', type: 'handoff', label: 'Edit this template', payloadKind: 'template-seed' }
            ]
        },
        {
            id: 'stylish-text', routes: ['/stylish-urdu-text-generator'], status: 'current', category: 'Create', stages: ['Create'],
            label: 'Create stylish copyable Urdu text', technicalLabel: 'Stylish Urdu Text',
            jobs: ['make copyable styled Urdu text'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'favorites/collections/recent local only', conflictPolicy: 'incoming text never deletes saved collections',
            next: [
                { id: 'stylish-to-name-art', target: 'name-art', type: 'transformation', label: 'Turn this into Urdu name art', payloadKind: 'plain-text' },
                { id: 'stylish-to-card', target: 'card-studio', type: 'transformation', label: 'Create a card with this text', payloadKind: 'plain-text' },
                { id: 'stylish-copy', target: null, type: 'embedded', label: 'Copy this text', payloadKind: null }
            ]
        },
        {
            id: 'name-art', routes: ['/urdu-name-art-maker'], status: 'current', category: 'Create', stages: ['Create'],
            label: 'Make Urdu Name Art or a profile image', technicalLabel: 'Urdu Name Art',
            jobs: ['make a name image', 'make a DP/profile image'], accepts: ['plain-text', 'visual-project-seed'], produces: ['visual-project-seed'],
            persistence: 'local project', conflictPolicy: 'preserve current project before incompatible import',
            next: [
                { id: 'name-art-download', target: null, type: 'embedded', label: 'Download this image', payloadKind: null }
            ]
        },
        {
            id: 'whatsapp-status', routes: ['/urdu-whatsapp-status-maker'], status: 'current', category: 'Create', stages: ['Create', 'Publish'],
            label: 'Create a WhatsApp Status', technicalLabel: 'WhatsApp Status Maker',
            jobs: ['make an Urdu WhatsApp Status image'], accepts: ['plain-text', 'template-seed'], produces: ['visual-project-seed'],
            persistence: 'local project', conflictPolicy: 'preserve current project before incompatible import',
            next: [
                { id: 'whatsapp-download', target: null, type: 'embedded', label: 'Download this status image', payloadKind: null }
            ]
        },
        {
            id: 'instagram-post', routes: ['/urdu-instagram-post-maker'], status: 'current', category: 'Create', stages: ['Create', 'Publish'],
            label: 'Create an Instagram post', technicalLabel: 'Instagram Post Maker',
            jobs: ['make an Urdu Instagram post or story'], accepts: ['plain-text', 'template-seed'], produces: ['plain-text', 'visual-project-seed'],
            persistence: 'local project', conflictPolicy: 'preserve current project before incompatible import',
            next: [
                { id: 'instagram-download', target: null, type: 'embedded', label: 'Download this post', payloadKind: null },
                { id: 'instagram-caption', target: null, type: 'embedded', label: 'Copy caption text', payloadKind: null }
            ]
        },
        {
            id: 'qr-generator', routes: ['/qr-code-generator'], status: 'current', category: 'Create', stages: ['Publish'],
            label: 'Create a QR code from text or a link', technicalLabel: 'QR Code Generator',
            jobs: ['turn text into a QR code', 'turn a link into a QR code'], accepts: ['plain-text'], produces: ['visual-project-seed'],
            persistence: 'current form state local only', conflictPolicy: 'incoming payload never replaces an existing non-empty payload without explicit action',
            next: [
                { id: 'qr-download', target: null, type: 'embedded', label: 'Download this QR code', payloadKind: null }
            ]
        },
        {
            id: 'invoice', routes: ['/urdu-invoice-generator'], status: 'current', category: 'Work', stages: ['Work', 'Publish'],
            label: 'Create an Urdu or English invoice', technicalLabel: 'Invoice Generator',
            jobs: ['make an invoice'], accepts: ['structured-seed'], produces: ['structured-seed'],
            persistence: 'invoice local draft', conflictPolicy: 'never import unstructured editor text as invoice data',
            next: [
                { id: 'invoice-payment-qr', target: null, type: 'embedded', label: 'Add payment QR', payloadKind: null },
                { id: 'invoice-export', target: null, type: 'embedded', label: 'Download or print invoice', payloadKind: null }
            ]
        },
        {
            id: 'public-share', routes: ['/s/:id'], status: 'current', category: 'Create', stages: ['Publish'],
            label: 'View shared Urdu writing', technicalLabel: 'Public Share Page',
            jobs: ['view shared Urdu writing', 'create your own version'], accepts: ['share-artifact'], produces: ['plain-text'],
            persistence: 'published artifact service', conflictPolicy: 'recipient continuation never mutates the published source artifact',
            next: [
                { id: 'share-to-card', target: 'card-studio', type: 'handoff', label: 'Create your own version', payloadKind: 'plain-text' },
                { id: 'share-to-basic', target: 'basic-writer', type: 'handoff', label: 'Use this text', payloadKind: 'plain-text' }
            ]
        },
        {
            id: 'my-drafts', routes: ['/my-drafts'], status: 'planned', category: 'Utility', stages: ['Resume'],
            label: 'My drafts', technicalLabel: 'Cloud Drafts',
            jobs: ['resume writing on another device'], accepts: ['draft-reference'], produces: ['draft-reference'],
            persistence: 'account cloud drafts plus local safety layer', conflictPolicy: 'open in owning editor with revision conflict recovery',
            next: []
        },
        {
            id: 'urdu-hindi-script-converter', routes: [], status: 'research', category: 'Write', stages: ['Capture', 'Fix'],
            label: 'Convert Urdu and Hindi script', technicalLabel: 'Urdu ↔ Hindi Script Conversion',
            jobs: ['convert between Urdu and Hindi scripts'], accepts: ['plain-text'], produces: ['plain-text'],
            persistence: 'result local only', conflictPolicy: 'review result before any handoff',
            next: [
                { id: 'hindi-rd-to-basic', target: 'basic-writer', type: 'handoff', label: 'Continue writing', payloadKind: 'plain-text' },
                { id: 'hindi-rd-to-rich', target: 'rich-editor', type: 'handoff', label: 'Format this as a document', payloadKind: 'plain-text' }
            ]
        }
    ];

    function normalizeRoute(value) {
        var path = String(value || '/').trim();
        try {
            if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
        } catch (error) { /* keep the original path */ }
        path = path.split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') path = '/';
        if (/\/index\.html$/i.test(path)) path = path.replace(/\/index\.html$/i, '');
        else if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function get(id) {
        var item = WORKSPACES.find(function (workspace) { return workspace.id === id; });
        return item ? copy(item) : null;
    }

    function list(options) {
        var status = options && options.status;
        return WORKSPACES.filter(function (workspace) { return !status || workspace.status === status; }).map(copy);
    }

    function findByRoute(route) {
        var normalized = normalizeRoute(route);
        var item = WORKSPACES.find(function (workspace) {
            return workspace.routes.some(function (candidate) {
                if (candidate.indexOf('/:') >= 0) {
                    var prefix = normalizeRoute(candidate.split('/:')[0]);
                    return normalized === prefix || normalized.indexOf(prefix + '/') === 0;
                }
                return normalizeRoute(candidate) === normalized;
            });
        });
        return item ? copy(item) : null;
    }

    function accepts(workspaceId, payloadKind) {
        var workspace = get(workspaceId);
        return Boolean(workspace && workspace.accepts.indexOf(payloadKind) >= 0);
    }

    function action(sourceId, actionId) {
        var workspace = get(sourceId);
        if (!workspace) return null;
        var item = workspace.next.find(function (edge) { return edge.id === actionId; });
        return item ? copy(item) : null;
    }

    function validate() {
        var errors = [];
        var ids = Object.create(null);
        var routes = Object.create(null);
        WORKSPACES.forEach(function (workspace) {
            if (!workspace.id || ids[workspace.id]) errors.push('Duplicate or missing workspace id: ' + workspace.id);
            ids[workspace.id] = true;
            if (STATUSES.indexOf(workspace.status) < 0) errors.push('Invalid status for ' + workspace.id);
            if (!workspace.label || !workspace.category || !workspace.stages.length) errors.push('Incomplete descriptor: ' + workspace.id);
            workspace.routes.forEach(function (route) {
                if (route.indexOf('/:') >= 0) return;
                var normalized = normalizeRoute(route);
                if (routes[normalized]) errors.push('Duplicate route ' + normalized + ' for ' + workspace.id + ' and ' + routes[normalized]);
                routes[normalized] = workspace.id;
            });
            workspace.next.forEach(function (edge) {
                if (EDGE_TYPES.indexOf(edge.type) < 0) errors.push('Invalid edge type ' + edge.type + ' on ' + workspace.id);
                if (edge.type === 'embedded' && edge.target) errors.push('Embedded edge must not navigate: ' + edge.id);
                if (edge.type !== 'embedded' && !edge.target) errors.push('Navigating edge missing target: ' + edge.id);
            });
        });
        WORKSPACES.forEach(function (workspace) {
            workspace.next.forEach(function (edge) {
                if (edge.target && !ids[edge.target]) errors.push('Unknown target ' + edge.target + ' from ' + workspace.id);
            });
        });
        return errors;
    }

    return {
        EDGE_TYPES: EDGE_TYPES.slice(),
        STATUSES: STATUSES.slice(),
        normalizeRoute: normalizeRoute,
        get: get,
        list: list,
        findByRoute: findByRoute,
        accepts: accepts,
        action: action,
        validate: validate
    };
}));
