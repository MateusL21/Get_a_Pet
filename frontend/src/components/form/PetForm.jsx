import { useState } from "react";
import formStyles from "./Form.module.css";
import Input from "./Input";
import Select from "./Select";

function PetForm({ handleSubmit, petData, btnText }) {
  const [pet, setPet] = useState(petData || {});
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const colors = [
    "Branco",
    "Preto",
    "Cinza",
    "Caramelo",
    "Dourado",
    "Mesclado",
    "Tigrado",
    "Rajado",
    "Malhado",
    "Laranja",
    "Chocolate",
    "Bege",
    "Amarelo",
    "Azul",
    "Verde",
    "Vermelho",
  ];

  function handleChange(e) {
    setPet({ ...pet, [e.target.name]: e.target.value });
    // Remove erro do campo quando usuário começa a digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  }

  function handleFile(e) {
    const files = Array.from(e.target.files);
    const newErrors = {};

    // Validação de formatos de imagem
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      newErrors.images =
        "Apenas imagens nos formatos JPG, PNG, GIF e WebP são permitidas.";
    }

    // Validação de tamanho (máximo 5MB por imagem)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      newErrors.images = "Cada imagem deve ter no máximo 5MB.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Adiciona novas imagens às existentes (máximo 20 imagens)
      const existingImages = preview.map((item) => item.file);
      const allImages = [...existingImages, ...files].slice(0, 20);

      const newPreview = allImages.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      setPreview(newPreview);

      // Atualiza o pet com todas as imagens
      const dataTransfer = new DataTransfer();
      allImages.forEach((file) => dataTransfer.items.add(file));
      setPet({ ...pet, images: dataTransfer.files });
    } else {
      e.target.value = ""; // Limpa o input de arquivo
    }
  }

  function removeImage(index) {
    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);

    // Atualiza o pet com as imagens restantes
    if (newPreview.length > 0) {
      const dataTransfer = new DataTransfer();
      newPreview.forEach((item) => dataTransfer.items.add(item.file));
      setPet({ ...pet, images: dataTransfer.files });
    } else {
      setPet({ ...pet, images: null });
    }
  }

  function handleColor(e) {
    setPet({ ...pet, color: e.target.options[e.target.selectedIndex].text });
  }

  function validateForm() {
    const newErrors = {};

    // Validações básicas
    if (!pet.name || pet.name.trim() === "") {
      newErrors.name = "O nome do pet é obrigatório.";
    }

    if (!pet.age || pet.age.trim() === "") {
      newErrors.age = "A idade do pet é obrigatória.";
    }

    if (!pet.weight || pet.weight.trim() === "") {
      newErrors.weight = "O peso do pet é obrigatório.";
    }

    if (!pet.color || pet.color === "") {
      newErrors.color = "A cor do pet é obrigatória.";
    }

    // Validação de imagens apenas para novos pets
    if (!petData && (!pet.images || pet.images.length === 0)) {
      newErrors.images = "Pelo menos uma imagem do pet é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submit(e) {
    e.preventDefault();

    if (validateForm()) {
      console.log(pet);
      handleSubmit(pet);
    }
  }

  // Mostra apenas as primeiras 6 imagens na pré-visualização
  const displayPreview = preview.slice(0, 6);
  const remainingImages = preview.length - 6;

  return (
    <form onSubmit={submit} className={formStyles.form_container}>
      {/* Preview de imagens */}
      {preview.length > 0 && (
        <div className={formStyles.preview_section}>
          <h3>
            Pré-visualização das imagens ({preview.length} imagem
            {preview.length !== 1 ? "ns" : ""})
            {remainingImages > 0 && ` - +${remainingImages} mais`}
          </h3>
          <div className={formStyles.preview_pet_images}>
            {displayPreview.map((image, index) => (
              <div key={index} className={formStyles.image_item}>
                <div className={formStyles.image_container}>
                  <img src={image.url} alt={pet.name} />
                  <button
                    type="button"
                    className={formStyles.remove_button}
                    onClick={() => removeImage(index)}
                    title="Remover imagem"
                  >
                    ×
                  </button>
                </div>
                <span className={formStyles.image_name}>
                  {image.name.length > 12
                    ? `${image.name.substring(0, 10)}...`
                    : image.name}
                </span>
              </div>
            ))}
          </div>
          {remainingImages > 0 && (
            <p className={formStyles.more_images_text}>
              +{remainingImages} imagem{remainingImages !== 1 ? "ns" : ""}{" "}
              adicional{remainingImages !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      )}

      {/* Preview de imagens existentes (para edição) */}
      {!preview.length && pet.images && pet.images.length > 0 && (
        <div className={formStyles.preview_section}>
          <h3>Imagens atuais do pet</h3>
          <div className={formStyles.preview_pet_images}>
            {Array.from(pet.images)
              .slice(0, 6)
              .map((image, index) => (
                <div key={index} className={formStyles.image_item}>
                  <div className={formStyles.image_container}>
                    <img
                      src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                      alt={pet.name}
                    />
                  </div>
                </div>
              ))}
          </div>
          {pet.images.length > 6 && (
            <p className={formStyles.more_images_text}>
              +{pet.images.length - 6} imagem
              {pet.images.length - 6 !== 1 ? "ns" : ""} adicional
              {pet.images.length - 6 !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      )}

      {/* Mensagens de erro */}
      {errors.images && (
        <div className={formStyles.error_message}>{errors.images}</div>
      )}

      <Input
        text="Nome do pet"
        type="text"
        name="name"
        placeholder="Digite o nome do pet"
        handleOnChange={handleChange}
        value={pet.name || ""}
        error={errors.name}
      />
      {errors.name && (
        <span className={formStyles.field_error}>{errors.name}</span>
      )}

      <div className={formStyles.file_input_container}>
        <Input
          text="Imagens do pet"
          type="file"
          name="images"
          placeholder="Selecione as imagens do pet"
          handleOnChange={handleFile}
          multiple={true}
          error={errors.images}
        />
        <p className={formStyles.file_input_help}>
          {preview.length > 0
            ? `Adicione mais imagens (${preview.length}/20)`
            : "Selecione as imagens do pet (máximo 20)"}
        </p>
      </div>
      {errors.images && (
        <span className={formStyles.field_error}>{errors.images}</span>
      )}

      <Input
        text="Idade do pet"
        type="text"
        name="age"
        placeholder="Digite a idade do pet"
        handleOnChange={handleChange}
        value={pet.age || ""}
        error={errors.age}
      />
      {errors.age && (
        <span className={formStyles.field_error}>{errors.age}</span>
      )}

      <Input
        text="Peso do pet"
        type="text"
        name="weight"
        placeholder="Digite o peso do pet"
        handleOnChange={handleChange}
        value={pet.weight || ""}
        error={errors.weight}
      />
      {errors.weight && (
        <span className={formStyles.field_error}>{errors.weight}</span>
      )}

      <Select
        name="color"
        text="Selecione a cor"
        options={colors}
        handleChange={handleColor}
        value={pet.color || ""}
        error={errors.color}
      />
      {errors.color && (
        <span className={formStyles.field_error}>{errors.color}</span>
      )}

      <input type="submit" value={btnText} className={formStyles.submit_btn} />
    </form>
  );
}

export default PetForm;
