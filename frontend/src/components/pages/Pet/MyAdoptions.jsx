import styles from "./Dashboard.module.css";
import api from "../../../utils/api";
import { useState, useEffect } from "react";
import RoundedImage from "../../layout/RoundedImage";

function MyAdoptions() {
  const [pets, setPets] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    api
      .get("/pets/myadoptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPets(response.data.pets);
      });
  }, [token]);

  return (
    <section className={styles.dashboard_container}>
      <div className={styles.petlist_header}>
        <h1>Minhas adoções</h1>
      </div>
      <div className={styles.petlist_container}>
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
                  <div className={styles.contact_info}>
                    <p>
                      <span className="bold">Ligue para: </span>
                      {pet.user.phone}
                    </p>
                    <p>
                      <span className="bold">Fale com: </span> {pet.user.name}
                    </p>
                  </div>
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
                  <p className={styles.process_text}>Adoção em processo</p>
                ) : (
                  <p className={styles.adopted_text}>
                    Parabéns por concluir a adoção! ❤️
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.no_pets}>
            <p>Ainda não há adoções de pets</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyAdoptions;
