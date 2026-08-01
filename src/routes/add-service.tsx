import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/add-service")({
  component: AddServicePage,
});

function AddServicePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Soo qaad categories-ka dhabta ah
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
        setCategories(data || []);
      }
      setLoadingCategories(false);
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title || !price || !categoryId) {
      setSubmitError("Fadlan buuxi Title, Price, iyo Category.");
      return;
    }

    setSubmitting(true);

    // 1. Ogow cida login-gareysay
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSubmitError("User lama helin. Fadlan mar labaad login gareey.");
      setSubmitting(false);
      return;
    }

    // 2. Soo qaad provider_profiles.id (provider_id) ee user-kan
    const { data: providerData, error: providerError } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (providerError || !providerData) {
      setSubmitError(
        "Provider profile lama helin. Hubi in aad tahay professional oo profile-kaaga dhammaystiran."
      );
      setSubmitting(false);
      return;
    }

    // 3. Insert service-ka cusub
    const { error: insertError } = await supabase.from("services").insert({
      Title: title,
      description: description,
      price: Number(price),
      category_id: categoryId,
      provider_id: providerData.id,
      currency: "USD",
      status: "active",
    });

    if (insertError) {
      console.log("Insert error:", insertError.message);
      setSubmitError(insertError.message);
      setSubmitting(false);
      return;
    }

    // 4. Guuleysi — u wareeji Professional Dashboard
    setSubmitting(false);
    navigate({ to: "/professional-dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Add New Service</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium">Service Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Video Editing"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border p-3"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="">
                {loadingCategories ? "Loading..." : "Select Category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Service"}
          </Button>
        </form>
      </div>
    </div>
  );
}