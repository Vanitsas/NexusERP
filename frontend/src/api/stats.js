import api from "./client";

export const getStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};