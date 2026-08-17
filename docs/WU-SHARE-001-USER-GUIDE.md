# How to Share Urdu Writing Online with a Beautiful WriteUrdu Link

**Status:** Publication-ready content draft for `WU-SHARE-001`  
**Planned public route:** `/how-to-share-urdu-writing-online`  
**Audience:** WriteUrdu Card Studio users and recipients of shared WriteUrdu links

## Share your Urdu writing as a link, not only as an image

WriteUrdu Card Studio lets you turn Urdu text, poetry, quotes and messages into a polished visual. With **Publish & Share**, you can also create a short WriteUrdu link for that finished card.

A published link looks like this:

`write-urdu.com/s/k7P4z8Q`

When you send that link through WhatsApp, Facebook, X or another app, the recipient can open the published writing on WriteUrdu and start creating their own Urdu design from there.

Your normal Card Studio project stays in your browser. A public link is created only when you explicitly choose **Publish & Share**.

## 1. Create your Urdu card

Open **Urdu Card Studio** and add your writing.

You can:

- type Urdu directly;
- type Roman Urdu and convert it into Urdu script;
- paste Urdu text;
- choose a template;
- change the Urdu font;
- adjust colours, layout and alignment;
- add an author or source when needed.

Use the preview to make sure the card looks the way you want before publishing.

## 2. Choose Publish & Share

When your card is ready, select **Publish & Share**.

WriteUrdu will show a short confirmation before anything is uploaded. The confirmation explains that publishing creates a public page that anyone with the link can open.

This is different from downloading a PNG or sharing an image file.

- **Download PNG** keeps the result as a file on your device.
- **Share image only** sends the image through your device when supported and does not create a WriteUrdu public page.
- **Publish & Share** creates a public `write-urdu.com/s/...` link.

## 3. Confirm the public version

The published version is a snapshot of the card at that moment.

WriteUrdu publishes only the selected card snapshot and its public text/attribution. It does not publish your other drafts or your local Card Studio history.

The public social image contains a small **Write-Urdu.com** footer or provenance mark. It is intentionally kept subtle so the user's Urdu writing remains the focus.

Choose **Publish & get link** when you are ready.

## 4. Copy or share your WriteUrdu link

After publishing, WriteUrdu gives you a short link such as:

`write-urdu.com/s/k7P4z8Q`

You can:

- copy the link;
- use the device Share action;
- open the public page before sending it;
- keep the link for later.

The exact preview shown inside a social app can depend on that platform and its preview cache, but the WriteUrdu public page contains social-preview metadata for the published artwork.

## 5. What people see when they open the link

The public page shows:

- your published visual;
- the Urdu writing as readable, selectable text;
- optional author/source attribution when you included it;
- a way to copy or share the link;
- a **Create your own Urdu design** action;
- a **Use this text** option where available.

The public page is designed for viewing and discovery. It is not a public profile and WriteUrdu does not create a public gallery of everyone's shared writing in the first version.

## 6. Create your own version from someone else's link

If somebody sends you a WriteUrdu share link, open it and choose **Create your own Urdu design**.

WriteUrdu opens Card Studio so you can start a fresh design.

If **Use this text** is available, you can choose it to bring the public Urdu text into a new local Card Studio project. The text is transferred inside WriteUrdu rather than being placed in a long URL.

The new project belongs to your browser. Nothing is republished automatically.

When your version is ready, you can choose **Publish & Share** and create a new WriteUrdu link.

## 7. Delete a published link

The browser that creates a public share receives a private management token and stores it locally for that published item.

Where the management option is available, choose **Delete published link** to remove the public artifact.

The private management token is not included in the public URL and is not shown to people who receive the link.

If you clear browser storage, change device or lose that local management information, self-service deletion may no longer be available from that browser. Use WriteUrdu's contact/report route if a published item needs attention and the original management token is no longer available.

## 8. What stays private and what becomes public

### Stays local/private by default

- your normal writing before publishing;
- other Card Studio projects and drafts;
- local project history;
- text you download without publishing;
- images you share using image-only sharing.

### Becomes public after Publish & Share

- the selected published card image;
- the Urdu text shown on that public page;
- optional author/source attribution included in the published card;
- the short public WriteUrdu URL.

Only publish writing you are comfortable making available to anyone who receives or discovers the link.

## 9. Tips for better Urdu social cards

### Keep short quotes visually focused

A short Urdu quote or verse often works best with generous spacing and a readable Nastaliq or Naskh font.

### Use strong contrast

Make sure the text is easy to read against the background. A beautiful background is less useful if the Urdu writing disappears into it.

### Check the mobile preview

Many people will open a shared link from WhatsApp or another mobile app. Keep important text away from extreme edges and use Card Studio's social-size presets where appropriate.

### Add attribution when it matters

If you are sharing poetry, quotations or another person's writing, use the author/source field when you know the source.

### Share the link when you want people to continue

An image is useful when the visual itself is the final destination. A WriteUrdu link is more useful when you want recipients to read the writing, copy it or create their own version.

## Frequently asked questions

### Do I need an account to publish a WriteUrdu share link?

No. The first version is designed to let Card Studio users publish without creating an account.

### Does WriteUrdu upload everything I type?

No. Normal writing and Card Studio projects remain local until you explicitly choose **Publish & Share**. Publishing uploads the selected public snapshot and the data needed to display that public artifact.

### Is a published link private?

No. A published link should be treated as public. Anyone who has the URL can open it, and someone can forward the link to other people.

### Will my shared page appear in Google Search?

WriteUrdu's initial share pages are intended for direct sharing and are marked not to be indexed by search engines. They are also kept out of the site's normal sitemap/discovery feeds. Search-engine behaviour is ultimately controlled by the crawler, so do not use a public share link for confidential information.

### Can I still just download an image?

Yes. **Download PNG** remains available and does not create a public WriteUrdu page.

### Why is Write-Urdu.com shown on the published image?

The small footer identifies where the public share was created and gives recipients a simple route back to the writing tool. The mark is deliberately small so the user's content stays dominant.

### Can I edit a published link after changing my local card?

The first version treats each publication as a snapshot. Editing your local card does not silently change a previously published version. If you publish the changed version, WriteUrdu can create a new public share.

### Can I use someone else's shared text?

If the public page offers **Use this text**, WriteUrdu can place that public text into a new local Card Studio project. You remain responsible for respecting authorship, copyright and any applicable permissions when reusing someone else's writing.

### What should I do if a shared page contains inappropriate or private material?

Use the **Report** action on the public share page. The publishing browser also has a separate delete mechanism when it still holds the original management token.

## Start creating

Open **Urdu Card Studio**, write or paste your Urdu text, choose a design, and use **Publish & Share** when you want a short WriteUrdu link that other people can open and continue from.

---

## Implementation notes for the public-page conversion

These notes are for the implementation PR and should not appear verbatim in the final public guide:

- Use the existing v2 Learn/authority content shell.
- Primary CTA: `/urdu-card-studio`.
- Add contextual links to `/urdu-templates` and the main `/` writing experience where useful.
- Include `HowTo` structured data only if the final visible guide remains a genuine step-by-step workflow and the schema validator accepts the rendered page.
- Add the final route to the public sitemap and route/SEO registry.
- Do not include any individual `/s/:id` URL in the sitemap.
- Keep claims aligned with the actually shipped UI; if button labels change during implementation, update this guide before release.
