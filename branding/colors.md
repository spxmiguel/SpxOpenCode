# SpxOpenCode Color Palette

## Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | `#4F8FFF` | Logo, links, primary actions, MANUAL mode |
| Primary Purple | `#7C3AED` | Logo gradient end, accents, AI features |

## Status Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success Green | `#22C55E` | AUTO mode, healthy state, passing checks |
| Danger Red | `#EF4444` | YOLO mode, errors, blocking issues |
| Warning Amber | `#F59E0B` | Warnings, degraded state, attention |
| Info Blue | `#3B82F6` | Informational notifications |

## Surface Colors (Dark Theme)

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0D1117` | App background (GitHub dark) |
| Surface | `#161B22` | Cards, panels, elevated surfaces |
| Border | `#30363D` | Dividers, outlines |
| Muted | `#8B949E` | Secondary text, placeholders |
| Foreground | `#E6EDF3` | Primary text |

## Gradient

Logo and brand elements use a left-to-right linear gradient:

```
from: #4F8FFF (Primary Blue)
  to: #7C3AED (Primary Purple)
```

CSS: `linear-gradient(90deg, #4F8FFF, #7C3AED)`

## Design Tokens (future use)

```json
{
  "color": {
    "primary": "#4F8FFF",
    "accent": "#7C3AED",
    "success": "#22C55E",
    "danger": "#EF4444",
    "warning": "#F59E0B",
    "bg": "#0D1117",
    "surface": "#161B22",
    "border": "#30363D",
    "muted": "#8B949E",
    "fg": "#E6EDF3"
  }
}
```
