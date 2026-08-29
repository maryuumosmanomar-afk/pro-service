
import { Link } from "@tanstack/react-router";
import { Zap, Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-2 py-6 sm:px-6 sm:py-8 lg:px-8">
          
            <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
          <div>
             <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ProService</span>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Connecting you with skilled professionals near you.</p>
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
            <div className="flex flex-col gap-1.5">
              <a href="tel:+252905442032" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="4-2 w-4" />
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