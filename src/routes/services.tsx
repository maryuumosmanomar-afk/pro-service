import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, MapPin, Filter, Search, Bookmark } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Browse Services — ProService Skills Network" },
      {
        name: "description",
        content:
          "Explore all service categories and find skilled professionals near you.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  const [servicesError, setServicesError] = useState<string | null>(null);

  // Load categories from Supabase
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.log("Categories error:", error.message);
      } else {
        console.log("Categories data:", data);
        setCategories(data || []);
      }

      setLoadingCategories(false);
    };

    loadCategories();
  }, []);

  // Load services with provider and profile information
  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      setServicesError(null);

      const { data, error } = await supabase
        .from("services")
        .select(`
          id,
          Title,
          description,
          price,
          image_url,
          provider_id,
          category_id,
          currency,
          status,
          created_at,
          provider_profiles (
            id,
            user_id,
            title,
            experience_years,
            hourly_rate,
            city,
            neighborhood,
            availability,
            profiles (
              id,
              full_name,
              avatar_ URL,
              bio,
              city,
              country,
              role,
              is_verified
            )
          ),
          categories (
            id,
            name
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Services error:", error.message);
        setServicesError(error.message);
      } else {
        console.log("Services data:", data);
        setServices(data || []);
      }

      setLoadingServices(false);
    };

    loadServices();
  }, []);

  // Filter services

  const [selectedService, setSelectedService] = useState<any>(null);
const [showBookingModal, setShowBookingModal] = useState(false);
const [bookingMessage, setBookingMessage] = useState("");
const [bookingDate, setBookingDate] = useState("");
const [bookingSubmitting, setBookingSubmitting] = useState(false);
const [bookingError, setBookingError] = useState<string | null>(null);
const [bookingSuccess, setBookingSuccess] = useState(false);
const [favoriteProviders, setFavoriteProviders] = useState<string[]>([]);
const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const filtered = services.filter((service) => {
    const provider = service.provider_profiles;
    const profile = provider?.profiles;
    const category = service.categories;

    const providerName = profile?.full_name || "";
    const providerTitle = provider?.title || "";
    const serviceTitle = service.Title || "";
    const categoryName = category?.name || "";

    const matchesCategory =
      activeCategory === "all" || categoryName === activeCategory;

    const searchText = searchQuery.toLowerCase();

    const matchesSearch =
      providerName.toLowerCase().includes(searchText) ||
      providerTitle.toLowerCase().includes(searchText) ||
      serviceTitle.toLowerCase().includes(searchText) ||
      categoryName.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

const openBookingModal = (service: any) => {
  setSelectedService(service);
  setBookingMessage("");
  setBookingDate("");
  setBookingError(null);
  setBookingSuccess(false);
  setShowBookingModal(true);
};

const handleBookingSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setBookingError(null);

  if (!bookingDate) {
    setBookingError("Fadlan dooro taariikh.");
    return;
  }

  setBookingSubmitting(true);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setBookingError("Fadlan mar labaad login gareey.");
    setBookingSubmitting(false);
    return;
  }

  const { error: insertError } = await supabase.from("bookings").insert({
    services_id: selectedService.id,
    customer_id: user.id,
    provider_id: selectedService.provider_id,
    message: bookingMessage,
    booking_data: bookingDate,
    status: "pending",
  });

  if (insertError) {
    console.log("Booking insert error:", insertError.message);
    setBookingError(insertError.message);
    setBookingSubmitting(false);
    return; 
  }

  setBookingSubmitting(false);
  setBookingSuccess(true);
};
const toggleFavorite = async (providerId: string) => {
  setFavoriteLoading(providerId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Fadlan marka hore login gareey.");
    setFavoriteLoading(null);
    return;
  }

  const isFavorite = favoriteProviders.includes(providerId);

  if (isFavorite) {
    // Remove from favorites
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("provider_id", providerId);

    if (error) {
      console.log("Remove favorite error:", error.message);
    } else {
      setFavoriteProviders((prev) =>
        prev.filter((id) => id !== providerId)
      );
    }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        provider_id: providerId,
      });

    if (error) {
      console.log("Add favorite error:", error.message);
    } else {
      setFavoriteProviders((prev) => [...prev, providerId]);
    }
  }

  setFavoriteLoading(null);
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Browse Services
          </h1>

          <p className="mt-2 text-muted-foreground">
            Find verified professionals near your location
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search services or professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button variant="outline" size="default">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "gradient-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>

          {loadingCategories ? (
            <p className="text-sm text-muted-foreground">
              Loading categories...
            </p>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.name
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>

        {/* Loading Services */}
        {loadingServices && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Loading services...
            </p>
          </div>
        )}

        {/* Services Error */}
        {!loadingServices && servicesError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="font-medium text-destructive">
              Failed to load services
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {servicesError}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loadingServices &&
          !servicesError &&
          filtered.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                No services found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Try another search or select a different category.
              </p>
            </div>
          )}

        {/* Services Grid */}
        {!loadingServices &&
          !servicesError &&
          filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((service, i) => {
                const provider = service.provider_profiles;
                const profile = provider?.profiles;
                const category = service.categories;

                const providerName =
                  profile?.full_name || "Unknown Professional";

                const providerTitle =
                  provider?.title || "Professional";

                const categoryName =
                  category?.name || "Uncategorized";

                const location =
                provider?.neighborhood
                 ? `${provider.neighborhood}, ${provider.city}`
                    : "Qardho";

                const avatar =
                  profile?.avatar_URL;

                const initials = providerName
                  .split(" ")
                  .map((name: string) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    {/* Provider Information */}
                    <div className="flex items-center justify-between gap-3">
  <div className="flex items-center gap-3"></div>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={providerName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                          {initials}
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {providerName}
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          {providerTitle}
                        </p>
                      </div>
                    </div>
                    <button
  type="button"
  onClick={() => toggleFavorite(provider.id)}
  disabled={favoriteLoading === provider.id}
  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted disabled:opacity-50"
  title={
    favoriteProviders.includes(provider.id)
      ? "Remove from Saved Pros"
      : "Save Professional"
  }
>
  <Bookmark
    className={`h-4 w-4 ${
      favoriteProviders.includes(provider.id)
        ? "fill-primary text-primary"
        : "text-muted-foreground"
    }`}
  />
</button>

                    {/* Service Category */}
                    <div className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {categoryName}
                    </div>

                    {/* Service Title */}
                    <h3 className="mt-3 font-semibold text-card-foreground">
                      {service.Title}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}

                    {/* Location */}
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {location}
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {service.currency || "USD"}{" "}
                        {service.price ?? 0}
                      </span>

                      {profile?.is_verified && (
                        <span className="text-xs font-medium text-green-600">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Request Service */}
                   <Button
  variant="default"
  size="sm"
  className="mt-4 w-full"
  onClick={() => openBookingModal(service)}
>
  Request Service
</Button>
                  </motion.div>
                );
              })}
            </div>
          )}
      </div>
{showBookingModal && selectedService && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
    onClick={() => setShowBookingModal(false)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated"
      onClick={(e) => e.stopPropagation()}
    >
      {bookingSuccess ? (
        <div className="text-center py-6">
          <h2 className="text-xl font-bold text-card-foreground">
            Codsigaaga waa la diray! ✅
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Professional-ku wuu ku soo jawaabi doonaa dhawaan.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => setShowBookingModal(false)}
          >
            Xir
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-card-foreground">
            Request Service
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedService.Title}
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleBookingSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Taariikhda aad rabto
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Fariin (ikhtiyaari)
              </label>
              <textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Sharax waxa aad u baahan tahay..."
              />
            </div>

            {bookingError && (
              <p className="text-sm text-destructive">{bookingError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                className="flex-1"
                disabled={bookingSubmitting}
              >
                {bookingSubmitting ? "Diraya..." : "Send Request"}
              </Button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  </div>
)}
      <Footer />
    </div>
  );
}