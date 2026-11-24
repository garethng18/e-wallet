import { cn } from "@/lib/utils";

export function PhoneShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-[var(--canvas)] px-0 sm:px-4 sm:py-8">
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-[var(--surface)] sm:min-h-[820px] sm:rounded-[2rem] sm:shadow-[0_30px_80px_rgba(20,16,16,0.18)]",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(200,16,46,0.18),_transparent_70%)]" />
        <div className="relative z-10 flex min-h-dvh flex-1 flex-col sm:min-h-[820px]">
          {children}
        </div>
      </div>
    </div>
  );
}
