import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Pro<span className="gradient-text">Service</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-sm font-medium text-primary" }}>Home</Link>
          <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-sm font-medium text-primary" }}>Services</Link>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <Button asChild variant="hero" size="sm">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Services</Link>
            <Link to="/login" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Login</Link>
            <Button asChild variant="hero" size="sm">
              <Link to="/register" onClick={() => setOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}