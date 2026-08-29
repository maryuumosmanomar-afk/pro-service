import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Inbox, CheckCircle, DollarSign, Star, MapPin, ToggleLeft, ToggleRight, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import DashboardBottomNav from "@/components/DashboardBottomNav";

export const Route = createFileRoute("/professional-dashboard")({
  head: () => ({ meta: [{ title: "Professional Dashboard — ProService Skills Network" }] }),
  component: ProfessionalDashboard,
});

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
};

function ProfessionalDashboard() {
  const navigate = useNavigate();

  const [available, setAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState("incoming");

  const [profile, setProfile] = useState<any>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
const [loadingBookings, setLoadingBookings] = useState(true);
const [reviews, setReviews] = useState<any[]>([]);
const [loadingReviews, setLoadingReviews] = useState(true);
 const [notifications, setNotifications] = useState<any[]>([]);
const [notificationsLoading, setNotificationsLoading] = useState(false);
  useEffect(() => {
    const loadProfessionalData = async () => {
      setLoading(true);

      // 1. Hel user-ka hadda login-gareysan
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

     if (userError || !user) {
  console.log("User error:", userError?.message);

  navigate({
    to: "/login",
    replace: true,
  });

  setLoading(false);
  return;
}

      console.log("Logged in user:", user.id);

      // 2. Soo qaado profile-ka user-ka
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id) 
        .single();

   if (profileError) {
  console.log("Profile error:", profileError.message);
  setLoading(false);
  return;
}

console.log("Profile data:", profileData);

if (profileData?.role !== "professional") {
  navigate({
    to: "/customer-dashboard",
    replace: true,
  });

  setLoading(false);
  return;
}

setProfile(profileData);

      // 3. Soo qaado provider profile-ka
     const { data: providerData, error: providerError } = await supabase
  .from("provider_profiles")
  .select("*")
  .eq("user_id", user.id)
  .maybeSingle();

      if (providerError) {
        console.log("Provider profile error:", providerError.message);
      } else {
        console.log("Provider profile data:", providerData);
        setProviderProfile(providerData);
        setAvailable(providerData?.availability ?? false);

        // 4. Haddii category_id jiro, soo qaado category-ga
        if (providerData.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("name")
            .eq("id", providerData.category_id)
            .single();

          if (categoryError) {
            console.log("Category error:", categoryError.message);
          } else {
            console.log("Category data:", categoryData);
            setCategoryName(categoryData.name);
          }
        }
      }

      setLoading(false);
    };

    loadProfessionalData();
  }, []);

  useEffect(() => {
  const loadBookings = async () => {
    if (!providerProfile?.id) {
      setLoadingBookings(false);
      return;
    }

    setLoadingBookings(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        created_at,
        booking_data,
        message,
        status,
        customer_id,
        services (
          id,
          Title,
          price,
          currency
        ),
        profiles (
          full_name,
          phone,
          city
        )
      `)
      .eq("provider_id", providerProfile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Bookings error:", error.message);
    } else {
      console.log("Bookings data:", data);
      setBookings(data || []);
    }

    setLoadingBookings(false);
  };

  loadBookings();
}, [providerProfile]);

  const totalRequests = bookings.length;

const acceptedJobs = bookings.filter(
  (booking) => booking.status === "accepted"
).length;

const completedJobs = bookings.filter(
  (booking) => booking.status === "completed"
);

const earnings = completedJobs.reduce(
  (total, booking) =>
    total + Number(booking.services?.price || 0),
  0
);

const averageRating =
  reviews.length > 0
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : "0.0";
    const handleToggleAvailability = async () => {
  if (!providerProfile?.id) return;

  const newAvailability = !available;

  const { error } = await supabase
    .from("provider_profiles")
    .update({
      availability: newAvailability,
    })
    .eq("id", providerProfile.id);

  if (error) {
    console.log("Availability update error:", error.message);
    return;
  }

  setAvailable(newAvailability);

  setProviderProfile((prev: any) => ({
    ...prev,
    availability: newAvailability,
  }));
};

const stats = [
  {
    label: "Total Requests",
    value: totalRequests.toString(),
    icon: Inbox,
  },
  {
    label: "Accepted Jobs",
    value: acceptedJobs.toString(),
    icon: CheckCircle,
  },
  {
    label: "Earnings",
    value: `$${earnings.toFixed(2)}`,
    icon: DollarSign,
  },
  {
    label: "Rating",
    value: averageRating,
    icon: Star,
  },
];
 const handleUpdateStatus = async (
  bookingId: string,
  newStatus: string
) => {
  // 1. Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) {
    console.log("Update status error:", error.message);
    return;
  }

  // 2. Hel booking-ka la update gareeyay
  const booking = bookings.find(
    (b) => b.id === bookingId
  );

  // 3. U dir notification customer-ka
  if (booking) {
    const statusText =
      newStatus === "accepted"
        ? "waa la aqbalay ✅"
        : newStatus === "rejected"
        ? "waa la diiday ❌"
        : newStatus === "completed"
        ? "waa la dhammaystiray ✅"
        : "waa la cusboonaysiiyay";

    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: booking.customer_id,
        title: "Codsigaaga waa la cusboonaysiiyay",
        body: `Codsigaaga ee "${
          booking.services?.Title || "service"
        }" ${statusText}`,
        is_read: false,
      });

    if (notifError) {
      console.log(
        "Notification insert error:",
        notifError.message
      );
    }
  }

  // 4. Update UI-ga isla markiiba
  setBookings((prev) =>
    prev.map((b) =>
      b.id === bookingId
        ? { ...b, status: newStatus }
        : b
    )
  );
};

// === ============================
// LOAD PROFESSIONAL REVIEWS
// ===============================
useEffect(() => {
  const loadReviews = async () => {
    if (!providerProfile?.id) {
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          full_name
        )
      `)
      .eq("provider_id", providerProfile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Reviews error:", error.message);
    } else {
      console.log("Reviews data:", data);
      setReviews(data || []);
    }

    setLoadingReviews(false);
  };

  loadReviews();
}, [providerProfile]);


// ===============================
// LOAD PROFESSIONAL NOTIFICATIONS
// ===============================
const loadNotifications = async () => {
  setNotificationsLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setNotifications([]);
    setNotificationsLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(
      "Professional notifications error:",
      error.message
    );
  } else {
    console.log(
      "Professional notifications data:",
      data
    );

    setNotifications(data || []);
  }

  setNotificationsLoading(false);
};


// ===============================
// LOAD NOTIFICATIONS WHEN TAB OPENS
// ===============================
useEffect(() => {
  if (activeTab === "notifications") {
    loadNotifications();
  }
}, [activeTab]);
 
return (
  <div className="min-h-screen bg-background pb-20">
    {/* Header */}
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
        <div className="text-base font-bold text-foreground sm:text-lg">
          Pro<span className="gradient-text">Service</span>
        </div>

        <button
          onClick={handleToggleAvailability}
          className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm"
        >
          {available ? (
            <ToggleRight className="h-5 w-5 text-success sm:h-6 sm:w-6" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
          )}

          <span
            className={
              available
                ? "font-medium text-success"
                : "text-muted-foreground"
            }
          >
            {available ? "Available" : "Offline"}
          </span>
        </button>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">

      {/* Dashboard Header */}
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Professional Dashboard
          </h1>

          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            {loading
              ? "Loading..."
              : `${profile?.full_name || "Professional"} · ${
                  categoryName ||
                  providerProfile?.title ||
                  "Service Provider"
                }`}
          </p>
        </div>

        <Button asChild size="sm" className="shrink-0">
          <Link to="/add-service">+ Add Service</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-2 sm:mb-7 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-2.5 shadow-card sm:p-5"
          >
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-[10px] leading-tight text-muted-foreground sm:text-sm">
                {stat.label}
              </p>

              <stat.icon className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
            </div>

            <p className="mt-1.5 text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 sm:mb-6">
        {[
          { id: "incoming", label: "Incoming Requests" },
          { id: "accepted", label: "Active Jobs" },
          { id: "reviews", label: "Reviews" },
          { id: "notifications", label: "Notifications" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incoming Requests */}
      {activeTab === "incoming" && (
        <div className="space-y-2.5">
          {loadingBookings ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : bookings.filter((b) => b.status === "pending").length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Codsi cusub ma jiro hadda.
            </p>
          ) : (
            bookings
              .filter((b) => b.status === "pending")
              .map((booking) => {
                const service = booking.services;
                const customer = booking.profiles;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-border bg-card p-3.5 shadow-card sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                              statusColors[booking.status]
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <h3 className="mt-1 text-sm font-semibold text-card-foreground sm:text-base">
                          {customer?.full_name || "Customer"}
                        </h3>

                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {service?.Title}
                        </p>

                        {booking.message && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {booking.message}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground sm:text-xs">
                          {customer?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}
                            </span>
                          )}

                          <span>{booking.booking_data}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:shrink-0">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              booking.id,
                              "accepted"
                            )
                          }
                        >
                          Accept
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              booking.id,
                              "rejected"
                            )
                          }
                        >
                          Decline
                        </Button>

                        {booking.customer_id && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link
                              to="/messages"
                              search={{
                                receiverId: booking.customer_id,
                              }}
                            >
                              Message
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>
      )}

      {/* Active Jobs */}
      {activeTab === "accepted" && (
        <div className="space-y-2.5">
          {bookings.filter((b) => b.status === "accepted").length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Shaqo firfircoon ma jirto hadda.
            </p>
          ) : (
            bookings
              .filter((b) => b.status === "accepted")
              .map((booking) => {
                const service = booking.services;
                const customer = booking.profiles;

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-border bg-card p-3.5 shadow-card sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-card-foreground sm:text-base">
                          {customer?.full_name || "Customer"}
                        </h3>

                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {service?.Title}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {customer?.phone && (
                          <Button variant="outline" size="sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </Button>
                        )}

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              booking.id,
                              "completed"
                            )
                          }
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-2">
          {loadingReviews ? (
            <p className="text-sm text-muted-foreground">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm sm:p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({
                      length: Number(review.rating || 0),
                    }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-3.5 w-3.5 fill-warning text-warning"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-card-foreground">
                    {review.profiles?.full_name || "Customer"}
                  </span>
                </div>

                {review.comment && (
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {review.comment}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(
                    review.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-2.5">
          {notificationsLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <h3 className="text-base font-semibold text-foreground">
                No notifications
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Your notifications will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm sm:p-4 ${
                  !notification.is_read
                    ? "border-primary/30 bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {notification.title}
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {notification.body}
                    </p>

                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
      <DashboardBottomNav role="professional" />
    </div>
  );
}