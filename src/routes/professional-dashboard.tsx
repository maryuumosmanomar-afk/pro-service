import { createFileRoute, Link } from "@tanstack/react-router";
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
      } else {
        console.log("Profile data:", profileData);
        setProfile(profileData);
      }

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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="text-lg font-bold text-foreground">
  Pro<span className="gradient-text">Service</span>
</div>
          <div className="flex items-center gap-4">
            <button onClick={handleToggleAvailability}
            className="flex items-center gap-2 text-sm"
>
              {available ? <ToggleRight className="h-6 w-6 text-success" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
              <span className={available ? "text-success font-medium" : "text-muted-foreground"}>
                {available ? "Available" : "Offline"}
              </span>
       
            </button>
            
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-foreground">
      Professional Dashboard
    </h1>

    <p className="text-sm text-muted-foreground">
      {loading
        ? "Loading..."
        : `${profile?.full_name || "Professional"} · ${
            categoryName || providerProfile?.title || "Service Provider"
          }`}
    </p>
  </div>

  <Button asChild>
    <Link to="/add-service">
      + Add Service
    </Link>
  </Button>
</div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {[
  { id: "incoming", label: "Incoming Requests" },
  { id: "accepted", label: "Active Jobs" },
  { id: "reviews", label: "Reviews" },
  { id: "notifications", label: "Notifications" },
].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{tab.label}</button>
          ))}
        </div>

       {activeTab === "incoming" && (
  <div className="space-y-3">
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
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold text-card-foreground">
                    {customer?.full_name || "Customer"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service?.Title}
                  </p>
                  {booking.message && (
                    <p className="text-sm text-muted-foreground">
                      {booking.message}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {customer?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {customer.city}
                      </span>
                    )}
                    <span>{booking.booking_data}</span>
                  </div>
                </div>
              <div className="flex flex-wrap gap-2">
  <Button
    variant="hero"
    size="sm"
    onClick={() => handleUpdateStatus(booking.id, "accepted")}
  >
    Accept
  </Button>

  <Button
    variant="outline"
    size="sm"
    onClick={() => handleUpdateStatus(booking.id, "rejected")}
  >
    Decline
  </Button>

  {booking.customer_id && (
    <Button asChild variant="outline" size="sm">
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

      {activeTab === "accepted" && (
  <div className="space-y-3">
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
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {customer?.full_name || "Customer"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service?.Title}
                  </p>
                </div>
                <div className="flex gap-2">
                  {customer?.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="mr-1 h-3 w-3" /> {customer.phone}
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateStatus(booking.id, "completed")}
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


        {activeTab === "reviews" && (
  <div className="space-y-3">
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
          className="rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({
                length: Number(review.rating || 0),
              }).map((_, index) => (
                <Star
                  key={index}
                  className="h-4 w-4 fill-warning text-warning"
                />
              ))}
            </div>

            <span className="text-sm font-medium text-card-foreground">
              {review.profiles?.full_name || "Customer"}
            </span>
          </div>

          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground">
              {review.comment}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      ))
    )}
  </div>
)}
{activeTab === "notifications" && (
  <div className="space-y-3">
    {notificationsLoading ? (
      <p className="text-sm text-muted-foreground">
        Loading notifications...
      </p>
    ) : notifications.length === 0 ? (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No notifications
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Your notifications will appear here.
        </p>
      </div>
    ) : (
      notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-xl border border-border bg-card p-5 shadow-card ${
            !notification.is_read ? "border-primary/30 bg-primary/5" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">
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

            {!notification.is_read && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
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