import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useJoinServerMutation } from "../../entities/server/serverApi.js";
import { Button } from "../../shared/ui/Button.jsx";
import { Input } from "../../shared/ui/Input.jsx";
import { Modal } from "../../shared/ui/Modal.jsx";
import { closeJoinServer } from "../ui/uiSlice.js";
import { setCurrentServerId } from "../workspace/workspaceSlice.js";

export function JoinServerModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.joinServerOpen);
  const [serverId, setServerId] = useState("");
  const [joinServer, { isLoading, error }] = useJoinServerMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedServerId = serverId.trim();

    if (!trimmedServerId) {
      return;
    }

    const result = await joinServer(trimmedServerId).unwrap();
    dispatch(setCurrentServerId(result.server._id));
    dispatch(closeJoinServer());
    setServerId("");
  }

  return (
    <Modal title="Join Server" isOpen={isOpen} onClose={() => dispatch(closeJoinServer())}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Server ID"
          value={serverId}
          onChange={(event) => setServerId(event.target.value)}
          placeholder="Paste a server ID"
          required
        />
        {error && <p className="mt-3 text-sm text-red-300">{error.data?.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => dispatch(closeJoinServer())}>
            Cancel
          </Button>
          <Button disabled={isLoading || !serverId.trim()}>Join</Button>
        </div>
      </form>
    </Modal>
  );
}
