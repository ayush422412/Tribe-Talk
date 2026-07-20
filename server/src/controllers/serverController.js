import { serverService } from "../services/serverService.js";

export const serverController = {
  // Create a new server for the authenticated user
  async createServer(req, res) {
    const server = await serverService.createServer(req.user._id, req.body);
    res.status(201).json({ server });
  },
// Fetch all servers the authenticated user is a member of
  async getMyServers(req, res) {
    const servers = await serverService.getMyServers(req.user._id);
    res.json({ servers });
  },

  // Fetch details of a specific server by its ID
  async getServer(req, res) {
    const server = await serverService.getServer(req.user._id, req.params.serverId);
    res.json({ server });
  },

  // Update server details (like name or description)

  async updateServer(req, res) {
    const server = await serverService.updateServer(req.user._id, req.params.serverId, req.body);
    res.json({ server });
  },
  // Delete a server by its ID

  async deleteServer(req, res) {
    const result = await serverService.deleteServer(req.user._id, req.params.serverId);
    res.json(result);
  },
  // Join a server by its ID

  async joinServer(req, res) {
    const server = await serverService.joinServer(req.user._id, req.params.serverId);
    res.json({ server });
  },
  // Leave a server by its ID

  async leaveServer(req, res) {
    const server = await serverService.leaveServer(req.user._id, req.params.serverId);
    res.json({ server });
  },
  // Update a member's role in a server (e.g., promote to admin)

  async updateMemberRole(req, res) {
    const server = await serverService.updateMemberRole(
      req.user._id,
      req.params.serverId,
      req.params.userId,
      req.body
    );
    res.json({ server });
  },

  // Kick a member from a server
  async kickMember(req, res) {
    const server = await serverService.kickMember(req.user._id, req.params.serverId, req.params.userId);
    res.json({ server });
  }
};
