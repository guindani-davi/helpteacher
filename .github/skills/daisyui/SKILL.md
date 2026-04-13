---
name: daisyui-developer
description: Generates daisyUI 5 + Tailwind CSS 4 UI code and provides component and theming guidance. Trigger when creating components, layouts, forms, modals, navbars, dashboards, or any UI element using daisyUI classes, or for best practices on theming, color tokens, responsiveness, accessibility, and Tailwind CSS integration.
license: MIT
metadata:
  author: daisyUI Developer Skill
  version: '1.0'
---

# daisyUI 5 Developer Guidelines

1. Always confirm the project is using **Tailwind CSS 4** before writing daisyUI code. daisyUI 5 is not compatible with Tailwind CSS v3 or earlier. Do NOT generate a `tailwind.config.js` — it is deprecated in Tailwind v4.

2. Use **daisyUI semantic color tokens** (`primary`, `base-100`, `base-content`, etc.) for all colors. Never use raw Tailwind color names like `text-gray-800` or `bg-zinc-900` for theme-sensitive UI, as they will break in dark mode or custom themes.

3. Always use `dark:` prefixes for daisyUI color tokens — they are **not needed**. daisyUI colors adapt automatically per theme.

4. Once you finish generating a component or layout, review it against the **Anti-Patterns** section in [components.md](references/components.md) to catch common mistakes before presenting the code.

5. When a component requires interactive behavior (tabs, modals, drawers, dropdowns), prefer **native HTML solutions** (`<dialog>`, `<details>`, radio inputs) over JavaScript-driven alternatives, unless the user's framework requires otherwise.

## Setup

When setting up daisyUI in a project, read [setup.md](references/setup.md) for installation steps, CSS entrypoint configuration, and CDN usage.

## Components

When building UI components, consult the following references based on the component type:

- **Navigation**: Navbar, Menu, Drawer, Dock, Breadcrumbs, Tabs. Read [navigation.md](references/navigation.md)
- **Forms & Inputs**: Input, Textarea, Select, Checkbox, Radio, Toggle, Range, File Input, Filter, Fieldset, Validator, Floating Label. Read [forms.md](references/forms.md)
- **Feedback & Overlays**: Alert, Modal, Toast, Tooltip, Loading, Skeleton, Progress. Read [feedback.md](references/feedback.md)
- **Layout & Display**: Card, Hero, Stats, Table, List, Divider, Stack, Indicator, Join, Steps, Timeline, Carousel, Diff. Read [layout.md](references/layout.md)
- **Buttons & Actions**: Button, Badge, Dropdown, FAB, Swap, Avatar, Link. Read [actions.md](references/actions.md)
- **Decorative**: Hover3D, HoverGallery, TextRotate, Mask, Countdown, Radial Progress, Kbd, Accordion, Collapse. Read [decorative.md](references/decorative.md)

If a component is not covered in the references above, check the official daisyUI documentation at `https://daisyui.com/components/`.

## Colors & Theming

When making color or theme decisions, consult the following references:

- **Color Tokens**: Full list of semantic color names and their intended use. Read [colors.md](references/colors.md)
- **Custom Themes**: Creating a custom theme with `@plugin "daisyui/theme"`, all required CSS variables, and the visual theme generator. Read [theming.md](references/theming.md)

## Responsiveness

When building responsive layouts, follow these rules:

- Use Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) for layout decisions.
- For components with built-in responsive helpers, use them: `sm:alert-horizontal`, `sm:card-horizontal`, `sm:footer-horizontal`, `lg:join-horizontal`, `lg:menu-horizontal`, `lg:drawer-open`.
- Prefer `flex` and `grid` with responsive prefixes for custom layouts. Do not use fixed pixel widths for layout containers.

## Customization Rules

1. **Customize with Tailwind utilities first** — e.g., `btn px-10` for custom padding.
2. **Use `!` suffix only as a last resort** to override specificity — e.g., `btn bg-red-500!`. Use sparingly.
3. **Do not write custom CSS** unless there is genuinely no daisyUI or Tailwind utility alternative.
4. **Do not add `bg-base-100 text-base-content` to `<body>`** unless explicitly required by the design.
