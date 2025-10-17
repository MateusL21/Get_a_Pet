import { useEffect, useState } from "react";
import styles from "./Message.module.css";
import bus from "../../utils/bus";

function Message() {
  // Você pode controlar o tipo via props ou estado interno
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState("");

  useEffect(() => {
    bus.addListener("flash", (msg, msgType) => {
      setMessage(msg);
      setType(msgType);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 3000); // Oculta a mensagem após 3 segundos
    });
  }, []);

  return (
    visible && (
      <div className={`${styles.message} ${styles[type]}`}>
        <p>{message}</p>{" "}
      </div>
    )
  );
}

export default Message;
