import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Shield, Clock, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ParkingApp</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 py-20 md:py-32">
        <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Smart Parking Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Modern SaaS solution for parking lot management with real-time
            bookings, automated payments, and comprehensive analytics.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary" />
              <CardTitle className="text-xl">Real-time Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track parking spot availability in real-time with automatic
                updates and notifications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-10 w-10 text-primary" />
              <CardTitle className="text-xl">Mobile Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access from any device. Progressive Web App works seamlessly on
                mobile and desktop.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary" />
              <CardTitle className="text-xl">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Integrated payment processing with support for multiple payment
                methods and currencies.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Car className="h-10 w-10 text-primary" />
              <CardTitle className="text-xl">Multi-tenant SaaS</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage multiple parking locations with role-based access
                control and tenant isolation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Join hundreds of parking operators using ParkingApp to streamline
            their operations.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="mt-4">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Prisma, and Tailwind CSS. © 2024 ParkingApp
            SaaS.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
