import styles from "./AddPet.module.css";
import api from "../../../utils/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFlashMessage from "../../../hooks/useFlashMessage";
import PetForm from "../../form/PetForm";

function AddPet() {
  const [token] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();
  const { setFlashMessage } = useFlashMessage();

  async function registerPet(pet) {
    let msgType = "success";
    let message = "Pet cadastrado com sucesso!";

    try {
      const formData = new FormData();
      await Object.keys(pet).forEach((key) => {
        if (key === "images") {
          for (let i = 0; i < pet[key].length; i++) {
            formData.append("images", pet[key][i]);
          }
        } else {
          formData.append(key, pet[key]);
        }
      });

      const response = await api.post("pets/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message = response.data.message || message;
      setFlashMessage(message, msgType);
      navigate("/pet/mypets");
    } catch (err) {
      msgType = "error";
      message =
        err.response?.data?.message ||
        "Erro ao cadastrar o pet. Tente novamente.";

      // Mensagens mais específicas para erros comuns
      if (err.response?.status === 413) {
        message = "As imagens são muito grandes. Tente imagens menores.";
      } else if (err.response?.status === 400) {
        message = "Dados inválidos. Verifique as informações do pet.";
      }

      setFlashMessage(message, msgType);
    }
  }

  return (
    <section className={styles.addpet_header}>
      <div>
        <h1>Cadastre um pet</h1>
        <p>Ele ficará disponível para adoção</p>
      </div>
      <PetForm handleSubmit={registerPet} btnText="Cadastrar pet" />
    </section>
  );
}

export default AddPet;
