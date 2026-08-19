import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Send, Bookmark, Bell, Clock, MapPin, Plus, Star, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { MessageCircle } from "lucide-react";
import DashboardBottomNav from "@/components/DashboardBottomNav";


export const Route = createFileRoute("/customer-dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ProService Skills Network" }] }),
  component: CustomerDashboard,
});

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
};

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  
  const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [bookings, setBookings] = useState<any[]>([]);
const [loadingBookings, setLoadingBookings] = useState(true);
const [savedPros, setSavedPros] = useState<any[]>([]);
const [loadingSavedPros, setLoadingSavedPros] = useState(true);
const [showReviewModal, setShowReviewModal] = useState(false);
const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const [reviewError, setReviewError] = useState<string | null>(null);
const [reviewSuccess, setReviewSuccess] = useState(false);
const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);
const [notifications, setNotifications] = useState<any[]>([]);
const [notificationsLoading, setNotificationsLoading] = useState(false);

  const tabs = [
    { id: "requests", label: "My Requests", icon: Send },
    { id: "saved", label: "Saved Pros", icon: Bookmark },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "history", label: "History", icon: Clock },
  ];
 useEffect(() => {
  const loadCustomerData = async () => {
    setLoading(true);

    // 1. Hel user-ka hadda login-gareysan
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("User error:", userError?.message);
      setLoading(false);
      return;
    }

    console.log("Logged in customer:", user.id);




    // 2. Soo qaado profile-ka customer-ka
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("Customer profile error:", profileError.message);
    } else {
      console.log("Customer profile data:", profileData);
      setProfile(profileData);
    }

    setLoading(false);
  };

  loadCustomerData();
}, []);

useEffect(() => {
  const loadBookings = async () => {
    setLoadingBookings(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingBookings(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        created_at,
        booking_data,
        message,
        status,
        services (
          id,
          Title,
          price,
          currency,
          categories ( name )
        ),
        provider_profiles (
          id,
          user_id,
          profiles ( full_name )
        )
      `)
      .eq("customer_id", user.id)
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
}, []);

useEffect(() => {
  const loadSavedPros = async () => {
    setLoadingSavedPros(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingSavedPros(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        created_at,
        provider_profiles (
          id,
          title,
          experience_years,
          hourly_rate,
          availability,
          profiles (
            id,
            full_name,
            avatar_URL,
            is_verified
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Saved Pros error:", error.message);
    } else {
      console.log("Saved Pros data:", data);
      setSavedPros(data || []);
    }

    setLoadingSavedPros(false);
  };

  loadSavedPros();
}, []);
useEffect(() => {
  const loadMyReviews = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("booking_id")
      .eq("customer_id", user.id);

    if (error) {
      console.log("My reviews error:", error.message);
    } else {
      setReviewedBookingIds((data || []).map((r) => r.booking_id));
    }
  };

  loadMyReviews();
}, []);
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
    console.log("Notifications error:", error.message);
  } else {
    setNotifications(data || []);
  }

  setNotificationsLoading(false);
};

useEffect(() => {
  if (activeTab === "notifications") {
    loadNotifications();
  }
}, [activeTab]);
const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.log("Mark notification as read error:", error.message);
    return;
  }

  setNotifications((prev) =>
    prev.map((notification) =>
      notification.id === notificationId
        ? { ...notification, is_read: true }
        : notification
    )
  );
};
const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.log("Delete notification error:", error.message);
    return;
  }

  setNotifications((prev) =>
    prev.filter(
      (notification) => notification.id !== notificationId
    )
  );
};
const clearAllNotifications = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.log("Clear notifications error:", error.message);
    return;
  }

  setNotifications([]);
};
const markAllNotificationsAsRead = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.log("Mark all notifications error:", error.message);
    return;
  }

  setNotifications((prev) =>
    prev.map((notification) => ({
      ...notification,
      is_read: true,
    }))
  );
};

const openReviewModal = (booking: any) => {
  setSelectedBookingForReview(booking);
  setReviewRating(0);
  setReviewComment("");
  setReviewError(null);
  setReviewSuccess(false);
  setShowReviewModal(true);
};

const handleReviewSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setReviewError(null);

  if (reviewRating === 0) {
    setReviewError("Fadlan dooro rating (xiddig).");
    return;
  }

  setReviewSubmitting(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setReviewError("Fadlan mar labaad login gareey.");
    setReviewSubmitting(false);
    return;
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    booking_id: selectedBookingForReview.id,
    customer_id: user.id,
    provider_id: selectedBookingForReview.provider_profiles?.id,
    rating: reviewRating,
    comment: reviewComment,
  });

  if (insertError) {
    console.log("Review insert error:", insertError.message);
    setReviewError(insertError.message);
    setReviewSubmitting(false);
    return;
  }

  setReviewedBookingIds((prev) => [...prev, selectedBookingForReview.id]);
  setReviewSubmitting(false);
  setReviewSuccess(true);
};

  return (
    
    
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold text-foreground">Pro<span className="gradient-text">Service</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
  {loading ? "Loading..." : profile?.full_name || "Customer"}
</span>


            <Button asChild variant="ghost" size="sm"><Link to="/"><LogOut className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
  {loading
    ? "Welcome..."
    : `Welcome, ${profile?.full_name || "Customer"}`}
</h1>
            <p className="text-sm text-muted-foreground">Manage your service requests</p>
          </div>
          
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
  {[
    {
      label: "Total Requests",
      value: bookings.length,
      color: "primary",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      color: "warning",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      color: "success",
    },
   {
  label: "Saved Pros",
  value: savedPros.length,   // ✅ xog dhab ah
  color: "accent",
},
  ].map((stat, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <p className="text-sm text-muted-foreground">
        {stat.label}
      </p>

      <p className="mt-1 text-2xl font-bold text-foreground">
        {stat.value}
      </p>
    </motion.div>
  ))}
</div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "requests" && (
  <div className="space-y-3">
    {loadingBookings ? (
      <p className="text-sm text-muted-foreground">Loading...</p>
    ) : bookings.length === 0 ? (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Wax codsi ah ma hayside
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tag Services page-ka si aad u sameyso codsigaaga ugu horeeya.
        </p>
      </div>
    ) : (
      bookings.map((booking) => {
        const service = booking.services;
        const provider = booking.provider_profiles;
        const providerName = provider?.profiles?.full_name || "Professional";
        const categoryName = service?.categories?.name || "";

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {categoryName}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusColors[booking.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold text-card-foreground">
                  {service?.Title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Professional: {providerName}
                </p>
                {booking.message && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {booking.message}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                 
                  <span>{booking.booking_data}</span>
                </div>
              </div>
          <div className="flex flex-col items-end gap-2">
  <span className="text-sm font-bold text-primary">
    {service?.currency || "USD"} {service?.price ?? 0}
  </span>

  {provider?.user_id && (
    <Button asChild size="sm" variant="outline">
      <Link
        to="/messages"
        search={{
          receiverId: provider.user_id,
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

       {activeTab === "saved" && (
  <div>
    {loadingSavedPros ? (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Loading saved professionals...
        </p>
      </div>
    ) : savedPros.length === 0 ? (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No Saved Professionals
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          You have not saved any professionals yet.
          Go to Services and save your favorite professionals.
        </p>

        <Button asChild variant="hero" className="mt-4">
          <Link to="/services">
            Browse Services
          </Link>
        </Button>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedPros.map((favorite) => {
          const provider = favorite.provider_profiles;
          const providerProfile = provider?.profiles;

          const providerName =
            providerProfile?.full_name || "Professional";

          const providerTitle =
            provider?.title || "Service Provider";

          const avatar =
            providerProfile?.avatar_URL;

          const initials = providerName
            .split(" ")
            .map((name: string) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
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

                <div className="min-w-0">
                  <h4 className="font-semibold text-card-foreground">
                    {providerName}
                  </h4>

                  <p className="text-xs text-muted-foreground">
                    {providerTitle}
                  </p>

                  {providerProfile?.is_verified && (
                    <span className="text-xs font-medium text-green-600">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1">
          

                {provider?.experience_years !== null &&
                  provider?.experience_years !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Experience: {provider.experience_years} years
                    </p>
                  )}

                {provider?.hourly_rate !== null &&
                  provider?.hourly_rate !== undefined && (
                    <p className="text-xs font-medium text-primary">
                      ${provider.hourly_rate}/hour
                    </p>
                  )}
              </div>

              <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
  <Link
    to="/professional/$providerId"
    params={{ providerId: String(provider.id) }}
  >
    View Profile
  </Link>
</Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    )}
  </div>
)}

       {activeTab === "notifications" && (
  <div className="space-y-4">

    {/* Notification Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground">
        Notifications
      </h2>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={markAllNotificationsAsRead}
        >
          Mark all as read
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={clearAllNotifications}
        >
          Clear all
        </Button>
      </div>
    </div>

    {/* Loading */}
    {notificationsLoading ? (
      <p className="text-sm text-muted-foreground">
        Loading notifications...
      </p>

    ) : notifications.length === 0 ? (

      /* No Notifications */
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <Bell className="mx-auto h-10 w-10 text-muted-foreground" />

        <h3 className="mt-3 font-semibold text-card-foreground">
          No notifications
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          You don't have any notifications yet.
        </p>
      </div>

    ) : (

      /* Notifications List */
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border border-border bg-card p-4 shadow-card transition ${
              notification.is_read
                ? "opacity-70"
                : "border-primary/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">

              <div className="flex gap-3">

                {/* Unread Indicator */}
                <div
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.is_read
                      ? "bg-muted"
                      : "gradient-primary"
                  }`}
                />

                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {notification.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.body}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2">

                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      markNotificationAsRead(notification.id)
                    }
                  >
                    Mark read
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    deleteNotification(notification.id)
                  }
                >
                  Delete
                </Button>

              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {activeTab === "history" && (
  <div className="space-y-3">
    {bookings.filter((booking) => booking.status === "completed").length === 0 ? (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No completed requests
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Your completed service requests will appear here.
        </p>
      </div>
    ) : (
      bookings
        .filter((booking) => booking.status === "completed")
        .map((booking) => {
          const service = booking.services;
          const provider = booking.provider_profiles;

          const providerName =
            provider?.profiles?.full_name || "Professional";

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {service?.Title || "Service"}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Professional: {providerName}
                  </p>

                  {booking.message && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.message}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-muted-foreground">
                    {booking.booking_data}
                  </p>

                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status}
                </span>
                {!reviewedBookingIds.includes(booking.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReviewModal(booking)}
                    >
                      Rate this service
                    </Button>
                  ) : (
                    <span className="text-xs font-medium text-success">
                      ✓ Waad qiimeysay
                    </span>
                  )}
              </div>
            </motion.div>
          );
          
        })
    )}
    {showReviewModal && selectedBookingForReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              {reviewSuccess ? (
                <div className="text-center py-6">
                  <h2 className="text-xl font-bold text-card-foreground">
                    Mahadsanid qiimeyntaada! ⭐
                  </h2>
                  <Button className="mt-4 w-full" onClick={() => setShowReviewModal(false)}>
                    Xir
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-card-foreground">
                    Qiimee Adeeggan
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedBookingForReview.services?.Title}
                  </p>

                  <form className="mt-4 space-y-4" onSubmit={handleReviewSubmit}>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                          >
                            <Star
                              className={`h-7 w-7 ${
                                star <= reviewRating
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Comment (ikhtiyaari)
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        placeholder="Sharax khibradaada..."
                      />
                    </div>

                    {reviewError && (
                      <p className="text-sm text-destructive">{reviewError}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowReviewModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="hero"
                        className="flex-1"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? "Diraya..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
  </div>
)}

      
      </div>
      <DashboardBottomNav role="customer" />
    </div>
  );
}