import { useEffect, useMemo, useState } from "react";
import { useUpdateProfileMutation, useUploadImageMutation } from "../../api/user/userApi.js";
import { Button } from "../common/Button.jsx";
import { Input } from "../common/Input.jsx";
import { ImagePicker } from "../common/ImagePicker.jsx";

export function ProfileCard({ user, currentUser }) {
  const [profileForm, setProfileForm] = useState({
    username: "",
    avatarUrl: "",
    description: ""
  });
  const [updateProfile, updateProfileState] = useUpdateProfileMutation();
  const [uploadImage] = useUploadImageMutation();
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarPreview = useMemo(() => avatarFile ? URL.createObjectURL(avatarFile) : toImageUrl(profileForm.avatarUrl), [avatarFile, profileForm.avatarUrl]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      username: user.username ?? "",
      avatarUrl: user.avatarUrl ?? "",
      description: user.description ?? ""
    });
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    const avatarUrl = avatarFile ? (await uploadImage(avatarFile).unwrap()).url : profileForm.avatarUrl;
    await updateProfile({ ...profileForm, avatarUrl }).unwrap();
    setAvatarFile(null);
  }

  return (
    <section className="rounded-lg bg-gray-900 p-5">
      <h2 className="text-base font-bold">My Profile</h2>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent text-xl font-bold">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            profileForm.username?.[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{currentUser?.email}</p>
          <p className="text-xs text-gray-500">ID: {currentUser?.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          label="Unique username"
          value={profileForm.username}
          onChange={(event) => setProfileForm({ ...profileForm, username: event.target.value })}
        />
        <ImagePicker label="Profile picture" previewUrl={avatarPreview} onChange={setAvatarFile} />
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
            Description
          </span>
          <textarea
            value={profileForm.description}
            onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })}
            className="min-h-24 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-accent"
            maxLength={280}
          />
        </label>
        {updateProfileState.error && (
          <p className="text-sm text-red-300">{updateProfileState.error.data?.message}</p>
        )}
        <Button disabled={updateProfileState.isLoading}>Save Profile</Button>
      </form>
    </section>
  );
}

function toImageUrl(url) {
  if (!url || !url.startsWith("/")) return url;
  return `${(import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/api$/, "")}${url}`;
}
