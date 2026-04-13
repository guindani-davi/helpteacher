# daisyUI Custom Themes

## Creating a Custom Theme

Add a custom theme using `@plugin "daisyui/theme"` in your CSS file. All variables listed below are required:

```css
@plugin "daisyui/theme" {
  name: "mytheme";
  default: true;        /* set as the default theme */
  prefersdark: false;   /* use as default for prefers-color-scheme: dark */
  color-scheme: light;  /* tells the browser this is a light theme */

  --color-base-100: oklch(98% 0.02 240);
  --color-base-200: oklch(95% 0.03 240);
  --color-base-300: oklch(92% 0.04 240);
  --color-base-content: oklch(20% 0.05 240);

  --color-primary: oklch(55% 0.3 240);
  --color-primary-content: oklch(98% 0.01 240);
  --color-secondary: oklch(70% 0.25 200);
  --color-secondary-content: oklch(98% 0.01 200);
  --color-accent: oklch(65% 0.25 160);
  --color-accent-content: oklch(98% 0.01 160);
  --color-neutral: oklch(50% 0.05 240);
  --color-neutral-content: oklch(98% 0.01 240);

  --color-info: oklch(70% 0.2 220);
  --color-info-content: oklch(98% 0.01 220);
  --color-success: oklch(65% 0.25 140);
  --color-success-content: oklch(98% 0.01 140);
  --color-warning: oklch(80% 0.25 80);
  --color-warning-content: oklch(20% 0.05 80);
  --color-error: oklch(65% 0.3 30);
  --color-error-content: oklch(98% 0.01 30);

  --radius-selector: 1rem;   /* checkbox, toggle, badge */
  --radius-field: 0.25rem;   /* button, input, select, tab */
  --radius-box: 0.5rem;      /* card, modal, alert */

  --size-selector: 0.25rem;
  --size-field: 0.25rem;

  --border: 1px;

  --depth: 1;   /* 0 or 1 — adds shadow and subtle 3D depth */
  --noise: 0;   /* 0 or 1 — adds a subtle grain texture */
}
```

## Rules

- All CSS variables above are **required**. Missing any will cause visual inconsistencies.
- Colors can be `oklch()`, `hsl()`, or hex — `oklch()` is recommended for perceptual uniformity.
- Do not include comments inside the plugin block in production code.
- `--radius-selector` preferred values: `0rem`, `0.25rem`, `0.5rem`, `1rem`, `2rem`.
- `--border` preferred values: `0.5px`, `1px`, `1.5px`, `2px`.

## Theme Switcher (runtime)

Use `theme-controller` on a checkbox or radio input to let users switch themes:

```html
<!-- Checkbox toggles between default and "dark" theme -->
<input type="checkbox" value="dark" class="theme-controller" />

<!-- Radio group for multi-theme picker -->
<input type="radio" name="theme" value="light" class="theme-controller" aria-label="Light" />
<input type="radio" name="theme" value="synthwave" class="theme-controller" aria-label="Synthwave" />
<input type="radio" name="theme" value="cupcake" class="theme-controller" aria-label="Cupcake" />
```

## Visual Generator

Generate custom themes visually at: https://daisyui.com/theme-generator/
