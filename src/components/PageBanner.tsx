const SPORT_PHOTOS: Record<string, string> = {
  basketball:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80",
  football:
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80",
  volleyball:
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1920&q=80",
  trophy:
    "https://images.unsplash.com/photo-1461896836934-bd45ba8920c7?w=1920&q=80",
  crowd:
    "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1920&q=80",
  stadium:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80",
  team:
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1920&q=80",
  running:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&q=80",
};

export type SportPhoto = keyof typeof SPORT_PHOTOS;

export function PageBanner({
  title,
  subtitle,
  photo = "trophy",
  children,
}: {
  title: string;
  subtitle?: string;
  photo?: SportPhoto;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 hero-bg-image"
        style={{ backgroundImage: `url(${SPORT_PHOTOS[photo]})` }}
      >
        <div className="absolute inset-0 hero-overlay" />
      </div>
      <div className="container mx-auto px-4 py-16 sm:py-20 text-center relative">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-xl animate-fade-in-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up drop-shadow-md" style={{ animationDelay: "80ms" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
