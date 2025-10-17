import styles from "./Profile.module.css";
import formstyles from "../../form/Form.module.css";
import Input from "../../form/Input";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
import useFlashMessage from "../../../hooks/useFlashMessage";
import RoundedImage from "../../layout/RoundedImage";

function Profile() {
  const [user, setUser] = useState({});
  const [preview, setPreview] = useState();
  const [token] = useState(localStorage.getItem("token") || "");
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    if (token) {
      api
        .get("users/checkuser", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Sem JSON.parse
          },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Erro ao buscar usuário:", error);
        });
    }
  }, [token]); // ✅ Não esqueça das dependências do useEffect

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function handleFile(e) {
    setPreview(e.target.files[0]);
    setUser({ ...user, [e.target.name]: e.target.files[0] });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let msg = "sucess";

    const formData = new FormData();

    await Object.keys(user).forEach((key) => formData.append(key, user[key]));

    const data = await api
      .patch(`/users/edit/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data)
      .catch((err) => {
        msg = "error";
        return err.response.data;
      });

    setFlashMessage(data.message, msg);
  }

  return (
    <section>
      <div className={styles.profile_header}>
        <h1>Profile</h1>
        {(user.image || preview) && (
          <RoundedImage
            src={
              preview
                ? URL.createObjectURL(preview)
                : `${process.env.REACT_APP_API}/images/users/${user.image}`
            }
            alt={user.name}
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className={formstyles.form_container}>
        <Input
          text="Imagem"
          type="file"
          name="image"
          handleOnChange={handleFile}
        />
        <Input
          text="Email"
          type="email"
          name="email"
          placeholder="Digite o seu email"
          handleOnChange={handleChange}
          value={user.email || ""}
        />
        <Input
          text="Nome"
          type="text"
          name="name"
          placeholder="Digite o seu nome"
          handleOnChange={handleChange}
          value={user.name || ""}
        />
        <Input
          text="Telefone"
          type="text"
          name="phone"
          placeholder="Digite o seu telefone"
          handleOnChange={handleChange}
          value={user.phone || ""}
        />
        <Input
          text="Senha"
          type="password"
          name="password"
          placeholder="Digite a sua senha"
          handleOnChange={handleChange}
          value={user.password || ""}
        />
        <Input
          text="Confirmação de senha"
          type="password"
          name="confirmPassword"
          placeholder="Confirme a sua senha"
          handleOnChange={handleChange}
          value={user.confirmPassword || ""}
        />
        <input type="submit" value="Atualizar" className={formstyles.btn} />
      </form>
    </section>
  );
}

export default Profile;
