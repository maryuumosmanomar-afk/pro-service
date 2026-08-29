import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Send,
  Bookmark,
  Bell,
  Clock,
  MapPin,
  Plus,
  Star,
  ClipboardList,
  Camera,
  CalendarDays,
  Clock3,
  MessageCircle,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import DashboardBottomNav from "@/components/DashboardBottomNav";

export const Route = createFileRoute("/customer-dashboard")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [{ title: "Dashboard — ProService Skills Network" }],
  }),

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
    { id: "saved", label: "Saved Pros", icon: Heart },
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
  <div className="min-h-screen bg-background pb-16">
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="text-lg font-bold text-foreground">
          Pro<span className="gradient-text">Service</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading..." : profile?.full_name || "Customer"}
          </span>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">

      {/* WELCOME */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/10 shadow-card">
        <div className="relative flex min-h-[150px] items-center px-4 py-5 sm:min-h-[190px] sm:px-8 sm:py-7">

          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />

          <div className="absolute right-5 top-5 hidden h-12 w-12 rotate-6 items-center justify-center rounded-xl bg-primary/10 text-2xl shadow-sm sm:flex">
            ✨
          </div>

          <div className="absolute bottom-5 right-12 hidden h-9 w-9 items-center justify-center rounded-full bg-success/10 text-lg sm:flex">
            ✓
          </div>

          <div className="relative z-10 max-w-2xl">

            <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              ProService Skills Network
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl shadow-sm sm:h-12 sm:w-12 sm:text-2xl">
                👋
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Good to see you again,
                </p>

                <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                  {loading
                    ? "Welcome..."
                    : `Welcome, ${profile?.full_name || "Customer"}`} 💙
                </h1>
              </div>
            </div>

            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Manage your service requests, track your jobs, and connect with trusted professionals.
            </p>

          </div>
        </div>
      </div>


      {/* STATISTICS CARDS */}
      <div className="mb-5 grid grid-cols-4 gap-1.5 sm:gap-3">
        {[
          {
            label: "Requests",
            value: bookings.length,
            description: "All requests",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            wave: "text-blue-200",
            icon: ClipboardList,
          },
          {
            label: "Pending",
            value: bookings.filter((b) => b.status === "pending").length,
            description: "Waiting",
            color: "text-orange-500",
            bg: "bg-orange-50",
            border: "border-orange-100",
            wave: "text-orange-200",
            icon: Clock,
          },
          {
            label: "Completed",
            value: bookings.filter((b) => b.status === "completed").length,
            description: "Completed",
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
            wave: "text-green-200",
            icon: CheckCircle2,
          },
          {
            label: "Saved",
            value: savedPros.length,
            description: "Favorites",
            color: "text-pink-500",
            bg: "bg-pink-50",
            border: "border-pink-100",
            wave: "text-pink-200",
            icon: Heart,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`group relative min-w-0 overflow-hidden rounded-xl border ${stat.border} bg-card p-2 shadow-sm sm:rounded-2xl sm:p-4`}
            >
              <div className="relative z-10">

                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-medium text-muted-foreground sm:text-xs">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color} sm:h-9 sm:w-9`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>

                <p className="mt-1 hidden truncate text-[10px] text-muted-foreground sm:block">
                  {stat.description}
                </p>
              </div>

              <div
                className={`pointer-events-none absolute -bottom-1 left-0 right-0 ${stat.wave}`}
              >
                <svg
                  viewBox="0 0 400 70"
                  className="h-7 w-full sm:h-10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 42 C70 15, 120 18, 185 38 C250 58, 315 58, 400 25 L400 70 L0 70 Z"
                    fill="currentColor"
                    opacity="0.35"
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* TABS */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {tab.label}
          </button>
        ))}
      </div>


      {/* REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-2">

          {loadingBookings ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">
                Loading your requests...
              </p>
            </div>

          ) : bookings.length === 0 ? (

            <div className="rounded-xl border border-border bg-card px-4 py-8 text-center shadow-card">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mt-3 text-base font-semibold text-foreground">
                No requests yet
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Tag Services page-ka si aad u sameyso codsigaaga ugu horeeya.
              </p>
            </div>

          ) : (

            bookings.map((booking) => {
              const service = booking.services;
              const provider = booking.provider_profiles;

              const providerName =
                provider?.profiles?.full_name || "Professional";

              const categoryName =
                service?.categories?.name || "Service";

              const isCompleted = booking.status === "completed";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2.5">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-green-50 text-green-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Camera className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {categoryName}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              isCompleted
                                ? "bg-blue-50 text-blue-600"
                                : booking.status === "pending"
                                ? "bg-orange-50 text-orange-600"
                                : booking.status === "accepted"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <h3 className="truncate text-sm font-bold text-card-foreground sm:text-base">
                          {service?.Title || "Service"}
                        </h3>

                        <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                          Professional:{" "}
                          <span className="font-medium text-primary">
                            {providerName}
                          </span>
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground sm:text-[10px]">
                          <CalendarDays className="h-3 w-3" />
                          <span>{booking.booking_data}</span>
                        </div>

                      </div>
                    </div>


                    <div className="flex shrink-0 items-center gap-2">

                      {isCompleted && (
                        <span className="hidden items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-600 sm:flex">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </span>
                      )}

                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground">
                          {service?.currency || "USD"}
                        </p>

                        <p className="text-sm font-bold text-foreground">
                          {service?.price ?? 0}
                        </p>
                      </div>

                      {provider?.user_id && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-[10px]"
                        >
                          <Link
                            to="/messages"
                            search={{
                              receiverId: provider.user_id,
                            }}
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              Message
                            </span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 h-0.5 w-full ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-200 via-emerald-100 to-green-200"
                        : "bg-gradient-to-r from-primary/20 via-primary/5 to-transparent"
                    }`}
                  />
                </motion.div>
              );
            })
          )}
        </div>
      )}


      {/* SAVED PROFESSIONALS */}
      {activeTab === "saved" && (
        <div>

          {loadingSavedPros ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">
                Loading saved professionals...
              </p>
            </div>

          ) : savedPros.length === 0 ? (

            <div className="py-8 text-center">
              <h3 className="text-base font-semibold text-foreground">
                No Saved Professionals
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                You have not saved any professionals yet.
                Go to Services and save your favorite professionals.
              </p>

              <Button asChild variant="hero" className="mt-3" size="sm">
                <Link to="/services">
                  Browse Services
                </Link>
              </Button>
            </div>

          ) : (

            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-w-0 rounded-xl border border-border bg-card p-2 shadow-sm sm:p-4"
                  >

                    <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:gap-3">

                      {avatar ? (
                        <img
                          src={avatar}
                          alt={providerName}
                          className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground sm:h-11 sm:w-11">
                          {initials}
                        </div>
                      )}

                      <div className="mt-1 min-w-0 sm:mt-0">
                        <h4 className="truncate text-[10px] font-semibold text-card-foreground sm:text-sm">
                          {providerName}
                        </h4>

                        <p className="truncate text-[8px] text-muted-foreground sm:text-xs">
                          {providerTitle}
                        </p>

                        {providerProfile?.is_verified && (
                          <span className="text-[8px] font-medium text-green-600 sm:text-xs">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 hidden space-y-0.5 sm:block">

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

                    <div className="mt-2 flex">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-6 w-full px-1 text-[8px] sm:h-8 sm:text-xs"
                      >
                        <Link
                          to="/professional/$providerId"
                          params={{ providerId: String(provider.id) }}
                        >
                          View Profile
                        </Link>
                      </Button>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-3">

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground sm:text-xl">
              Notifications
            </h2>

            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[9px] sm:h-8 sm:px-3 sm:text-xs"
                onClick={markAllNotificationsAsRead}
              >
                Mark all
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[9px] sm:h-8 sm:px-3 sm:text-xs"
                onClick={clearAllNotifications}
              >
                Clear
              </Button>
            </div>
          </div>


          {notificationsLoading ? (

            <p className="text-xs text-muted-foreground">
              Loading notifications...
            </p>

          ) : notifications.length === 0 ? (

            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-2 text-sm font-semibold text-card-foreground">
                No notifications
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                You don't have any notifications yet.
              </p>
            </div>

          ) : (

            <div className="space-y-1.5">

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition ${
                    notification.is_read
                      ? "opacity-70"
                      : "border-primary/30"
                  }`}
                >

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex min-w-0 gap-2">

                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.is_read
                            ? "bg-muted"
                            : "gradient-primary"
                        }`}
                      />

                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-card-foreground sm:text-sm">
                          {notification.title}
                        </h3>

                        <p className="line-clamp-2 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                          {notification.body}
                        </p>

                        <p className="mt-0.5 text-[8px] text-muted-foreground sm:text-[10px]">
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>


                    <div className="flex shrink-0 gap-1">

                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[8px]"
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          Read
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[8px]"
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


      {/* HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-2">

          {bookings.filter(
            (booking) => booking.status === "completed"
          ).length === 0 ? (

            <div className="py-8 text-center">
              <h3 className="text-base font-semibold text-foreground">
                No completed requests
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
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
                    className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
                  >

                    <div className="flex items-center justify-between gap-2">

                      <div className="min-w-0">

                        <h3 className="truncate text-xs font-semibold text-card-foreground sm:text-sm">
                          {service?.Title || "Service"}
                        </h3>

                        <p className="truncate text-[10px] text-muted-foreground">
                          Professional: {providerName}
                        </p>

                        {booking.message && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                            {booking.message}
                          </p>
                        )}

                        <p className="mt-0.5 text-[9px] text-muted-foreground">
                          {booking.booking_data}
                        </p>

                      </div>


                      <div className="flex shrink-0 items-center gap-1.5">

                        <span
                          className={`rounded-full px-2 py-0.5 text-[8px] font-medium capitalize ${
                            statusColors[booking.status]
                          }`}
                        >
                          {booking.status}
                        </span>

                        {!reviewedBookingIds.includes(booking.id) ? (

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[9px]"
                            onClick={() => openReviewModal(booking)}
                          >
                            Rate
                          </Button>

                        ) : (

                          <span className="text-[8px] font-medium text-success">
                            ✓ Rated
                          </span>

                        )}

                      </div>
                    </div>

                  </motion.div>
                );
              })
          )}


          {/* REVIEW MODAL */}
          {showReviewModal && selectedBookingForReview && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated"
                onClick={(e) => e.stopPropagation()}
              >

                {reviewSuccess ? (

                  <div className="py-6 text-center">
                    <h2 className="text-xl font-bold text-card-foreground">
                      Mahadsanid qiimeyntaada! ⭐
                    </h2>

                    <Button
                      className="mt-4 w-full"
                      onClick={() => setShowReviewModal(false)}
                    >
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

                    <form
                      className="mt-4 space-y-4"
                      onSubmit={handleReviewSubmit}
                    >

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
                          onChange={(e) =>
                            setReviewComment(e.target.value)
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={3}
                          placeholder="Sharax khibradaada..."
                        />
                      </div>

                      {reviewError && (
                        <p className="text-sm text-destructive">
                          {reviewError}
                        </p>
                      )}

                      <div className="flex gap-3 pt-2">

                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setShowReviewModal(false)
                          }
                        >
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          variant="hero"
                          className="flex-1"
                          disabled={reviewSubmitting}
                        >
                          {reviewSubmitting
                            ? "Diraya..."
                            : "Submit Review"}
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