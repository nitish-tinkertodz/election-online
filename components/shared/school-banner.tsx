type SchoolBannerProps = {
  schoolName: string;
  schoolLogoUrl?: string;
  compact?: boolean;
};

export function SchoolBanner({
  schoolName,
  schoolLogoUrl = "",
  compact = false
}: SchoolBannerProps) {
  return (
    <div className={`flex items-center gap-4 rounded-[2rem] border border-ink/10 bg-white/85 px-5 py-4 shadow-card backdrop-blur ${compact ? "px-4 py-3" : ""}`}>
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-cream">
        {schoolLogoUrl ? (
          <img
            src={schoolLogoUrl}
            alt={`${schoolName} logo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs uppercase tracking-[0.22em] text-ink/45">
            Logo
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.24em] text-ember">
          School Banner
        </p>
        <h1 className="truncate font-display text-2xl text-ink">{schoolName}</h1>
      </div>
    </div>
  );
}

