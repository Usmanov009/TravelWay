# UI Development with shadcn/ui Blocks

All authentication views, cards, and modal components in this project must follow the patterns from **https://ui.shadcn.com/blocks**.

## Rules:
1. Always import primitives from `@/components/ui/` (`Card`, `Input`, `Button`, `Label`, `Badge`, `Separator`).
2. Authentication forms must follow the `login-01` to `login-05` standard with `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent`.
3. Labels must be properly associated with Inputs using `<Label htmlFor="...">` or wrapping structure.
4. Social auth must be separated with a subtle `<Separator>` and labeled text.
5. Tour and booking cards must use `Card`, `CardContent`, and `CardFooter` with clean badge overlays.
