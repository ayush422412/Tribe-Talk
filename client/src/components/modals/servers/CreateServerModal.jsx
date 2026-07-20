import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../common/Button.jsx";
import { Input } from "../../common/Input.jsx";
import { Modal } from "../../common/Modal.jsx";
import { closeCreateServer } from "../../../store/slices/uiSlice.js";
import { useCreateServerMutation } from "../../../api/server/serverApi.js";
import { setCurrentServerId } from "../../../store/slices/workspaceSlice.js";
import { useUploadImageMutation } from "../../../api/user/userApi.js";
import { ImagePicker } from "../../common/ImagePicker.jsx";

export function CreateServerModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.createServerOpen);
  const [form, setForm] = useState({ name: "", iconUrl: "" });
  const [createServer, { isLoading, error }] = useCreateServerMutation();
  const [uploadImage] = useUploadImageMutation();
  const [iconFile, setIconFile] = useState(null);
  const iconPreview = useMemo(() => iconFile ? URL.createObjectURL(iconFile) : "", [iconFile]);

  async function handleSubmit(event) {
    event.preventDefault();
    const iconUrl = iconFile ? (await uploadImage(iconFile).unwrap()).url : "";
    const result = await createServer({ ...form, iconUrl }).unwrap();
    dispatch(setCurrentServerId(result.server._id));
    dispatch(closeCreateServer());
    setForm({ name: "", iconUrl: "" });
    setIconFile(null);
  }

  return (
    <Modal title="Create Server" isOpen={isOpen} onClose={() => dispatch(closeCreateServer())}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Server name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Study Group"
          required
        />
        <div className="mt-4">
          <ImagePicker label="Server icon" previewUrl={iconPreview} onChange={setIconFile} />
        </div>
        {error && <p className="mt-3 text-sm text-red-300">{error.data?.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => dispatch(closeCreateServer())}>
            Cancel
          </Button>
          <Button disabled={isLoading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
