import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Calendar,
  Lock,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="bg-background text-foreground selection:bg-primary/10 selection:text-primary flex min-h-screen flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="from-primary text-primary-foreground shadow-primary/20 flex size-8 items-center justify-center rounded-xl bg-gradient-to-br to-blue-600 shadow-lg">
              <Calendar className="size-5" />
            </div>
            BookingApp
          </div>
          <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="hover:text-foreground transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="sm"
                className="shadow-primary/20 rounded-full shadow-lg"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="from-primary/10 via-background to-background absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]"></div>
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="animate-fade-in-up">
              <div className="border-primary/20 bg-primary/5 text-primary ring-primary/5 mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ring-4">
                <Sparkles className="mr-2 size-3.5" />
                <span>v2.0 is now live</span>
              </div>
              <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl md:text-7xl">
                Manage your school's
                <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text px-2 text-transparent">
                  resources
                </span>
                with ease
              </h1>
              <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg text-balance sm:text-xl">
                The all-in-one platform for booking classrooms, labs, and
                equipment. Say goodbye to double bookings and paper forms.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="shadow-primary/20 hover:shadow-primary/30 h-12 w-full gap-2 rounded-full px-8 text-base shadow-xl transition-all sm:w-auto"
                  >
                    Start for free <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
                >
                  View Demo
                </Button>
              </div>
            </div>

            {/* Visual Abstract Representation */}
            <div className="animate-fade-in-up relative mx-auto mt-16 max-w-5xl [animation-delay:200ms] sm:mt-24">
              <div className="bg-background/50 group relative aspect-[16/9] overflow-hidden rounded-xl border shadow-2xl backdrop-blur-sm sm:aspect-[2/1]">
                <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-blue-500/5"></div>
                {/* CSS Mock UI */}
                <div className="grid h-full grid-cols-12 gap-6 p-8 opacity-80">
                  {/* Sidebar */}
                  <div className="col-span-3 hidden flex-col gap-4 border-r pr-6 sm:flex">
                    <div className="bg-muted/50 h-8 w-24 rounded-md"></div>
                    <div className="mt-4 space-y-3">
                      <div className="bg-muted/30 h-4 w-full rounded-md"></div>
                      <div className="bg-muted/30 h-4 w-3/4 rounded-md"></div>
                      <div className="bg-muted/30 h-4 w-5/6 rounded-md"></div>
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="col-span-12 flex flex-col gap-6 sm:col-span-9">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="bg-muted/50 h-8 w-32 rounded-md"></div>
                      <div className="flex gap-2">
                        <div className="bg-primary/10 size-8 rounded-full"></div>
                        <div className="bg-muted/30 size-8 rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid h-full grid-cols-3 gap-4">
                      <div className="bg-primary/5 border-primary/10 relative col-span-1 overflow-hidden rounded-lg border p-4 transition-transform duration-500 group-hover:-translate-y-1">
                        <div className="absolute top-2 right-2 size-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="bg-muted/10 border-border/50 relative col-span-1 overflow-hidden rounded-lg border p-4 transition-transform delay-75 duration-500 group-hover:-translate-y-2"></div>
                      <div className="bg-muted/10 border-border/50 relative col-span-1 overflow-hidden rounded-lg border p-4 transition-transform delay-100 duration-500 group-hover:-translate-y-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-muted/30 border-y py-12">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <p className="text-muted-foreground mb-8 text-sm font-semibold tracking-wider uppercase">
              Trusted by forward-thinking institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
              {/* Placeholders for logos */}
              <div className="flex items-center gap-2 text-xl font-bold">
                <div className="size-6 rounded-full bg-current opacity-20"></div>{" "}
                EduTech
              </div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <div className="size-6 rounded-full bg-current opacity-20"></div>{" "}
                UniLab
              </div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <div className="size-6 rounded-full bg-current opacity-20"></div>{" "}
                Academy
              </div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <div className="size-6 rounded-full bg-current opacity-20"></div>{" "}
                SchoolOS
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Everything you need to{" "}
                <span className="text-primary">run smoothly</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg text-balance">
                We've built all the tools you need to manage your campus
                resources efficiently.
              </p>
            </div>

            <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3">
              {/* Feature 1 - Large */}
              <div className="bg-card group relative overflow-hidden rounded-3xl border p-8 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
                  <Calendar className="text-primary -mt-16 -mr-16 size-64" />
                </div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-xl">
                    <Zap className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">
                      Instant Booking System
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Real-time availability checking prevents double bookings
                      instantly. Drag and drop interface makes scheduling a
                      breeze.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-card group relative overflow-hidden rounded-3xl border p-8 shadow-sm transition-shadow hover:shadow-md md:col-span-1">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Smartphone className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Mobile First</h3>
                    <p className="text-muted-foreground text-sm">
                      Book from anywhere, anytime. Fully optimized for all
                      devices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-card group relative overflow-hidden rounded-3xl border p-8 shadow-sm transition-shadow hover:shadow-md md:col-span-1">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Lock className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">
                      Role-Based Access
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Granular permissions for students, teachers, and admins.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 - Large */}
              <div className="bg-card group relative overflow-hidden rounded-3xl border p-8 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
                <div className="absolute right-0 bottom-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
                  <BarChart3 className="-mr-12 -mb-12 size-64 text-blue-500" />
                </div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">
                      Team & Class Management
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Manage entire classes or departments. Bulk bookings and
                      recurring schedules supported out of the box.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="bg-muted/30 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold">
              Loved by Educators
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background rounded-2xl border p-8 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-linear-to-tr from-gray-200 to-gray-400"></div>
                    <div>
                      <p className="font-semibold">Sarah Jenkins</p>
                      <p className="text-muted-foreground text-xs">
                        Admin, Tech Academy
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "This platform revolutionized how we handle our computer lab
                    bookings. It's simply amazing."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Strip */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary relative overflow-hidden rounded-3xl px-6 py-16 text-center shadow-2xl sm:px-16 sm:py-24">
              <div className="relative z-10">
                <h2 className="text-primary-foreground mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to start booking smarter?
                </h2>
                <p className="text-primary-foreground/80 mx-auto mb-10 max-w-xl text-lg">
                  Join thousands of schools bringing their resource management
                  into the 21st century.
                </p>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary h-12 rounded-full px-8 font-semibold"
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
              {/* Decorative background effects */}
              <div className="absolute top-0 left-0 size-full opacity-10">
                <div className="absolute top-0 right-0 -mt-24 -mr-24 size-125 rounded-full bg-white blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-24 -ml-24 size-125 rounded-full bg-white blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Calendar className="size-4" />
            </div>
            BookingApp
          </div>
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
