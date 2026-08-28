import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Star,
  Users,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import homePageImage from "@/img/home page.webp";
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
      <AboutSection />
      <FeaturedProfessionals />
      <CTASection />
      <Footer />
    </div>
  );
}
  


function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-36">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
  backgroundImage: "url('/img/home page.webp')",
}}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary/80" />

     

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm sm:mb-4 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Find Pros Near You
          </span>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:mt-4 sm:text-5xl lg:text-6xl">
            Skilled Professionals,
            <br />
            Right at Your Doorstep
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:mt-6 sm:text-lg sm:leading-normal">
            Connect with skilled local professionals for the services you
            need. Discover services, explore professional profiles, and find
            the right person for your job.
          </p>

          <div className="mt-6 sm:mt-8">

            <Button
              asChild
              size="xl"
              className="h-11 px-5 text-sm bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 sm:h-12 sm:px-6 sm:text-base"
            >
              <Link to="/register">Join as Professional</Link>
            </Button>
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
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-4xl">
            Browse Service Categories
          </h2>

          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
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
          <div className="mt-8 grid grid-cols-4 gap-2 sm:mt-12 sm:gap-4 lg:gap-5">

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
                  className="group block min-h-[185px] rounded-xl border border-border bg-card p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:min-h-[230px] sm:p-5"
                >

                  {/* Icon */}
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg gradient-primary sm:mb-4 sm:h-12 sm:w-12">
                    <Users className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
                  </div>

                  {/* Category name */}
                  <h3 className="text-xs font-semibold leading-tight text-card-foreground sm:text-base">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-5">
                    Find professionals for {category.name}
                  </p>

                  {/* Professional count */}
                  <p className="mt-3 text-[9px] font-semibold leading-tight text-primary sm:mt-4 sm:text-xs">
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
    title: "Browse Professionals",
    desc: "Discover skilled professionals and services available in your area",
  },
  {
    icon: MapPin,
    title: "View a Profile",
    desc: "Check their services, experience, location, reviews, and availability",
  },
  {
    icon: CheckCircle,
    title: "Request a Service",
    desc: "Choose the service you need and send a request directly to the professional",
  },
  {
    icon: Star,
    title: "Get the Job Done",
    desc: "Communicate with the professional, complete the service, and leave a review",
  },
];

  return (
    <section className="bg-muted py-10 sm:py-16">
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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary sm:mb-4 sm:h-16 sm:w-16">
                <step.icon className="h-5 w-5 text-primary-foreground sm:h-7 sm:w-7" />
              </div>

              <div className="mb-1.5 text-[10px] font-bold text-primary sm:mb-2 sm:text-xs">
                STEP {i + 1}
              </div>

              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-normal">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
function AboutSection() {
  return (
    <section
  id="about"
  className="relative overflow-hidden bg-muted/40 py-10 sm:py-14"
>
      {/* Decorative background */}
      <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            About ProService
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-4xl">
            Making Local Services
            <span className="text-primary"> Easier & More Trusted</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            ProService Skills Network connects customers with skilled local
            professionals, making it easier to discover services, compare
            professionals, communicate directly, and get the right help.
          </p>
        </motion.div>

        {/* Main About Card */}
        <div className="mt-6 grid items-center gap-5 sm:mt-8 sm:gap-7 lg:grid-cols-2">

          {/* Left visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 shadow-xl sm:p-7">

              {/* Decorative circles */}
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Users className="h-7 w-7 text-white" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-white sm:text-2xl">
                  One Platform.
                  <br />
                  Many Skilled Professionals.
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                  From home services and maintenance to technology,
                  photography, and events, ProService helps customers find
                  professionals in one convenient place.
                </p>

                {/* Real project information */}
                <div className="mt-6">
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
                    <p className="text-base font-bold text-white">
                      Qardho
                    </p>

                    <p className="mt-1 text-xs text-white/70">
                      Current Local Focus
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Why ProService?
            </span>

            <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              Built to connect people with the right skills
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Finding a reliable professional should not be difficult.
              ProService provides a simple digital space where customers can
              discover skilled professionals and make informed decisions.
            </p>

            {/* Features */}
            <div className="mt-5 space-y-3.5">

              {/* Feature 1 */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Trusted Professionals
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Customers can explore professional profiles, reviews,
                    services, and verification information before choosing.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Local & Convenient
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Discover professionals based on your city and neighborhood,
                    making local service discovery easier.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Simple Service Experience
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Browse services, view profiles, send requests, communicate
                    with professionals, and leave reviews.
                  </p>
                </div>
              </div>

            </div>

            {/* Small CTA */}
            <div className="mt-5">
              <Button asChild>
                <Link to="/services">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

          </motion.div>
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
     const providerIds = data.map((provider) => provider.id);

const { data: reviews, error: reviewsError } = await supabase
  .from("reviews")
  .select("provider_id, rating")
  .in("provider_id", providerIds);

if (reviewsError) {
  console.log("Reviews error:", reviewsError.message);
}

const professionalsWithRatings = data
  .map((provider) => {
    const providerReviews =
      reviews?.filter(
        (review) => review.provider_id === provider.id
      ) || [];

    const reviewCount = providerReviews.length;

    const averageRating =
      reviewCount > 0
        ? providerReviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / reviewCount
        : 0;

    return {
      ...provider,
      averageRating,
      reviewCount,
    };
  })
  .sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }

    return b.reviewCount - a.reviewCount;
  })
  .slice(0, 3);

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
          <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4 lg:gap-5">
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
                 className="group rounded-xl border border-border bg-card p-3 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 sm:p-5"
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
                      <h4 className="truncate font-semibold text-card-foreground text-xs sm:text-sm">
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
                   <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
  <MapPin className="h-3 w-3" />
  {pro.neighborhood
    ? `${pro.neighborhood}, ${pro.city}`
    : "Qardho"}
</span>

                    <span className="text-[10px] font-semibold text-primary sm:text-sm">
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
            className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 hover:text-primary"
          >
            <Link to="/register">Offer Your Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}