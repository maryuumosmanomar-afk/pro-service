import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { qardhoNeighborhoods } from "@/constants/locations";
import {
  Camera,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error.message);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };
const uploadAvatar = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  try {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const fileExt = file.name.split(".").pop();

    const fileName = `${user.id}.${fileExt}`;

    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }


    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);


    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_URL: publicUrl,
      })
      .eq("id", user.id);


    if (updateError) {
      throw updateError;
    }


    setProfile({
      ...profile,
      avatar_URL: publicUrl,
    });


  } catch (error) {
    console.log(error);

  } finally {
    setUploading(false);
  }
};
const handleLogout = async () => {
  await supabase.auth.signOut();

  navigate({
    to: "/login",
  });
};

const updateNeighborhood = async (
  e: React.ChangeEvent<HTMLSelectElement>
) => {
  const newNeighborhood = e.target.value;

  try {
    setUpdatingLocation(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        neighborhood: newNeighborhood,
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    setProfile({
      ...profile,
      neighborhood: newNeighborhood,
    });

  } catch (error) {
    console.log(error);

  } finally {
    setUpdatingLocation(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-5">

      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
           <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">

  <img
    src={
      profile?.avatar_URL ||
      "https://ui-avatars.com/api/?name=User"
    }
    className="mx-auto h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl"
  />

  <h2 className="mt-5 text-3xl font-bold">
    {profile?.full_name}
  </h2>

  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">

    <ShieldCheck size={16} />

    <span className="capitalize">
      {profile?.role}
    </span>

  </div>

  <label className="mx-auto mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:scale-105">

    <Camera size={18} />

    {uploading ? "Uploading..." : "Change Photo"}

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={uploadAvatar}
    />

  </label>

</div>

            <div className="mt-8 space-y-5 ">

              <div className="rounded-2xl border bg-white p-4 shadow-sm">

  <div className="mb-2 flex items-center gap-2 text-blue-600">

    <Mail size={18} />

    <span className="font-semibold">
      Email
    </span>

  </div>

  <p className="break-all text-gray-700">
    {profile?.email}
  </p>

</div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">

  <div className="mb-2 flex items-center gap-2 text-green-600">

    <Phone size={18} />

    <span className="font-semibold">
      Phone
    </span>

  </div>

  <p className="text-gray-700">
    {profile?.phone}
  </p>

</div>

            </div>

          </>
        )}
         <div className="rounded-2xl border bg-white p-4 shadow-sm">

  <div className="mb-3 flex items-center gap-2 text-purple-500">

    <MapPin size={18} />

    <span className="font-semibold">
      Neighborhood
    </span>

  </div>

  <select
    value={profile?.neighborhood || ""}
    onChange={updateNeighborhood}
    disabled={updatingLocation}
    className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
  >
    <option value="">
      Select neighborhood
    </option>

    {qardhoNeighborhoods.map((area) => (
      <option
        key={area}
        value={area}
      >
        {area}
      </option>
    ))}
  </select>
   </div>
   <button
  onClick={handleLogout}
  className="mt-6 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white transition hover:bg-red-600"
>
  Logout
</button>

        

</div>
      </div>

    
  );
}