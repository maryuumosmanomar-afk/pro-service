import { type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Star, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
  BadgeCheck, Briefcase, MapPinned, MessageCircle, Heart,} from "lucide-react";
import { BriefcaseBusiness, DollarSign, CircleCheckBig,} from "lucide-react";


export const Route = createFileRoute("/professional/$providerId")({
  component: ProfessionalProfilePage,
});

function ProfessionalProfilePage() {
  const { providerId } = Route.useParams();
  const navigate = useNavigate(); 

  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
const [showBookingModal, setShowBookingModal] = useState(false);
const [bookingMessage, setBookingMessage] = useState("");
const [bookingDate, setBookingDate] = useState("");
const [bookingSubmitting, setBookingSubmitting] = useState(false);
const [bookingError, setBookingError] = useState<string | null>(null);
const [bookingSuccess, setBookingSuccess] = useState(false);
const [averageRating, setAverageRating] = useState(0);
const [reviewCount, setReviewCount] = useState(0);
const [reviews, setReviews] = useState<any[]>([]);
const [galleryImages, setGalleryImages] = useState<any[]>([]);
const [serviceImages, setServiceImages] = useState<any[]>([]);

const loadReviews = async () => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
  rating,
  comment,
  created_at,
  profiles:customer_id (
    full_name,
    avatar_URL
  )
`)
 .eq("provider_id", providerId)
.order("created_at", { ascending: false });
   

  if (error) {
    console.log(error.message);
    return;
  }

  const reviewsData = data || [];
  setReviews(reviewsData);

setReviewCount(reviewsData.length);

if (reviewsData.length === 0) {
  setAverageRating(0);
  return;
}

const total = reviewsData.reduce(
  (sum, review) => sum + review.rating,
  0
);

setAverageRating(total / reviewsData.length);
};

  useEffect(() => {
    const loadProfessional = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("provider_profiles")
        .select(`
          id,
          user_id,
          title,
          experience_years,
          hourly_rate,
          availability,
          profiles (
            id,
            full_name,
            avatar_URL,
            bio,
            city,
            country,
            role,
            is_verified,
            created_at,
            updated_at
          )
        `)
        .eq("id", providerId)
        .single();

      if (error) {
        console.log("Professional profile error:", error.message);
      } else {
        setProvider(data);
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select(`
          id,
          Title,
          description,
          price,
          currency,
          status,
          category_id,
          categories (
            name
          )
        `)
        .eq("provider_id", providerId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (serviceError) {
        console.log("Professional services error:", serviceError.message);
      } else {
        setServices(serviceData || []);

      }
      const { data: imagesData, error: imagesError } = await supabase
  .from("service_images")
  .select(`
    id,
    image_url,
    service_id
  `);

if (imagesError) {
  console.log("Gallery error:", imagesError.message);
} else {
  console.log("Service Images:", imagesData);
  setServiceImages(imagesData || []);
}
      const { data: imageData, error: imageError } = await supabase
  .from("service_images")
  .select(`
    id,
    image_url,
    services!inner (
      provider_id
    )
  `)
  .eq("services.provider_id", providerId);

if (imageError) {
  console.log("Gallery error:", imageError.message);
} else {
  setGalleryImages(imageData || []);
}

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
  const { data: currentProfile, error: currentProfileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (currentProfileError) {
    console.log(
      "Current user profile error:",
      currentProfileError.message
    );
  } else {
    setCurrentUserRole(currentProfile?.role || null);
  }

  const { data: favoriteData } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider_id", providerId)
    .maybeSingle();

  setIsFavorite(!!favoriteData);
}
      await loadReviews();

      setLoading(false);
    };

    loadProfessional();
  }, [providerId]);
const sendMessageToProfessional = () => {
  const receiverId = provider?.profiles?.id;

  if (!receiverId) {
    alert("Professional ID not found");
    return;
  }

  navigate({
    to: "/messages",
    search: {
      receiverId,
    },
  });
};
  const toggleFavorite = async () => {
    setFavoriteLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Fadlan marka hore login gareey.");
      setFavoriteLoading(false);
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("provider_id", providerId);

      if (error) {
        console.log("Remove favorite error:", error.message);
      } else {
        setIsFavorite(false);
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          provider_id: providerId,
        });

      if (error) {
        console.log("Add favorite error:", error.message);
      } else {
        setIsFavorite(true);
      }
    }

    setFavoriteLoading(false);
  };
  const openBookingModal = (service: any) => {
  setSelectedService(service);
  setBookingMessage("");
  setBookingDate("");
  setBookingError(null);
  setBookingSuccess(false);
  setShowBookingModal(true);
};

const handleBookingSubmit = async (e: React.FormEvent) => {
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
    provider_id: providerId,
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
  
// Ku dar notification loo diro professional-ka
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: provider.user_id,
    title: "Codsi cusub ayaad heshay",
    body: `Codsi cusub oo "${selectedService.Title}" ah ayaa kuu yimid.`,
    is_read: false,
  });

  if (notifError) {
    console.log("Notification insert error:", notifError.message);
  }
  
  setBookingSubmitting(false);
  setBookingSuccess(true);

};


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            Loading professional profile...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 text-center">
          <h1 className="text-xl font-bold">
            Professional not found
          </h1>

          <Button asChild className="mt-4">
            <Link to="/services">
              Back to Services
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const profile = provider.profiles;
const isCustomer = currentUserRole === "customer";
  const providerName = profile?.full_name || "Professional";
  const memberSince = profile?.created_at
  ? new Date(profile.created_at).getFullYear()
  : "N/A";

  const initials = providerName
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

    const fullStars = Math.floor(averageRating);
const emptyStars = 5 - fullStars;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
       <Link
  to="/profile"
  className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="h-4 w-4" />
  Back to profile
</Link>
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              {profile?.avatar_URL ? (
                <img
                  src={profile.avatar_URL}
                  alt={providerName}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
                  {initials}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-card-foreground">
                    {providerName}
                  </h1>

                  {profile?.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
  <BadgeCheck className="h-4 w-4" />
  Verified
</span>
                  )}
                </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">

  <Briefcase className="h-4 w-4" />

  <span className="font-medium">
    {provider.title || "Professional Service Provider"}
  </span>

</div>
<div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">

  <MapPin className="h-4 w-4 text-primary" />

  <span className="text-sm">
    {profile?.city}
    {profile?.neighborhood ? ` • ${profile.neighborhood}` : ""}
  </span>

</div>
              </div>
            </div>

            {isCustomer && (
  <div className="flex gap-3">
    <Button
      variant={isFavorite ? "default" : "outline"}
      onClick={toggleFavorite}
      disabled={favoriteLoading}
    >
      <Bookmark
        className={`mr-2 h-4 w-4 ${
          isFavorite ? "fill-current" : ""
        }`}
      />
      {isFavorite ? "Saved" : "Save Professional"}
    </Button>

    <Button
      variant="outline"
      onClick={sendMessageToProfessional}
    >
      Send Message
    </Button>
  </div>
)}
          </div>

          {/* Professional Details */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100">
    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
  </div>

  <p className="text-sm text-gray-500">
    Rating
  </p>

  <div className="mt-2 flex items-center gap-1">
  {[...Array(fullStars)].map((_, i) => (
    <Star
      key={`full-${i}`}
      className="h-4 w-4 fill-yellow-400 text-yellow-400"
    />
  ))}

  {[...Array(emptyStars)].map((_, i) => (
    <Star
      key={`empty-${i}`}
      className="h-4 w-4 text-gray-300"
    />
  ))}
</div>

<p className="mt-2 text-2xl font-bold">
  {reviewCount > 0
    ? averageRating.toFixed(1)
    : "--"}
</p>

<p className="text-sm text-gray-500">
  {reviewCount} Reviews
</p> 

</div>
           <div className="rounded-2xl  border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
    <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
  </div>
 

  <p className="text-sm text-gray-500">
    Experience
  </p>

  <p className="mt-1 text-xl font-bold">
    {provider.experience_years || 0} Years
  </p>

</div>

<div className="rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
    <DollarSign className="h-5 w-5 text-green-600" />
  </div>

  <p className="text-sm text-gray-500">
    Hourly Rate
  </p>

  <p className="mt-1 text-xl font-bold">
    ${provider.hourly_rate || 0}/hr
  </p>

</div>
            <div className="rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

  <div
    className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
      provider.availability
        ? "bg-green-100"
        : "bg-red-100"
    }`}
  >
    <CircleCheckBig
      className={`h-5 w-5 ${
        provider.availability
          ? "text-green-600"
          : "text-red-600"
      }`}
    />
  </div>

  <p className="text-sm text-gray-500">
    Availability
  </p>

  <p className="mt-1 text-xl font-bold">
    {provider.availability ? "Available" : "Unavailable"}
  </p>

</div> 
<div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
    📅
  </div>

  <p className="text-sm text-gray-500">
    Member Since
  </p>

  <p className="mt-1 text-xl font-bold">
    {memberSince}
  </p>

</div>
          </div>

          {profile?.bio && (
            <div className="mt-6">
              <h2 className="font-semibold">About</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {profile.bio}
              </p>
            </div>
          )}  
        </div>

      {/* Work Gallery */}
{/*<div className="mt-10">
  <h2 className="text-2xl font-bold">
    Work Gallery
  </h2>

  {galleryImages.length === 0 ? (
    <p className="mt-4 text-sm text-muted-foreground">
      No work images uploaded yet.
    </p>
  ) : (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {galleryImages.map((image) => (
        <div
          key={image.id}
          className="overflow-hidden rounded-xl border bg-card shadow-sm"
        >
          <img
            src={image.image_url}
            alt="Professional work"
            className="h-52 w-full object-cover transition duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  )}
</div>
*/}

        {/* Services */}

        
        <div className="mt-10">
          <h2 className="text-2xl font-bold">
            Services by {providerName}
          </h2>

          {services.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              This professional has no active services yet.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
  key={service.id}
  className="group rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
>
 <div className="mb-4 h-20 w-full overflow-hidden rounded-xl bg-muted">
  {serviceImages
    .filter((img) => img.service_id === service.id)
    .map((img) => (
      <img
        key={img.id}
        src={img.image_url}
        alt={service.Title}
        className="h-full w-full object-cover"
      />
    ))}

  {serviceImages.filter(
    (img) => img.service_id === service.id
  ).length === 0 && (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      No image
    </div>
  )}
</div>
                 <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
  {service.categories?.name || "Service"}
</span>

                  <h3 className="mt-3 text-lg font-bold">
  {service.Title}
</h3>

                  {service.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
  {service.description}
</p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {service.currency || "USD"} {service.price}
                    </span>

                   <Button size="sm" onClick={() => openBookingModal(service)}>
  Request Service
</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> 
        {/* Reviews */}
<div className="mt-12">
  <h2 className="text-2xl font-bold">
    Customer Reviews
  </h2>

  {reviews.length === 0 ? (
    <p className="mt-4 text-muted-foreground">
      No reviews yet.
    </p>
  ) : (
    <div className="mt-6 space-y-4">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            {review.profiles?.avatar_URL ? (
              <img
                src={review.profiles.avatar_URL}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
                {review.profiles?.full_name?.charAt(0) || "U"}
              </div>
            )}

            <div>
              <h4 className="font-semibold">
                {review.profiles?.full_name || "Customer"}
              </h4>

              <p className="text-sm text-muted-foreground">
                ⭐ {review.rating}/5
              </p>
            </div>
          </div>

          {review.comment && (
            <p className="mt-4 text-muted-foreground">
              {review.comment}
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
      </main>
      {showBookingModal && selectedService && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
    onClick={() => setShowBookingModal(false)}
  >
    <div
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated"
      onClick={(e) => e.stopPropagation()}
    >
      {bookingSuccess ? (
        <div className="text-center py-6">
          <h2 className="text-xl font-bold">Codsigaaga waa la diray! ✅</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Professional-ku wuu ku soo jawaabi doonaa dhawaan.
          </p>
          <Button className="mt-4 w-full" onClick={() => setShowBookingModal(false)}>
            Xir
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">Request Service</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selectedService.Title}</p>

          <form className="mt-4 space-y-4" onSubmit={handleBookingSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Taariikhda aad rabto</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Fariin (ikhtiyaari)</label>
              <textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                rows={3}
              />
            </div>
            {bookingError && <p className="text-sm text-destructive">{bookingError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={bookingSubmitting}>
                {bookingSubmitting ? "Diraya..." : "Send Request"}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  </div>
)}

      <Footer />
    </div>
  );
}