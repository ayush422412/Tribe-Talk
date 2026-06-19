import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteServerMutation,
  useGetServerQuery,
  useUpdateServerMutation
} from "../../entities/server/serverApi.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Input } from "../../shared/ui/Input.jsx";
import { Modal } from "../../shared/ui/Modal.jsx";
import { closeEditServer } from "../ui/uiSlice.js";
import { setCurrentServerId } from "../workspace/workspaceSlice.js";

export function EditServerModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.editServerOpen);
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const { data } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const [form, setForm] = useState({ name: "", iconUrl: "" });
  const [updateServer, updateState] = useUpdateServerMutation();
  const [deleteServer, deleteState] = useDeleteServerMutation();
  const error = updateState.error ?? deleteState.error;

  useEffect(() => {
    if (data?.server?.name) {
      setForm({
        name: data.server.name,
        iconUrl: data.server.iconUrl ?? ""
      });
    }
  }, [data]);

  async function handleSubmit(event) {
    event.preventDefault();
    await updateServer({ serverId: currentServerId, ...form }).unwrap();
    dispatch(closeEditServer());
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this server and all channels/messages?");

    if (!confirmed) {
      return;
    }

    await deleteServer(currentServerId).unwrap();
    dispatch(setCurrentServerId(null));
    dispatch(closeEditServer());
  }

  return (
    <Modal title="Server Settings" isOpen={isOpen} onClose={() => dispatch(closeEditServer())}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Server name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <div className="mt-4">
          <Input
            label="Server image URL"
            value={form.iconUrl}
            onChange={(event) => setForm({ ...form, iconUrl: event.target.value })}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-300">{error.data?.message}</p>}
        <div className="mt-6 flex justify-between gap-3">
          <Button type="button" variant="secondary" onClick={handleDelete} disabled={deleteState.isLoading}>
            Delete
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => dispatch(closeEditServer())}>
              Cancel
            </Button>
            <Button disabled={updateState.isLoading || !form.name.trim()}>Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
