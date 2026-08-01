import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — ProService Skills Network" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [role, setRole] = useState<"customer" | "professional">("customer");
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
const [category, setCategory] = useState("");
const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Auth error:", error.message);
    setLoading(false);
    return;
  }

  // 2. Get user id
  if (!data.user) {
  console.log("User not found");
  setLoading(false);
  return;
}

const user = data.user;

 // 3. Insert into profiles
const { error: profileError } = await supabase
  .from("profiles")
  .insert({
    id: user.id,
    full_name: firstName + " " + lastName,
    phone,
    role,
  });

if (profileError) {
  console.log("Profile error:", profileError.message);
  setLoading(false);
  return;
}

// 4. Haddii user-ku Professional yahay, samee provider_profiles row
if (role === "professional") {
  // Soo qaado category id
  
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  if (categoryError) {
    console.log("Category error:", categoryError.message);
    setLoading(false);
    return;
  }

  // Samee provider profile
  const { error: providerError } = await supabase
    .from("provider_profiles")
    .insert({
      user_id: user.id,
      category_id: categoryData.id,
      title: category,
      experience_years: 0,
      hourly_rate: 0,
      location: "",
      availability: true,
    });

  if (providerError) {
    console.log("Provider error:", providerError.message);
    setLoading(false);
    return;
  }
}

// 5. Guul
console.log("User + profile created successfully");

setLoading(false);

alert(
  "Your account has been created successfully! Please check your email and verify your account before logging in."
);

navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join ProService Skills Network today</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex rounded-lg bg-muted p-1">
              {(["customer", "professional"] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {r === "customer" ? "I need a service" : "I offer services"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">First name</label>
                  <input 
                    
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="John"
  required
/>
                
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Last name</label>
                  <input
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="Doe"
  required
/>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input type="email"  value={email}
onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" required />
                
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
                <input type="tel" value={phone}
onChange={(e) => setPhone(e.target.value)} className= "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+1 (555) 000-0000" required />
            
              </div>
              {role === "professional" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Service category</label>
                  <select 
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  required
>
                    <option value="">Select a category</option>
                    <option>Video Editor</option><option>Electrician</option><option>House Renovation</option><option>Wedding Makeup</option><option>Photographer</option><option>Computer Technician</option><option>Car Mechanic</option><option>Emergency Medical</option>
                  </select>
                </div>
              )}
              <div> 
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" required />
              </div>
              <Button
  type="submit"
  variant="hero"
  size="lg"
  className="w-full"
  disabled={loading}
>
  {loading ? "Creating..." : "Create Account"}
</Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}