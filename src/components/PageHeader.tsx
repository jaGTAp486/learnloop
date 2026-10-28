type PageHeaderProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-11 h-11 rounded-xl bg-lavender-300/8 border border-lavender-300/15 flex items-center justify-center text-lavender-300 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-navy-200 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
