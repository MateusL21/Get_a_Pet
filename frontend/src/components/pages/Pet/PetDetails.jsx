import api from "../../../utils/api";
import { useState, useEffect } from "react";
import styles from "./PetDetails.module.css";
import useFlashMessage from "../../../hooks/useFlashMessage";
import { useParams, Link } from "react-router-dom";

function PetDetails() {
  const [pet, setPet] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    api.get(`/pets/${id}`).then((response) => {
      setPet(response.data.pet);
    });
  }, [id]);

  async function schedule() {
    let msgType = "success";

    const data = await api
      .patch(`/pets/schedule/${pet._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        msgType = "error";
        return err.response.data;
      });

    setFlashMessage(data.message, msgType);
  }

  return (
    <>
      {pet.name && (
        <section className={styles.pet_details_container}>
          <div className={styles.pet_header}>
            <h1>Conheça {pet.name}</h1>
            <p>Se deseja conhecer o pet, agende já uma visita!</p>
            <span
              className={`${styles.pet_status} ${
                pet.available ? styles.status_available : styles.status_adopted
              }`}
            >
              {pet.available ? "🟢 Disponível para adoção" : "🔴 Já adotado"}
            </span>
          </div>

          <div className={styles.pet_content}>
            <div className={styles.pet_images}>
              {pet.images && pet.images.length > 0 && (
                <>
                  <img
                    src={`${process.env.REACT_APP_API}/images/pets/${pet.images[selectedImage]}`}
                    alt={pet.name}
                    className={styles.main_image}
                  />
                  <div className={styles.thumbnail_grid}>
                    {pet.images.map((image, index) => (
                      <img
                        src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                        alt={pet.name}
                        key={index}
                        className={`${styles.thumbnail} ${
                          index === selectedImage ? styles.active : ""
                        }`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={styles.pet_info}>
              <div className={styles.pet_info_section}>
                <h2>Informações do Pet</h2>
                <div className={styles.info_grid}>
                  <div className={styles.info_item}>
                    <span className={styles.info_label}>Nome</span>
                    <span className={styles.info_value}>{pet.name}</span>
                  </div>
                  <div className={styles.info_item}>
                    <span className={styles.info_label}>Idade</span>
                    <span className={styles.info_value}>{pet.age} anos</span>
                  </div>
                  <div className={styles.info_item}>
                    <span className={styles.info_label}>Peso</span>
                    <span className={styles.info_value}>{pet.weight}kg</span>
                  </div>
                  <div className={styles.info_item}>
                    <span className={styles.info_label}>Cor</span>
                    <div className={styles.color_display}>
                      <span className={styles.info_value}>{pet.color}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.adoption_section}>
                {pet.available ? (
                  token ? (
                    <>
                      <h2>Interessado em adotar {pet.name}?</h2>
                      <p>Agende uma visita para conhecê-lo melhor!</p>
                      <button onClick={schedule} className={styles.adopt_btn}>
                        Agendar Visita
                      </button>
                    </>
                  ) : (
                    <div className={styles.register_prompt}>
                      <p>
                        Você precisa <Link to="/register">criar uma conta</Link>{" "}
                        para agendar uma visita
                      </p>
                    </div>
                  )
                ) : (
                  <div className={styles.register_prompt}>
                    <p>🎉 {pet.name} já encontrou um lar amoroso!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default PetDetails;
