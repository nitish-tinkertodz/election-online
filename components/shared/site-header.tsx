type SiteHeaderProps = {
  schoolName: string;
  schoolLogoUrl: string;
};

export function SiteHeader({ schoolName, schoolLogoUrl }: SiteHeaderProps) {
  return (
    <header className="border-b border-ink/10 bg-[#12308a] text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/95">
          {schoolLogoUrl ? (
            <img
              src={schoolLogoUrl}
              alt={`${schoolName} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-1 text-center text-[10px] font-bold leading-tight text-[#12308a]">
              LOGO
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight sm:text-2xl">
            {schoolName}
          </p>
          <p className="truncate text-sm font-semibold uppercase tracking-[0.22em] text-white/90 sm:text-base">
            School election portal
          </p>
        </div>
      </div>
    </header>
  );
}
