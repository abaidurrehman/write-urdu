# Crawler policy

`robots.txt` is generated from the repository policy and is intentionally permissive for search discovery:

- Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot and Claude-SearchBot are allowed.
- GPTBot is disallowed for model-training crawling. This does not block OAI-SearchBot or normal Google Search crawling.
- Google-Extended is allowed as a separate Google generative-AI control; changing it must not block Googlebot.
- CSS, JavaScript and fonts are not blocked because the editors require them to render.

These rules cannot override a Cloudflare WAF, firewall, access policy or deployment authentication. Verify those controls after each production change.
