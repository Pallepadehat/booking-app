import Link from "next/link";

import { ArrowRight, Calendar, CheckCircle, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Calendar className="size-5" />
            </div>
            BookingApp
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button size="sm">Log in</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
                The content
                <span className="text-primary block">you need to succeed</span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance sm:text-xl">
                Streamline your school's resource management. Book classrooms,
                equipment, and labs in seconds with our intuitive platform.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full gap-2 text-base sm:w-auto"
                  >
                    Get Started <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base sm:w-auto"
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Built for students and teachers to manage time effectively.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-card flex flex-col items-start gap-4 rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Zap className="size-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">Instant Booking</h3>
                  <p className="text-muted-foreground">
                    See real-time availability and book resources instantly
                    without conflicts.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-card flex flex-col items-start gap-4 rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Shield className="size-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">Secure Access</h3>
                  <p className="text-muted-foreground">
                    Role-based permissions ensure only authorized users can
                    access specific resources.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-card flex flex-col items-start gap-4 rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <CheckCircle className="size-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">Easy Management</h3>
                  <p className="text-muted-foreground">
                    Administrators have full control over inventory, schedules,
                    and user management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} BookingApp. All rights reserved.
          </p>
          <div className="text-muted-foreground flex gap-6 text-sm">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
