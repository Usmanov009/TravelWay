---
name: shadcn-blocks
description: >-
  Use this skill when developing, updating, or reviewing UI blocks (authentication screens,
  login/register forms, cards, dashboards, data displays) based on https://ui.shadcn.com/blocks.
---

# shadcn/ui Blocks Guide for SayrHub

This skill provides templates and conventions for building UI blocks based on the official [shadcn/ui Blocks](https://ui.shadcn.com/blocks).

## 1. Authentication Blocks (`login-01` to `login-05`)

When implementing or updating login/register screens:

### Standard Login Block Recipe
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function LoginBlock() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-sm border-border bg-card">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground mx-auto flex items-center justify-center font-black">
          SH
        </div>
        <CardTitle className="text-xl font-bold">SayrHub hisobiga kirish</CardTitle>
        <CardDescription className="text-xs">
          Xush kelibsiz! Davom etish uchun ma'lumotlaringizni kiriting.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email yoki Telefon</Label>
            <Input id="email" placeholder="name@example.com" className="h-10 text-xs" />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">Parol</Label>
              <a href="#" className="text-xs text-primary hover:underline">Unutdingizmi?</a>
            </div>
            <Input id="password" type="password" className="h-10 text-xs" />
          </div>

          <Button type="submit" className="w-full h-10 font-bold text-xs">
            Kirish
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground text-[10px]">Yoki tezkor usulda</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-9 text-xs">Telegram</Button>
          <Button variant="outline" className="h-9 text-xs">Google</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 2. Card Blocks

When rendering travel packages, bookings, or metrics:
- Use `Card` as the container.
- For media/visual cards, feature a top banner with badging.
- Structure metadata cleanly inside `CardContent`.
- Keep primary & secondary CTA buttons within `CardFooter` or action section.
