import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../common/Button.jsx";
import { Input } from "../../common/Input.jsx";
import { Modal } from "../../common/Modal.jsx";
import { closeCreateChannel } from "../../../store/slices/uiSlice.js";
import { useCreateChannelMutation } from "../../../api/channel/channelApi.js";
import { setCurrentChannelId } from "../../../store/slices/workspaceSlice.js";

export function CreateChannelModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.createChannelOpen);
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const [name, setName] = useState("");
  const [createChannel, { isLoading, error }] = useCreateChannelMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await createChannel({ serverId: currentServerId, name }).unwrap();
    dispatch(setCurrentChannelId(result.channel._id));
    dispatch(closeCreateChannel());
    setName("");
  }

  return (
    <Modal title="Create Channel" isOpen={isOpen} onClose={() => dispatch(closeCreateChannel())}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Channel name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="general"
          required
        />
        {error && <p className="mt-3 text-sm text-red-300">{error.data?.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => dispatch(closeCreateChannel())}>
            Cancel
          </Button>
          <Button disabled={isLoading || !currentServerId}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
