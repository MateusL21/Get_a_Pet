import axios from "axios";

// URL base dinâmica - funciona em ambos os ambientes
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default axios.create({
  baseURL: baseURL,
});
