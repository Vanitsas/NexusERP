import api from "./client";

export const login = async (username, password) => {
  const res = await api.post("/login", {
    username,
    password,
  });

  const token = res.data.access_token;

  localStorage.setItem("token", token);

  return res.data;
};