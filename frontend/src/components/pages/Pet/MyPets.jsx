import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RoundedImage from "../../layout/RoundedImage";
import useFlashMessage from "../../../hooks/useFlashMessage";
import api from "../../../utils/api";
import styles from "./Dashboard.module.css";

function MyPets() {
  const [pets, setPets] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    api
      .get("/pets/mypets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPets(response.data.pets);
      });
  }, [token]);

  async function removePet(id) {
    let msg = "success";

    const data = await api
      .delete(`/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const updatedPets = pets.filter((pet) => pet._id !== id);
        setPets(updatedPets);
        return response.data;
      })
      .catch((err) => {
        msg = "error";
        return err.response.data;
      });

    setFlashMessage(data.message, msg);
  }

  async function concludeAdoption(id) {
    let msg = "success";

    const data = await api
      .patch(`/pets/conclude/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        msg = "error";
        return err.response.data;
      });

    setFlashMessage(data.message, msg);
  }

  return (
    <section className={styles.dashboard_container}>
      <div className={styles.dashboard_header}>
        <h1>Meus Pets</h1>
        <Link to="/pet/add" className={styles.add_pet_btn}>
          Cadastrar Pet
        </Link>
      </div>

      <div className={styles.pets_list}>
        {pets.length > 0 ? (
          pets.map((pet) => (
            <div key={pet._id} className={styles.pet_card}>
              <div className={styles.pet_info}>
                <RoundedImage
                  src={`${process.env.REACT_APP_API}/images/pets/${pet.images[0]}`}
                  alt={pet.name}
                  width="60px"
                />
                <div className={styles.pet_details}>
                  <span className={styles.pet_name}>{pet.name}</span>
                  {pet.available && pet.adopter && (
                    <span
                      className={`${styles.pet_status} ${styles.status_pending}`}
                    >
                      Adoção em andamento
                    </span>
                  )}
                  {pet.available && !pet.adopter && (
                    <span
                      className={`${styles.pet_status} ${styles.status_available}`}
                    >
                      Disponível
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                {pet.available ? (
                  <>
                    {pet.adopter && (
                      <button
                        className={`${styles.action_btn} ${styles.complete_btn}`}
                        onClick={() => {
                          concludeAdoption(pet._id);
                        }}
                      >
                        Concluir adoção
                      </button>
                    )}
                    <Link
                      to={`/pet/edit/${pet._id}`}
                      className={`${styles.action_btn} ${styles.edit_btn}`}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        removePet(pet._id);
                      }}
                      className={`${styles.action_btn} ${styles.delete_btn}`}
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <p className={styles.adopted_text}>Pet já adotado ❤️</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.no_pets}>
            <p>Não há pets cadastrados</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyPets;
