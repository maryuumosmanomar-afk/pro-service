import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !email || !message) {
      setError("Fadlan buuxi dhammaan meelaha.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
      });

    if (insertError) {
      console.log("Contact insert error:", insertError.message);
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground">Get In Touch</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            nalasoo xiriir hadii aad ubaaahantahay faahfaahin ama caawimaad mahadsanid walaal!          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phone */}
            <div>
              <a
                href="tel:+252905442032"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition"
              >
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">+252 905 442 032</p>
                </div>
              </a>
            </div>

            {/* WhatsApp */}
            <div>
              <a
                href="https://wa.me/252905442032?text=Salaam%2C%20waxaan%20qoraaley%20su%27aal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition"
              >
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-semibold">+252 905 442 032</p>
                </div>
              </a>
            </div>

            {/* Email */}
            <div>
              <a
                href="mailto:maryuumosmanomar@gmail.com"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition"
              >
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-sm">maryuumosmanomar@gmail.com</p>
                </div>
              </a>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">Qardho, Puntland, Somalia</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-8 shadow-card">
              <h2 className="text-2xl font-bold">Noogu soo dir Fariin</h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Magacaaga</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Magacaaga"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={5}
                  placeholder="Waxaa raba in..."
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && (
                <p className="text-sm text-success">
                  Mahadsanid! Fariin-kaagu waa hor lagu soo qaaday. ✅
                </p>
              )}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Diraya..." : "Dir Fariin"}
              </Button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Meeshaada</h2>
          <div className="overflow-hidden rounded-xl border border-border shadow-lg">
            <iframe
              width="100%"
              height="400"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d51.4167!3d8.6333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf5d1234567890%3A0x1234567890abcdef!2sQardho%2C%20Puntland!5e0!3m2!1sen!2sso!4v1234567890"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}