import React, { useEffect, useMemo, useState } from "react";
import { normalizeImageUrl } from "@/lib/url";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type UserMe = {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  imageUrl?: string;
};


export default function ProfileContent() {
  const [me, setMe] = useState<UserMe | null>(null);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Load current user
  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        setError("");

        const data = await apiFetch<UserMe>("/users/get-profile", {
          method: "GET",
        });

        setMe(data);
        setFirstname(data.firstname ?? "");
        setLastname(data.lastname ?? "");
        setEmail(data.email ?? "");
        setAvatarPreview(normalizeImageUrl(data.imageUrl));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  // ✅ Preview selected file
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const hasChanges = useMemo(() => {
    if (!me) return false;
    return (
      firstname !== (me.firstname ?? "") ||
      lastname !== (me.lastname ?? "") ||
      email !== (me.email ?? "") ||
      !!avatarFile
    );
  }, [me, firstname, lastname, email, avatarFile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // ✅ single request: multipart/form-data
      const fd = new FormData();

      if (firstname !== me.firstname) fd.append("firstname", firstname.trim());
      if (lastname !== me.lastname) fd.append("lastname", lastname.trim());
      if (email !== me.email) fd.append("email", email.trim().toLowerCase());

      if (avatarFile) fd.append("avatar", avatarFile); // IMPORTANT: must match multer field name

      const updated = await apiFetch<UserMe>("/users/update-profile", {
        method: "PATCH",
        body: fd,
        isFormData: true,
      });

      setMe(updated);
      setFirstname(updated.firstname ?? "");
      setLastname(updated.lastname ?? "");
      setEmail(updated.email ?? "");
      setAvatarPreview(normalizeImageUrl(updated.imageUrl));
      setAvatarFile(null);

      setSuccess("Profile updated successfully ✅");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingMe) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Loading profile…</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="p-6">
        <div className="text-sm text-destructive">{error || "No user loaded"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="p-6 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600">
              {success}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">No photo</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Profile photo</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">PNG/JPG recommended.</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="First name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Last name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Email"
                type="email"
              />
            </div>

            {/* Username read-only */}
            <div className="space-y-2 md:col-span-2">
              <Label>Username</Label>
              <Input value={me.username} disabled className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setFirstname(me.firstname ?? "");
                setLastname(me.lastname ?? "");
                setEmail(me.email ?? "");
                setAvatarFile(null);
                setAvatarPreview(normalizeImageUrl(me.imageUrl));
                setError("");
                setSuccess("");
              }}
              disabled={loading}
            >
              Reset
            </Button>

            <Button type="submit" className="rounded-xl" disabled={loading || !hasChanges}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
