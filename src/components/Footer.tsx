import { Link } from "@tanstack/react-router";
import { Zap, Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-6 lg:gap-8">

          {/* ProService */}
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-primary sm:h-8 sm:w-8">
                <Zap className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
              </div>

              <span className="truncate text-xs font-bold text-foreground sm:text-base">
                ProService
              </span>
            </div>

            <p className="text-[10px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              Connecting you with skilled professionals near you.
            </p>
          </div>

          {/* Platform */}
          <div className="min-w-0">
            <h4 className="mb-2 text-xs font-semibold text-foreground sm:mb-3 sm:text-sm">
              Platform
            </h4>

            <div className="flex flex-col gap-2">
              <Link
                to="/services"
                className="break-words text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Browse Services
              </Link>

              <Link
                to="/register"
                className="break-words text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Join as Professional
              </Link>

              <Link
                to="/contact"
                className="break-words text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="min-w-0">
            <h4 className="mb-2 text-xs font-semibold text-foreground sm:mb-3 sm:text-sm">
              Contact
            </h4>

            <div className="flex flex-col gap-2.5">

              <a
                href="tel:+252905442032"
                className="flex min-w-0 items-start gap-1.5 text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:gap-2 sm:text-sm"
              >
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />

                <span>
                  +252 905442032
                </span>
              </a>

              <a
                href="https://wa.me/252905442032"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-1.5 text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:gap-2 sm:text-sm"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href="mailto:maryuumosmanomar@gmail.com"
                className="flex min-w-0 items-center gap-1.5 text-[10px] leading-5 text-muted-foreground transition-colors hover:text-foreground sm:gap-2 sm:text-sm"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span>Email</span>
              </a>

            </div>
          </div>

          {/* Legal */}
          <div className="min-w-0">
            <h4 className="mb-2 text-xs font-semibold text-foreground sm:mb-3 sm:text-sm">
              Legal
            </h4>

            <p className="break-words text-[10px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              © 2026
              <br />
              ProService Skills Network
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}