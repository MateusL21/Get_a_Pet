import styles from "./Select.module.css";

function Select({ text, name, options, handleChange, value, error }) {
  return (
    <div className={styles.form_control}>
      <label htmlFor={name}>{text}:</label>
      <select
        name={name}
        id={name}
        onChange={handleChange}
        value={value || ""}
        className={error ? styles.error : ""}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
