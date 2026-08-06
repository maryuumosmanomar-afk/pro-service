import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Star,
  Shield,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "ProService Skills Network — Find Skilled Professionals Near You",
      },
      {
        name: "description",
        content:
          "Connect with verified local professionals for video editing, electricians, renovation, photography and more.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServiceCategoriesSection />
      <HowItWorksSection />
      <FeaturedProfessionals />
      <CTASection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-primary py-20 sm:py-28 lg:py-36">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" /> Find Pros Near You
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Skilled Professionals,
            <br />
            Right at Your Doorstep
          </h1>

          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            Connect with verified local experts for any job — from home
            renovation to wedding photography. Fast, reliable, and close by.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              variant="hero-outline"
              size="xl"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link to="/services">
                Browse Services <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="xl"
              className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90"
            >
              <Link to="/register">Join as Professional</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> 300+ Professionals
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> Verified & Trusted
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Location Matching
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("categories")
        .select(`
  id,
  name,
  provider_profiles (
    id
  )
`)
        .order("name", { ascending: true });

      if (error) {
        console.log("Categories error:", error.message);
        setCategories([]);
        setLoading(false);
        return;
      }

      setCategories(data || []);
      setLoading(false);
    };

    loadCategories();
  }, []);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Browse Service Categories
          </h2>

          <p className="mt-3 text-muted-foreground">
            Find the right professional for your needs
          </p>
        </motion.div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No service categories available yet.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/services"
                  className="group block rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>

                  <h3 className="font-semibold text-card-foreground">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Find professionals for {category.name}
                  </p>

                  <p className="mt-3 text-xs font-medium text-primary">
  {category.provider_profiles.length} professionals →
</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Users,
      title: "Search Professionals",
      desc: "Browse verified local experts in your area",
    },
    {
      icon: MapPin,
      title: "Send a Request",
      desc: "Describe your needs and share your location",
    },
    {
      icon: Clock,
      title: "Get Matched",
      desc: "Nearby professionals respond to your request",
    },
    {
      icon: Star,
      title: "Job Done",
      desc: "Service completed, leave a review",
    },
  ];

  return (
    <section className="bg-muted py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four simple steps to get the help you need
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>

              <div className="mb-2 text-xs font-bold text-primary">
                STEP {i + 1}
              </div>

              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
function FeaturedProfessionals() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProfessionals = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("provider_profiles")
        .select(`
          id,
          title,
          city,
          neighborhood,
          hourly_rate,
          availability,
          profiles (
            id,
            full_name,
            avatar_URL,
            is_verified
          )
        `)
        .eq("availability", true)
        .limit(8);

      if (error) {
        console.log("Featured professionals error:", error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setProfessionals([]);
        setLoading(false);
        return;
      }

      // Hel average rating + review count professional kasta
      const professionalsWithRatings = await Promise.all(
        data.map(async (provider) => {
          const { data: reviews, error: reviewsError } = await supabase
            .from("reviews")
            .select("rating")
            .eq("provider_id", provider.id);

          if (reviewsError) {
            console.log(
              "Reviews error:",
              reviewsError.message
            );
          }

          const ratings = reviews || [];

          const averageRating =
            ratings.length > 0
              ? ratings.reduce(
                  (total, review) =>
                    total + Number(review.rating || 0),
                  0
                ) / ratings.length
              : 0;

          return {
            ...provider,
            averageRating,
            reviewCount: ratings.length,
          };
        })
      );

      setProfessionals(professionalsWithRatings);
      setLoading(false);
    };

    loadFeaturedProfessionals();
  }, []);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Top Professionals
            </h2>

            <p className="mt-2 text-muted-foreground">
              Highly rated experts near you
            </p>
          </div>

          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/services">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Loading professionals...
            </p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No professionals available yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {professionals.map((pro, i) => {
              const profile = pro.profiles;

              const name =
                profile?.full_name || "Professional";

              const initials = name
                .split(" ")
                .map((word: string) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    {profile?.avatar_URL ? (
                      <img
                        src={profile.avatar_URL}
                        alt={name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-card-foreground text-sm">
                        {name}
                      </h4>

                      <p className="truncate text-xs text-muted-foreground">
                        {pro.title || "Service Professional"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />

                      {pro.averageRating > 0
                        ? pro.averageRating.toFixed(1)
                        : "New"}
                    </span>

                    <span>
                      ({pro.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                   <span className="flex items-center gap-1 text-xs text-muted-foreground">
  <MapPin className="h-3 w-3" />
  {pro.neighborhood
    ? `${pro.neighborhood}, ${pro.city}`
    : "Qardho"}
</span>

                    <span className="text-sm font-semibold text-primary">
                      ${Number(pro.hourly_rate || 0)}/hr
                    </span>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Link
                      to="/professional/$providerId"
                      params={{
                        providerId: String(pro.id),
                      }}
                    >
                      View Profile
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="gradient-primary py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to Get Started?
        </h2>

        <p className="mt-4 text-primary-foreground/80">
          Join thousands of customers and professionals already using ProService
          Skills Network.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="xl"
            className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90"
          >
            <Link to="/register">Find a Professional</Link>
          </Button>

          <Button
            asChild
            variant="hero-outline"
            size="xl"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link to="/register">Offer Your Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}