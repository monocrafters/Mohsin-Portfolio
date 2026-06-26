type SectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
};

export default function SectionHeading({ label, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-10 md:mb-12">
      <p className="mb-2 text-sm font-medium tracking-wide text-primary">{label}</p>
      <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
