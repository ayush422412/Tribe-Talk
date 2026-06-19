import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../shared/ui/Button.jsx";
import { Input } from "../../shared/ui/Input.jsx";
import { Modal } from "../../shared/ui/Modal.jsx";
import { closeCreateServer } from "../ui/uiSlice.js";
import { useCreateServerMutation } from "../../entities/server/serverApi.js";
import { setCurrentServerId } from "../workspace/workspaceSlice.js";

export function CreateServerModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.createServerOpen);
  const [name, setName] = useState("");
  const [createServer, { isLoading, error }] = useCreateServerMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await createServer({ name }).unwrap();
    dispatch(setCurrentServerId(result.server._id));
    dispatch(closeCreateServer());
    setName("");
  }

  return (
    <Modal title="Create Server" isOpen={isOpen} onClose={() => dispatch(closeCreateServer())}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Server name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Study Group"
          required
        />
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
