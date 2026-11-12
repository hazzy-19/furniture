# Aurelle Home: agent rules

## Project
Aurelle Home is a concept/portfolio website for a premium furniture brand
aimed at the Kenyan market. Range: living room, dining, bedroom, decor.
Customers order through WhatsApp now; M-Pesa and card checkout come later.
Stack: React (plain JavaScript, .jsx files, no TypeScript), Vite,
Tailwind CSS, React Router.

## Hard rule: never run commands
- Never run any terminal command, for any reason.
-- Approved libraries only: react-router-dom, lucide-react,
  @radix-ui/react-dialog (drawers and sheets), embla-carousel-react
  (carousels). Ask before adding anything else.
- Always end with a "Commands for you to run" section, even if the only
  command is npm run dev.
- Never edit package.json to add dependencies by hand.
- If something needs a command, end your response with a section called
  "Commands for you to run" listing the exact commands, one per line,
  written for Windows PowerShell. The developer runs them and reports back.
- If you are unsure whether something needs a command, ask instead of running it.

## Working style
- Do only the piece the current prompt asks for. Do not build ahead.
- At the end of each response, list the files you created or changed.
- One component per file. Keep components small and readable.
- Add short comments where the logic is not obvious.
- Do not add libraries without asking first.
- No backend yet. Use local mock data in src/data/.

## Design rules
- Mobile-first, then enhance for desktop. Every piece must work on both.
- Flat design: no gradients, no drop shadows. Thin borders. 4px radius on
  buttons, 8px on cards and tiles. Outline icons only.
- Colors (define once as theme tokens, never hardcode hex in components):
  brand-900 #0B3B3C (footer, dark sections), brand-700 #0F5E5F (headings, nav),
  brand-500 #1A8A85 (buttons, links), brand-200 #A9DAD4 (borders, hover),
  brand-50 #EAF6F4 (tiles, tinted sections), gold-500 #E0A526 (badges and
  small highlights only), ink #0E2A2B (text), page #F8FBFA (background).
  whatsapp #25D366 (floating WhatsApp button only)
- Fonts: Cormorant Garamond for headings, Inter for body.
- Mobile hero text must stay short: one headline of about 5 words and one
  button. Extra lines are desktop only.

## Content rules
- English only. Prices in KES.
- Placeholder products: Zuri 3 seater sofa KES 189,000 (New), Mara 6 seater
  dining set KES 142,500 (Hot), Imani upholstered bed KES 98,000 (New).
- WhatsApp number and message templates live in one config file,
  src/config.js, with a placeholder number.
- Images are placeholders for now (flat tinted blocks), to be replaced later.