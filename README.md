# Bleach portraits

Character data and portrait assets for **Bleach: The Living Soul**, a Yumina roleplay world.

## Contents

| File | Contents |
|---|---|
| [GALLERY.md](GALLERY.md) | Every portrait, by group, with missing ones marked. |
| [CHARACTERS.md](CHARACTERS.md) | Checklist of the exact filenames for the 56 characters and their forms. |
| [roster.json](roster.json) | The 56 characters: keys, names, aliases, groups, glyphs, colours and profile notes. |
| [manifest.json](manifest.json) | Image format contract, every expected file with its status, and hashes of the files present. |
| [tools/build-docs.mjs](tools/build-docs.mjs) | Regenerates the four files above from the world's roster and the images in this folder. |

## Portrait files

Put one WebP per character at the repository root, named with the roster key:

```text
<key>-favor.webp        e.g. ichigo-favor.webp, rukia-favor.webp, aizen-favor.webp
```

Character forms use their portrait key, for example `ichigo-bankai-favor.webp` or `aizen-traitor-favor.webp`. The full list is in [CHARACTERS.md](CHARACTERS.md).

Recommended format: WebP, 512×640 portrait orientation, face in the upper third (the world crops with `object-fit: cover` around a 50%/30% focal point).

## Connecting the world

Once this repository is public on GitHub, the world loads portraits from:

```text
https://raw.githubusercontent.com/JMmmmm0908/bleach-portraits/main/
```

That address goes in `PORTRAIT_BASE_URI` in the world's `src/data/roster.js`; rebuild the world afterwards. Missing images fall back to the initials tile, so the world works with a partly filled repository.

## Updating the docs

```bash
node tools/build-docs.mjs
```
