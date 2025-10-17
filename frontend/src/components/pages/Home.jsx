import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useState, useEffect } from "react";
import styles from "./Home.module.css";
import RoundedImage from "../layout/RoundedImage";

function Home() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    api.get("/pets").then((response) => {
      setPets(response.data.pets);
    });
  }, []);

  return (
    <section className={styles.home_container}>
      <div className={styles.hero_section}>
        <h1>Adote um Pet</h1>
        <p>Veja os detalhes de cada um e conheça o tutor deles</p>
      </div>

      <div className={styles.pets_grid}>
        {pets.length > 0 ? (
          pets.map((pet) => (
            <div key={pet._id} className={styles.pet_card}>
              <div className={styles.pet_image_container}>
                {pet.images && pet.images.length > 0 && (
                  <RoundedImage
                    src={`${process.env.REACT_APP_API}/images/pets/${pet.images[0]}`}
                    alt={pet.name}
                    width="80px"
                  />
                )}
              </div>

              <div className={styles.pet_header}>
                <div className={styles.pet_name_section}>
                  <h3>{pet.name}</h3>
                </div>
                <span
                  className={`${styles.pet_status} ${
                    pet.available
                      ? styles.status_available
                      : styles.status_adopted
                  }`}
                >
                  {pet.available ? "Disponível" : "Adotado"}
                </span>
              </div>

              <div className={styles.pet_details}>
                <div className={styles.detail_item}>
                  <span className={styles.pet_label}>Peso:</span>
                  <span className={styles.pet_weight}>{pet.weight}kg</span>
                </div>
                <div className={styles.detail_item}>
                  <span className={styles.pet_label}>Idade:</span>
                  <span className={styles.pet_age}>{pet.age} anos</span>
                </div>
              </div>

              {pet.available ? (
                <Link to={`pet/${pet._id}`} className={styles.details_link}>
                  Mais detalhes
                </Link>
              ) : (
                <p className={styles.status_adopted}>
                  ❤️ Pet já encontrou um lar!
                </p>
              )}
            </div>
          ))
        ) : (
          <div className={styles.no_pets}>
            <p>Nenhum pet cadastrado no momento</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
