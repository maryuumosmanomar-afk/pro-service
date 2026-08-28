import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
    };

    checkUser();
  }, []);

  if (isLoggedIn) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary sm:h-9 sm:w-9">
            <Zap className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
          </div>

          <span className="text-base font-bold text-foreground sm:text-lg">
            Pro<span className="gradient-text">Service</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">

          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{
              className: "text-sm font-medium text-primary",
            }}
          >
            Home
          </Link>

          {/* About */}
          <a
            href="/#about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>

          <Link
            to="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{
              className: "text-sm font-medium text-primary",
            }}
          >
            Services
          </Link>

          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>

          <Button asChild variant="hero" size="sm">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
  onClick={() => setOpen(!open)}
>
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
  <div className="flex flex-col gap-2.5">

            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {/* About */}
            <a
              href="/#about"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              About
            </a>

            <Link
              to="/services"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Services
            </Link>

            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>

            <Button asChild variant="hero" size="sm">
              <Link
                to="/register"
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </Button>

          </div>
        </div>
      )}
    </nav>
  );
}