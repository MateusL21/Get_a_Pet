import Input from "../../form/Input";
import { useState, useContext } from "react";
import styles from "../../form/Form.module.css";
import { Link } from "react-router-dom";

import { Context } from "../../../context/UserContext";

function Login() {
  const { login } = useContext(Context);
  const [user, setUser] = useState({});
  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    login(user);
  }
  return (
    <section className={styles.form_container}>
      <form onSubmit={handleSubmit}>
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
        <input type="submit" value="Entrar" />
        <p>
          Não tem conta? <Link to="/register">Clique aqui</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
