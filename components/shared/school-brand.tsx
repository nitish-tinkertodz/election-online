type SchoolBrandProps = {
  schoolName: string;
  logoUrl?: string;
};

export function SchoolBrand({ schoolName, logoUrl = "" }: SchoolBrandProps) {
  return (
    <div className="flex items-center gap-4">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${schoolName} logo`}
          className="h-20 w-32 rounded-2xl border border-ink/10 bg-white object-contain p-2 shadow-sm sm:w-40"
        />
      ) : (
        <div className="flex h-20 w-32 items-center justify-center rounded-2xl border border-ink/10 bg-white/80 font-display text-3xl text-forest shadow-sm sm:w-40">
          {schoolName.trim().charAt(0).toUpperCase() || "S"}
        </div>
      )}
      <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
        {schoolName}
      </p>
    </div>
  );
}
