# SayrHub Workspace Rules: shadcn/ui Blocks Standard

This repository adheres to the design architecture and styling principles of **shadcn/ui Blocks** (https://ui.shadcn.com/blocks).

## 1. Core Architectural Guidelines

1. **Use Primitive Components**:
   Always import and compose UI elements from `@/components/ui/*`:
   - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` from `@/components/ui/card`
   - `Button`, `buttonVariants` from `@/components/ui/button`
   - `Input` from `@/components/ui/input`
   - `Label` from `@/components/ui/label`
   - `Badge` from `@/components/ui/badge`
   - `Separator` from `@/components/ui/separator`
   - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`
   - `Dialog`, `Sheet`, `Drawer`, `Alert` from `@/components/ui/*`

2. **Design Tokens & Theme Harmony**:
   - Utilize Tailwind theme tokens: `bg-card`, `text-card-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`.
   - Adhere to the cyan accent and mauve base tokens (`var(--tw-accent)`, `var(--tw-surface)`, `var(--tw-border)`).
   - Ensure complete light & dark mode support on all blocks and cards.

---

## 2. Block Patterns

### Authentication & Login Blocks (`login-01` through `login-05`)
- **Structure**:
  - Encapsulate the form inside a responsive `Card` or two-column split layout.
  - Header: Centered or aligned brand badge with `CardTitle` and `CardDescription`.
  - Body: Distinct `<div className="grid gap-4">` or `space-y-3.5` with `<Label>` above each `<Input>`.
  - Social Logins: Visually separate password/phone flows from third-party auth using `<Separator>` with "Or continue with / Yoki tezkor usulda kiring".
  - Actions: Prominent primary `<Button>` with loading indicators, followed by quick-switch navigation between login & registration.

### Card Blocks
- **Structure**:
  - Use `Card` with `rounded-2xl border-border bg-card shadow-xs hover:shadow-md transition-all`.
  - Visual Header: Banner image with subtle gradient overlay, status badges (`Badge`), and interactive action overlays (e.g. favorite, alerts).
  - Body (`CardContent`): Clearly organized typography for destination/service, pricing breakdown, and inclusion metadata chips.
  - Footer (`CardFooter`): Well-spaced action buttons with `variant="outline"` for secondary actions and `variant="default"` for primary booking actions.

### Responsive Grids
- Render collections using fluid grids:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ```
