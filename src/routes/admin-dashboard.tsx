import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, ShieldCheck, FileText,  LogOut,  CheckCircle,  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — ProService Skills Network" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

 const [stats, setStats] = useState([
  { label: "Total Users", value: 0, icon: Users },
  { label: "Active Pros", value: 0, icon: ShieldCheck },
  { label: "Open Requests", value: 0, icon: FileText },
 
]);
useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  // Statistics
  const [usersCount, providersCount, bookingsCount] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("provider_profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  setStats([
    {
      label: "Total Users",
      value: usersCount.count || 0,
      icon: Users,
    },
    {
      label: "Active Pros",
      value: providersCount.count || 0,
      icon: ShieldCheck,
    },
    {
      label: "Open Requests",
      value: bookingsCount.count || 0,
      icon: FileText,
    },
    ]);
    
  
      
      
      
    
  

  // Users
  const { data: usersData } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      is_verified,
      created_at,
      phone
    `)
    .order("created_at", { ascending: false });

  setUsers(usersData || []);

  // Requests
const { data: bookingsData, error } = await supabase
  .from("bookings")
  .select(`
    id,
    status,
    message,
    booking_data,
    created_at,
    profiles:customer_id(
      full_name
    ),
    provider_profiles:provider_id(
      profiles(
        full_name
      )
    ),
    services:services_id(
      Title
    )
  `)
  .order("created_at", { ascending: false });

if (error) {
  console.log(error);
} else {
  setRequests(bookingsData || []);
}
};

  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const approveProfessional = async (id: string) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
    })
    .eq("id", id);

  if (error) {
    console.log(error.message);
    return;
  }

  loadDashboard();
};

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold text-foreground">Pro<span className="gradient-text">Service</span> <span className="text-xs font-normal text-muted-foreground">Admin</span></Link>
          <Button asChild variant="ghost" size="sm"><Link to="/"><LogOut className="h-4 w-4" /></Link></Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Admin Dashboard</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
  Live Data
</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {[
  { id: "users", label: "Users & Professionals" },
  { id: "requests", label: "Service Requests" },
  { id: "analytics", label: "Analytics" },
]
          .map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">phone</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-card-foreground">{user.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.phone || "-"}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === "professional" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>{user.role}</span></td>
                      <td className="px-4 py-3">
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
      user.is_verified
        ? "bg-success/10 text-success"
        : "bg-warning/10 text-warning"
    }`}
  >
    {user.is_verified ? "Verified" : "Pending"}
  </span>
</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {user.role === "professional" && !user.is_verified && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => approveProfessional(user.id)}
  >
    <CheckCircle className="h-4 w-4 text-success" />
  </Button>
)}
  

                          
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      {activeTab === "requests" && (
  <div className="space-y-3">
    {requests.length === 0 ? (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        No service requests found.
      </div>
    ) : (
      requests.map((req: any) => (
        <div
          key={req.id}
          className="rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">

            <div>

              <p className="font-semibold">
                Customer:
                {" "}
                {req.profiles?.full_name || "Unknown"}
              </p>

              <p className="text-sm text-muted-foreground">
                Professional:
                {" "}
                {req.provider_profiles?.profiles?.full_name || "Unknown"}
              </p>

              <p className="text-sm">
                Service:
                {" "}
                {req.services?.Title || "-"}
              </p>

              <p className="text-sm">
                Message:
                {" "}
                {req.message || "-"}
              </p>

              <p className="text-xs text-muted-foreground mt-2">
                Status:
                {" "}
                {req.status}
              </p>

            </div>

            <Button variant="outline">
              View
            </Button>

          </div>
        </div> 
      ))
    )}
  </div>
)}

       {activeTab === "analytics" && (
  <div className="grid gap-4 sm:grid-cols-3">

    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Total Users
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {stats[0].value}
      </h2>
    </div>

    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Verified Professionals
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {stats[1].value}
      </h2>
    </div>

    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Total Bookings
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {stats[2].value}
      </h2>
    </div>

  </div>
)} 
        
   </div>
    </div>
  );
}