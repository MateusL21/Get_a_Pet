import Input from "../../form/Input";
import { Link } from "react-router-dom";
import styles from "../../form/Form.module.css";
import { useContext, useState } from "react";
import { Context } from "../../../context/UserContext";

function Register() {
  const [user, setUser] = useState({});
  const { register } = useContext(Context);

  function handleChange(e) {
    // Validação básica para telefone - apenas números
    if (e.target.name === "phone") {
      const phoneValue = e.target.value.replace(/\D/g, ""); // Remove não-números
      if (phoneValue.length <= 11) {
        setUser({ ...user, [e.target.name]: phoneValue });
      }
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validação básica do telefone antes de enviar
    if (user.phone && user.phone.length !== 11) {
      alert("Telefone deve ter 11 dígitos (DDD + número)");
      return;
    }

    register(user);
  }

  return (
    <section className={styles.form_container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <Input
          text="Nome"
          type="text"
          name="name"
          placeholder="Digite o seu nome"
          handleOnChange={handleChange}
        />
        <Input
          text="Telefone"
          type="tel"
          name="phone"
          placeholder="Digite o seu número"
          handleOnChange={handleChange}
          value={user.phone || ""}
          maxLength={11}
        />
        <Input
          text="E-mail"
          type="email"
          name="email"
          placeholder="Digite o seu email"
          handleOnChange={handleChange}
        />
        <Input
          text="Senha"
          type="password"
          name="password"
          placeholder="Digite a sua senha"
          handleOnChange={handleChange}
        />
        <Input
          text="Confirmar Senha"
          type="password"
          name="confirmPassword"
          placeholder="Confirme a sua senha"
          handleOnChange={handleChange}
        />
        <input type="submit" value="Cadastrar" />
      </form>
      <p>
        Já tem conta? <Link to="/login">Clique aqui</Link>
      </p>
    </section>
  );
}

export default Register;
