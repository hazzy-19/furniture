// Temporary design token test page (will be removed in later pieces)
export default function DesignTokens() {
  const colorTokens = [
    { name: 'brand-900', hex: '#0B3B3C', role: 'Footer, dark sections', bgClass: 'bg-brand-900', textClass: 'text-white' },
    { name: 'brand-700', hex: '#0F5E5F', role: 'Headings, nav', bgClass: 'bg-brand-700', textClass: 'text-white' },
    { name: 'brand-500', hex: '#1A8A85', role: 'Buttons, links', bgClass: 'bg-brand-500', textClass: 'text-white' },
    { name: 'brand-200', hex: '#A9DAD4', role: 'Borders, hover', bgClass: 'bg-brand-200', textClass: 'text-ink' },
    { name: 'brand-50', hex: '#EAF6F4', role: 'Tiles, tinted sections', bgClass: 'bg-brand-50', textClass: 'text-ink' },
    { name: 'gold-500', hex: '#E0A526', role: 'Badges & small highlights', bgClass: 'bg-gold-500', textClass: 'text-brand-900' },
    { name: 'ink', hex: '#0E2A2B', role: 'Main body text', bgClass: 'bg-ink', textClass: 'text-white' },
    { name: 'page', hex: '#F8FBFA', role: 'Page background', bgClass: 'bg-page border border-brand-200', textClass: 'text-ink' },
  ]

  return (
    <div className="min-h-screen bg-page text-ink font-body p-4 sm:p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Header */}
        <header className="border-b border-brand-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-brand-500 font-semibold mb-1">
            Aurelle Home — Design System
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-900">
            Design Tokens Verification
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink/80 max-w-2xl">
            Temporary preview for verifying Tailwind color tokens, typography scales,
            button radii (4px), card radii (8px), and flat design principles.
          </p>
        </header>

        {/* 1. Color Swatches */}
        <section className="space-y-4">
          <div className="border-b border-brand-200 pb-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-brand-900">
              Color Tokens
            </h2>
            <p className="text-sm text-ink/70">
              Defined once as theme tokens in index.css (no gradients, no hardcoded component hex).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className="bg-white border border-brand-200 rounded-[8px] p-3 flex flex-col justify-between"
              >
                <div
                  className={`h-16 w-full rounded-[4px] mb-3 flex items-center justify-center font-mono text-xs font-medium ${token.bgClass} ${token.textClass}`}
                >
                  {token.hex}
                </div>
                <div>
                  <div className="font-semibold text-sm text-brand-900">
                    {token.name}
                  </div>
                  <div className="text-xs text-ink/70 mt-0.5">
                    {token.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section className="space-y-6">
          <div className="border-b border-brand-200 pb-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-brand-900">
              Typography Scale
            </h2>
            <p className="text-sm text-ink/70">
              Cormorant Garamond for headings, Inter for body and UI elements.
            </p>
          </div>

          <div className="bg-white border border-brand-200 rounded-[8px] p-4 sm:p-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Heading 1 — Cormorant Garamond 44px / 48px
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-900">
                Refined Living for Modern Kenyan Homes
              </h1>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Heading 2 — Cormorant Garamond 32px / 36px
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-brand-900">
                Crafted Hand-Finished Furniture
              </h2>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Heading 3 — Cormorant Garamond 24px / 28px
              </span>
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-medium text-brand-700">
                Living Room, Dining, Bedroom & Decor
              </h3>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Heading 4 — Cormorant Garamond 20px / 22px
              </span>
              <h4 className="font-heading text-lg sm:text-xl font-medium text-brand-700">
                Direct WhatsApp Ordering & Bespoke Requests
              </h4>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Body Large — Inter 18px
              </span>
              <p className="font-body text-base sm:text-lg text-ink">
                Every piece is manufactured with sustainably sourced hardwood framing and tailored
                upholstery built to withstand everyday family life.
              </p>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Body Regular — Inter 15px / 16px
              </span>
              <p className="font-body text-sm sm:text-base text-ink">
                Browse our curated catalogue, confirm dimensions with our interior styling team on
                WhatsApp, and schedule seamless white-glove delivery across Nairobi and beyond.
              </p>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <span className="text-xs uppercase tracking-wider text-brand-500 font-medium block mb-1">
                Body Small & Caption — Inter 13px / 14px
              </span>
              <p className="font-body text-xs sm:text-sm text-ink/75">
                Prices in KES. Delivery timelines vary from 3 to 10 working days depending on finish customization.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Interactive Elements: Buttons & Badges */}
        <section className="space-y-6">
          <div className="border-b border-brand-200 pb-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-brand-900">
              Buttons & Badges
            </h2>
            <p className="text-sm text-ink/70">
              4px radius on buttons and badges. Flat styling without drop shadows or gradients.
            </p>
          </div>

          <div className="bg-white border border-brand-200 rounded-[8px] p-4 sm:p-6 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-3">
                Buttons (4px radius, brand-500 primary, outline secondary)
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {/* Primary Button */}
                <button
                  type="button"
                  className="bg-brand-500 hover:bg-brand-700 text-white font-body text-sm font-medium px-5 py-2.5 rounded-[4px] border border-brand-500 transition-colors cursor-pointer"
                >
                  Primary Button
                </button>

                {/* Secondary Button */}
                <button
                  type="button"
                  className="bg-transparent hover:bg-brand-50 text-brand-700 font-body text-sm font-medium px-5 py-2.5 rounded-[4px] border border-brand-500 transition-colors cursor-pointer"
                >
                  Secondary Button
                </button>

                {/* Button on Dark (using brand-900) */}
                <div className="bg-brand-900 p-3 rounded-[4px] flex items-center gap-3">
                  <button
                    type="button"
                    className="bg-brand-500 hover:bg-brand-700 text-white font-body text-sm font-medium px-4 py-2 rounded-[4px] border border-brand-500 transition-colors"
                  >
                    Button on Dark
                  </button>
                  <button
                    type="button"
                    className="border border-brand-200 text-brand-50 hover:bg-brand-700/50 font-body text-sm font-medium px-4 py-2 rounded-[4px] transition-colors"
                  >
                    Outline on Dark
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-brand-50 pt-4">
              <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-3">
                Badges (gold-500 for small highlights & badges)
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Gold "New" badge required by prompt */}
                <span className="bg-gold-500 text-brand-900 font-body text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px]">
                  New
                </span>
                <span className="bg-brand-50 text-brand-700 border border-brand-200 font-body text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px]">
                  Hot
                </span>
                <span className="bg-brand-700 text-white font-body text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px]">
                  Living Room
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Sample 8px Card */}
        <section className="space-y-4">
          <div className="border-b border-brand-200 pb-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-brand-900">
              Sample 8px Card
            </h2>
            <p className="text-sm text-ink/70">
              Card component with 8px radius, thin border, flat design, and nested 4px interactive elements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Sample Card */}
            <article className="bg-white border border-brand-200 rounded-[8px] overflow-hidden flex flex-col justify-between">
              <div>
                {/* Flat tinted placeholder image block as per AGENTS.md */}
                <div className="bg-brand-50 border-b border-brand-200 h-48 flex flex-col items-center justify-center p-4 text-center">
                  <span className="font-heading text-xl text-brand-700 font-medium">
                    Zuri 3 Seater Sofa
                  </span>
                  <span className="text-xs text-brand-500 mt-1 uppercase tracking-wider">
                    Flat Placeholder Image
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-brand-700 uppercase tracking-wider">
                      Living Room
                    </span>
                    {/* Gold "New" Badge */}
                    <span className="bg-gold-500 text-brand-900 font-body text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px]">
                      New
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl font-semibold text-brand-900">
                    Zuri 3 Seater Sofa
                  </h3>

                  <p className="text-sm text-ink/75 font-body line-clamp-2">
                    Crafted with premium textured upholstery and solid hardwood framing.
                  </p>

                  <div className="text-xl font-semibold text-brand-700 font-body">
                    KES 189,000
                  </div>
                </div>
              </div>

              {/* Card Footer with 4px button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  className="w-full bg-brand-500 hover:bg-brand-700 text-white font-body text-sm font-medium py-2.5 rounded-[4px] border border-brand-500 transition-colors cursor-pointer"
                >
                  Inquire on WhatsApp
                </button>
              </div>
            </article>

            {/* Tinted Section Card (brand-50) */}
            <article className="bg-brand-50 border border-brand-200 rounded-[8px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                  Tinted Tile Spec
                </span>
                <h3 className="font-heading text-2xl font-semibold text-brand-900 mt-1 mb-2">
                  brand-50 Background
                </h3>
                <p className="text-sm text-ink/80 font-body">
                  Tiles and tinted sections use brand-50 (#EAF6F4) with brand-200 (#A9DAD4) thin borders
                  for clean separation without heavy drop shadows.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-200 flex items-center justify-between">
                <span className="text-xs text-brand-700 font-medium">Radius: 8px</span>
                <span className="text-xs text-brand-700 font-medium">Border: 1px thin</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}

