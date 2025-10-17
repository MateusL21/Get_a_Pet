// useFlashMessage.jsx
import bus from "../utils/bus";

export default function useFlashMessage() {
  function setFlashMessage(msg, type) {
    bus.emit("flash", msg, type); // Remove the object, pass as separate parameters
  }
  return { setFlashMessage };
}
