import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, MapPin, Filter, Search, Bookmark } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import DashboardBottomNav from "@/components/DashboardBottomNav";

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
 const [userRole, setUserRole] = useState<
  "guest" | "customer" | "professional"
>("guest");
  

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
  useEffect(() => {
  const loadUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
  setUserRole("guest");
  return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "professional") {
      setUserRole("professional");
    } else {
      setUserRole("customer");
    }
  };

  loadUserRole();
}, []);

  // Load services with provider and profile information
  useEffect(() => {
  const loadServices = async () => {
    setLoadingServices(true);
    setServicesError(null);

    // 1. Load services + professional information
    const { data: serviceData, error: serviceError } = await supabase
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
            avatar_URL,
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

    if (serviceError) {
      console.log("Services error:", serviceError.message);
      setServicesError(serviceError.message);
      setLoadingServices(false);
      return;
    }

    const loadedServices = serviceData || [];

    // 2. Get provider IDs
    const providerIds = [
      ...new Set(
        loadedServices
          .map((service: any) => service.provider_id)
          .filter(Boolean)
      ),
    ];

    // 3. Load all reviews belonging to these professionals
    let reviewsData: any[] = [];

    if (providerIds.length > 0) {
      const { data, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          provider_id,
          rating
        `)
        .in("provider_id", providerIds);

      if (reviewsError) {
        console.log("Reviews error:", reviewsError.message);
      } else {
        reviewsData = data || [];
      }
    }

    // 4. Calculate rating + review count for each professional
    const providerStats: Record<
      string,
      { rating: number; review_count: number }
    > = {};

    providerIds.forEach((providerId: string) => {
      const providerReviews = reviewsData.filter(
        (review) => review.provider_id === providerId
      );

      const reviewCount = providerReviews.length;

      const averageRating =
        reviewCount > 0
          ? providerReviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / reviewCount
          : 0;

      providerStats[providerId] = {
        rating: averageRating,
        review_count: reviewCount,
      };
    });

    // 5. Attach real rating/review count to every service
    const servicesWithStats = loadedServices.map((service: any) => ({
      ...service,
      provider_profiles: service.provider_profiles
        ? {
            ...service.provider_profiles,
            rating:
              providerStats[service.provider_id]?.rating ?? 0,
            review_count:
              providerStats[service.provider_id]?.review_count ?? 0,
          }
        : null,
    }));

    console.log("Services with real provider stats:", servicesWithStats);

    setServices(servicesWithStats);

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

const groupedProviders = Object.values(
  filtered.reduce((groups: Record<string, any>, service: any) => {
    const provider = service.provider_profiles;

    if (!provider) return groups;

    const providerId = provider.id;

    if (!groups[providerId]) {
      groups[providerId] = {
        provider,
        services: [],
      };
    }

    groups[providerId].services.push(service);

    return groups;
  }, {})
);

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
  groupedProviders.length > 0 && (
   <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {groupedProviders.map((item: any, i) => {
        const provider = item.provider;
        const profile = provider?.profiles;
        const providerServices = item.services || [];

        const providerName =
          profile?.full_name || "Unknown Professional";

        const providerTitle =
          provider?.title || "Professional";

        const location = provider?.neighborhood
          ? `${provider.neighborhood}, ${provider.city}`
          : provider?.city || "Qardho";

        const avatar = profile?.avatar_URL;

        const initials = providerName
          .split(" ")
          .map((name: string) => name[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const visibleServices = providerServices.slice(0, 3);
        const remainingServices = providerServices.length - 3;

        return (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
           className="group flex h-full min-w-0 flex-col rounded-lg border border-border bg-card p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-4"
          >
            {/* Provider Header */}
            <div className="flex items-start justify-between gap-3">
              <Link
                to="/professional/$providerId"
                params={{
                  providerId: String(provider.id),
                }}
                className="flex min-w-0 items-center gap-3 group/profile"
              >
                {/* Avatar */}
                {avatar ? (
                  <img
                    src={avatar}
                    alt={providerName}
                   className="h-8 w-8 shrink-0 rounded-full object-cover transition-transform duration-200 group-hover/profile:scale-105 sm:h-10 sm:w-10"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground sm:h-10 sm:w-10">
                    {initials}
                  </div>
                )}

                {/* Name & Title */}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-card-foreground group-hover/profile:text-primary transition-colors">
                    {providerName}
                  </h3>

                  <p className="truncate text-xs text-muted-foreground">
                    {providerTitle}
                  </p>
                </div>
              </Link>

              {/* Favorite */}
              <button
                type="button"
                onClick={() => toggleFavorite(provider.id)}
                disabled={favoriteLoading === provider.id}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted disabled:opacity-50"
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
            </div>

            {/* Service Count */}
            <div className="mt-4">
              <span className="text-sm font-semibold text-card-foreground">
                {providerServices.length}{" "}
                {providerServices.length === 1
                  ? "Service"
                  : "Services"}
              </span>

              <span className="mx-2 text-muted-foreground">
                •
              </span>

              <span className="text-sm text-muted-foreground">
                {provider?.neighborhood || "Qardho"}
              </span>
            </div>

            {/* Services Preview */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {visibleServices.map((service: any) => (
                <span
                  key={service.id}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {service.Title}
                </span>
              ))}

              {remainingServices > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  +{remainingServices} more
                </span>
              )}
            </div>

            {/* Verified */}
            {profile?.is_verified && (
              <div className="mt-3">
                <span className="text-xs font-medium text-green-600">
                  ✓ Verified
                </span>
              </div>
            )}

            {/* Rating & Reviews */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 font-semibold text-card-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {provider?.rating ?? "5.0"}
              </span>

              <span className="text-muted-foreground">
                ({provider?.review_count ?? 0} reviews)
              </span>
            </div>

            {/* Location & Hourly Rate */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </div>

              <span className="text-sm font-bold text-primary">
                ${provider?.hourly_rate ?? 0}/hr
              </span>
            </div>

            {/* View Profile */}
            <Link
              to="/professional/$providerId"
              params={{
                providerId: String(provider.id),
              }}
              className="mt-4 block"
            >
              <Button
                variant="default"
                size="sm"
                className="w-full"
              >
                View Profile
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  )}
</div>
{userRole !== "guest" && (
  <DashboardBottomNav role={userRole} />
)}
      <Footer />
    </div>
  );
  }
