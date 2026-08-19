
import { Link } from "@tanstack/react-router";
import { Zap, Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ProService</span>
            </div>
            <p className="text-sm text-muted-foreground">Connecting you with skilled professionals near you.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Services</Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Join as Professional</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+252905442032" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +252 905 442 032
              </a>
              <a href="https://wa.me/252905442032" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href="mailto:maryuumosmanomar@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
            <p className="text-sm text-muted-foreground">© 2026 ProService Skills Network</p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}