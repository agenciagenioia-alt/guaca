export function BrandsMarquee() {
  const brandsRow1 = [
    "NIKE", "CHROME HEARTS", "OFF-WHITE", "STÜSSY", "SUPREME", "BALENCIAGA", "RICK OWENS", "JORDAN", "VETEMENTS", "A BATHING APE", "PALACE", "CARHARTT WIP", "STONE ISLAND"
  ]

  const brandsRow2 = [
    "YEEZY", "ESSENTIALS", "FEAR OF GOD", "NOCTA", "CORTIEZ", "SPIDER", "CACTUS JACK", "AMIRI", "RHUDE", "GALLERY DEPT", "HELLSTAR", "REPRESENT", "KAPITAL"
  ]

  return (
    <section className="w-full bg-background py-12 md:py-16 overflow-hidden relative border-y border-border">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-[100px] z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-[100px] z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      {/* Row 1 - Left to Right */}
      <div className="flex w-[200%] mb-4 md:mb-8 group">
        <div className="flex animate-[marquee_40s_linear_infinite] group-hover:[animation-duration:120s]">
          {brandsRow1.concat(brandsRow1).map((brand, i) => (
            <span 
              key={`${brand}-1-${i}`} 
              className="font-mono text-[11px] tracking-[0.3em] text-foreground-subtle hover:text-foreground transition-colors duration-300 px-6 cursor-default uppercase"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 - Right to Left (Reverse) */}
      <div className="flex w-[200%] group">
        <div className="flex animate-[marquee-reverse_35s_linear_infinite] group-hover:[animation-duration:105s]">
          {brandsRow2.concat(brandsRow2).map((brand, i) => (
            <span 
              key={`${brand}-2-${i}`} 
              className="font-mono text-[11px] tracking-[0.3em] text-foreground-subtle hover:text-foreground transition-colors duration-300 px-6 cursor-default uppercase"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
