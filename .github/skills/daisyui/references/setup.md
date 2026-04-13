# daisyUI 5 Setup

## Node / Build Tool Installation

Install daisyUI as a dev dependency:

```bash
npm i -D daisyui@latest
```

Your CSS entrypoint must include:

```css
@import "tailwindcss";
@plugin "daisyui";
```

No `tailwind.config.js` is needed or supported in Tailwind CSS v4.

## CDN (No Build Step)

For projects without a bundler, load both libraries via CDN:

```html
<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

## Plugin Configuration

daisyUI without any config (uses `light` and `dark` themes):

```css
@plugin "daisyui";
```

daisyUI with only the `light` theme as default:

```css
@plugin "daisyui" {
  themes: light --default;
}
```

Full config with all options:

```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
  root: ":root";
  include: ;
  exclude: ;
  prefix: ;
  logs: true;
}
```

### Config options

| Option | Description |
|---|---|
| `themes` | List of enabled themes. Use `--default` for the default theme and `--prefersdark` for the dark-mode theme |
| `root` | The CSS selector where daisyUI variables are applied |
| `include` | Whitelist specific components (leave empty for all) |
| `exclude` | Blacklist specific components (e.g., `rootscrollgutter, checkbox`) |
| `prefix` | Add a prefix to all daisyUI classes (e.g., `daisy-` → `daisy-btn`) |
| `logs` | Set to `false` to disable console output during build |

## Applying a Theme

Switch the active theme by setting `data-theme` on the `<html>` element:

```html
<html data-theme="cupcake">
```

Available built-in themes: `light`, `dark`, `cupcake`, `bumblebee`, `emerald`, `corporate`, `synthwave`, `retro`, `cyberpunk`, `valentine`, `halloween`, `garden`, `forest`, `aqua`, `lofi`, `pastel`, `fantasy`, `wireframe`, `black`, `luxury`, `dracula`, `cmyk`, `autumn`, `business`, `acid`, `lemonade`, `night`, `coffee`, `winter`, `dim`, `nord`, `sunset`, `caramellatte`, `abyss`, `silk`.
