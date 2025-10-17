import api from "../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFlashMessage from "./useFlashMessage";

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    // 🔹 Recupera o token direto, sem JSON.parse
    const token = localStorage.getItem("token");

    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setAuthenticated(true);
    }
  }, []);

  // 🔹 Registro de novo usuário
  async function register(user) {
    let msg = "Cadastrado com sucesso!";
    let msgType = "success";

    try {
      const { data } = await api.post("/users/register", user);
      await authUser(data);
    } catch (error) {
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      } else {
        msg = "Erro desconhecido ao tentar cadastrar.";
      }
      msgType = "error";
    }

    setFlashMessage(msg, msgType);
  }

  // 🔹 Autentica e configura o usuário logado
  async function authUser(data) {
    setAuthenticated(true);
    localStorage.setItem("token", data.token); // salva o token puro
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    navigate("/");
  }

  // 🔹 Login
  async function login(user) {
    let msg = "Login realizado com sucesso!";
    let msgType = "success";

    try {
      const { data } = await api.post("/users/login", user);
      await authUser(data);
    } catch (error) {
      msg = error.response?.data?.message || "Erro ao tentar fazer login.";
      msgType = "error";
    }

    setFlashMessage(msg, msgType);
  }

  // 🔹 Logout
  function logout() {
    const msg = "Usuário deslogado com sucesso!";
    const msgType = "success";

    setAuthenticated(false);
    localStorage.removeItem("token");
    delete api.defaults.headers.Authorization;
    navigate("/");

    setFlashMessage(msg, msgType);
  }

  return { authenticated, register, logout, login };
}
