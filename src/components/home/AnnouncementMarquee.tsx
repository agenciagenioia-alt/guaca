export function AnnouncementMarquee() {
  return (
    <div className="relative w-full h-[32px] bg-[#E8E6E1] overflow-hidden flex items-center z-50">
      <div 
        className="animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap flex items-center"
      >
        {/* Repeat content enough times to fill screen twice for seamless infinite scroll */}
        <span className="text-black font-bold text-[12px] tracking-wide px-4">
          🔥 ENVÍOS A TODO COLOMBIA &nbsp;·&nbsp; 
          PAGO SEGURO CON WOMPI &nbsp;·&nbsp; 
          ON RUNNING &nbsp;·&nbsp; 
          SAINT THEORY &nbsp;·&nbsp; 
          NDRG &nbsp;·&nbsp; 
          CLEMONT &nbsp;·&nbsp; 
          NUEVOS DROPS CADA SEMANA &nbsp;·&nbsp;
        </span>
        <span className="text-black font-bold text-[12px] tracking-wide px-4" aria-hidden="true">
          🔥 ENVÍOS A TODO COLOMBIA &nbsp;·&nbsp; 
          PAGO SEGURO CON WOMPI &nbsp;·&nbsp; 
          ON RUNNING &nbsp;·&nbsp; 
          SAINT THEORY &nbsp;·&nbsp; 
          NDRG &nbsp;·&nbsp; 
          CLEMONT &nbsp;·&nbsp; 
          NUEVOS DROPS CADA SEMANA &nbsp;·&nbsp;
        </span>
        <span className="text-black font-bold text-[12px] tracking-wide px-4" aria-hidden="true">
          🔥 ENVÍOS A TODO COLOMBIA &nbsp;·&nbsp; 
          PAGO SEGURO CON WOMPI &nbsp;·&nbsp; 
          ON RUNNING &nbsp;·&nbsp; 
          SAINT THEORY &nbsp;·&nbsp; 
          NDRG &nbsp;·&nbsp; 
          CLEMONT &nbsp;·&nbsp; 
          NUEVOS DROPS CADA SEMANA &nbsp;·&nbsp;
        </span>
      </div>
    </div>
  )
}
