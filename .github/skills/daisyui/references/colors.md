# daisyUI Color Tokens

## Semantic Color Names

| Token | Pair | Purpose |
|---|---|---|
| `primary` | `primary-content` | Main brand color + foreground text on it |
| `secondary` | `secondary-content` | Secondary brand color + foreground text on it |
| `accent` | `accent-content` | Accent color + foreground text on it |
| `neutral` | `neutral-content` | Non-saturated UI elements + foreground text on it |
| `base-100` | `base-content` | Default page background (lightest) + foreground text |
| `base-200` | `base-content` | Slightly darker surface (cards, sidebars) |
| `base-300` | `base-content` | Even darker surface (borders, dividers) |
| `info` | `info-content` | Informational messages |
| `success` | `success-content` | Success / safe messages |
| `warning` | `warning-content` | Warning / caution messages |
| `error` | `error-content` | Error / destructive messages |

## Usage Rules

1. **Always use `*-content` on top of its paired background** to ensure readable contrast.
2. Use `base-*` colors for the majority of a page (backgrounds, surfaces, containers).
3. Use `primary` for the most important interactive elements (primary CTA, active state).
4. Never use raw Tailwind colors (e.g., `text-gray-800`, `bg-zinc-900`) for theme-sensitive text or backgrounds — they won't adapt to dark mode or custom themes.
5. Tailwind static colors (e.g., `red-500`) are acceptable for decorative, non-theme-sensitive elements like illustrations or charts.

## Example Usage

```html
<!-- Correct: uses semantic tokens -->
<div class="bg-base-200 text-base-content p-4 rounded-box">
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-ghost">Cancel</button>
</div>

<!-- Wrong: hardcoded colors break on dark themes -->
<div class="bg-gray-100 text-gray-800 p-4">
  <button class="bg-blue-600 text-white px-4 py-2">Save</button>
</div>
```
