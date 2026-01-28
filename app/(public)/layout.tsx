import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 w-full">
        <div className="flex h-14 items-center px-4">
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-4">
              <Link
                href="/my-booking"
                className="hover:text-primary text-sm font-medium transition-colors"
              >
                Min Tid
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="py-8">{children}</main>
      <footer className="px-10 py-6 md:py-0">
        <p className="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
          Built by KlipSync.
        </p>
      </footer>
    </div>
  );
}
