import api from "../../../utils/api";

import { useState, useEffect } from "react";
import styles from "./AddPet.module.css";
import PetForm from "../../form/PetForm";
import useFlashMessage from "../../../hooks/useFlashMessage";
import { useParams } from "react-router-dom";

function EditPet() {
  const [pet, setPet] = useState({});
  const [token] = useState(localStorage.getItem("token") || "");
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    api
      .get(`/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPet(response.data.pet);
      })
      .catch((err) => {
        setFlashMessage("Erro ao carregar dados do pet.", "error");
      });
  }, [token, id, setFlashMessage]);

  async function updatePet(pet) {
    let msgType = "success";
    let message = "Pet atualizado com sucesso!";

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

      const response = await api.patch(`pets/${pet._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message = response.data.message || message;
      setFlashMessage(message, msgType);
    } catch (err) {
      msgType = "error";
      message =
        err.response?.data?.message ||
        "Erro ao atualizar o pet. Tente novamente.";

      if (err.response?.status === 413) {
        message = "As imagens são muito grandes. Tente imagens menores.";
      }

      setFlashMessage(message, msgType);
    }
  }

  return (
    <section>
      <div className={styles.addpet_header}>
        <h1>Editando o pet: {pet.name}</h1>
        <p>Depois da edição, os dados serão atualizados no sistema</p>
      </div>
      {pet.name && (
        <PetForm handleSubmit={updatePet} btnText="Atualizar" petData={pet} />
      )}
    </section>
  );
}

export default EditPet;
