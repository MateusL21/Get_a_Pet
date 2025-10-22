const Pet = require("../models/Pet");
const { uploadToSupabase } = require("../helpers/image-upload");

// helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  static async create(req, res) {
    console.log("🚀 INICIANDO CRIAÇÃO DE PET");

    try {
      const { name, age, weight, color } = req.body;
      const available = true;

      console.log("📝 Dados recebidos:", { name, age, weight, color });

      // validations
      if (!name) {
        console.log("❌ Validação falhou: nome obrigatório");
        return res.status(422).json({ message: "O nome é obrigatório!" });
      }

      if (!age) {
        console.log("❌ Validação falhou: idade obrigatória");
        return res.status(422).json({ message: "A idade é obrigatória!" });
      }

      if (!weight) {
        console.log("❌ Validação falhou: peso obrigatório");
        return res.status(422).json({ message: "O peso é obrigatório!" });
      }

      if (!color) {
        console.log("❌ Validação falhou: cor obrigatória");
        return res.status(422).json({ message: "A cor é obrigatória!" });
      }

      // get pet owner
      console.log("🔐 Obtendo token do usuário...");
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        console.log("❌ Usuário não encontrado");
        return res.status(401).json({ message: "Usuário não autenticado!" });
      }

      console.log("✅ Usuário encontrado:", user._id);

      // create a pet
      const pet = new Pet({
        name,
        age,
        weight,
        color,
        available,
        images: [],
        user: {
          _id: user._id,
          name: user.name,
          image: user.image,
          phone: user.phone,
        },
      });

      console.log("🐕 Pet object criado");

      // Upload de imagens para Supabase
      if (req.files && req.files.length > 0) {
        console.log(`📤 Encontradas ${req.files.length} imagens para upload`);

        for (let i = 0; i < req.files.length; i++) {
          try {
            console.log(`🔄 Uploading imagem ${i + 1}...`);
            const imageUrl = await uploadToSupabase(req.files[i], "pets");
            pet.images.push(imageUrl);
            console.log(`✅ Imagem ${i + 1} uploadada:`, imageUrl);
          } catch (uploadError) {
            console.error(`❌ Erro no upload da imagem ${i + 1}:`, uploadError);
            // Continua sem essa imagem específica
          }
        }
      } else {
        console.log("ℹ️ Nenhuma imagem fornecida para upload");
      }

      console.log("🖼️ Array final de imagens:", pet.images);
      console.log("💾 Salvando pet no banco de dados...");

      const newPet = await pet.save();

      console.log("✅ Pet salvo com sucesso! ID:", newPet._id);
      console.log("📨 Enviando resposta para cliente...");

      res.status(201).json({
        message: "Pet cadastrado com sucesso!",
        newPet,
      });

      console.log("🎉 Processo de criação finalizado com sucesso!");
    } catch (error) {
      console.error("💥 ERRO NA CRIAÇÃO DO PET:");
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);

      // Log detalhado para erros de validação do Mongoose
      if (error.name === "ValidationError") {
        console.error("Erros de validação:", error.errors);
      }

      res.status(500).json({
        message: "Erro interno do servidor",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }

  static async getAll(req, res) {
    try {
      console.log("📋 Obtendo todos os pets...");
      const pets = await Pet.find().sort("-createdAt");
      console.log(`✅ Encontrados ${pets.length} pets`);

      res.status(200).json({
        pets: pets,
      });
    } catch (error) {
      console.error("❌ Erro ao obter pets:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllUserPets(req, res) {
    try {
      // get user from token
      const token = getToken(req);
      const user = await getUserByToken(token);

      console.log(`📋 Obtendo pets do usuário ${user._id}...`);
      const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
      console.log(`✅ Encontrados ${pets.length} pets do usuário`);

      res.status(200).json({
        pets,
      });
    } catch (error) {
      console.error("❌ Erro ao obter pets do usuário:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllUserAdoptions(req, res) {
    try {
      // get user from token
      const token = getToken(req);
      const user = await getUserByToken(token);

      console.log(`📋 Obtendo adoções do usuário ${user._id}...`);
      const pets = await Pet.find({ "adopter._id": user._id }).sort(
        "-createdAt"
      );
      console.log(`✅ Encontrados ${pets.length} pets adotados`);

      res.status(200).json({
        pets,
      });
    } catch (error) {
      console.error("❌ Erro ao obter adoções:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getPetById(req, res) {
    try {
      const id = req.params.id;
      console.log(`🔍 Buscando pet por ID: ${id}`);

      // check if id is valid
      if (!ObjectId.isValid(id)) {
        console.log("❌ ID inválido:", id);
        return res.status(422).json({ message: "ID inválido!" });
      }

      // check if pet exists
      const pet = await Pet.findOne({ _id: id });

      if (!pet) {
        console.log("❌ Pet não encontrado:", id);
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      console.log("✅ Pet encontrado:", pet.name);
      res.status(200).json({
        pet: pet,
      });
    } catch (error) {
      console.error("❌ Erro ao buscar pet:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async removePetById(req, res) {
    try {
      const id = req.params.id;
      console.log(`🗑️ Removendo pet: ${id}`);

      // check if id is valid
      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: "ID inválido!" });
      }

      // check if pet exists
      const pet = await Pet.findOne({ _id: id });

      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      // check if logged in user registered the pet
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() !== user._id.toString()) {
        return res.status(422).json({
          message:
            "Houve um problema em processar a sua solicitação, tente novamente mais tarde!",
        });
      }

      await Pet.findByIdAndRemove(id);
      console.log("✅ Pet removido com sucesso:", id);

      res.status(200).json({ message: "Pet removido com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao remover pet:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updatePet(req, res) {
    try {
      const id = req.params.id;
      console.log(`🔄 Atualizando pet: ${id}`);

      const { name, age, weight, color, available } = req.body;
      const updatedData = {};

      // check if pet exists
      const pet = await Pet.findOne({ _id: id });

      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      // check if logged in user registered the pet
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() !== user._id.toString()) {
        return res.status(422).json({
          message:
            "Houve um problema em processar a sua solicitação, tente novamente mais tarde!",
        });
      }

      // validations
      if (!name) {
        return res.status(422).json({ message: "O nome é obrigatório!" });
      } else {
        updatedData.name = name;
      }

      if (!age) {
        return res.status(422).json({ message: "A idade é obrigatória!" });
      } else {
        updatedData.age = age;
      }

      if (!weight) {
        return res.status(422).json({ message: "O peso é obrigatório!" });
      } else {
        updatedData.weight = weight;
      }

      if (!color) {
        return res.status(422).json({ message: "A cor é obrigatória!" });
      } else {
        updatedData.color = color;
      }

      if (!available) {
        return res.status(422).json({ message: "O status é obrigatório!" });
      } else {
        updatedData.available = available;
      }

      // Upload de novas imagens para Supabase
      if (req.files && req.files.length > 0) {
        updatedData.images = [...pet.images]; // Mantém imagens existentes

        for (let i = 0; i < req.files.length; i++) {
          try {
            const imageUrl = await uploadToSupabase(req.files[i], "pets");
            updatedData.images.push(imageUrl);
            console.log(`✅ Nova imagem adicionada:`, imageUrl);
          } catch (uploadError) {
            console.error("Erro no upload da imagem:", uploadError);
          }
        }
      }

      await Pet.findByIdAndUpdate(id, updatedData);
      console.log("✅ Pet atualizado com sucesso:", id);

      res.status(200).json({ message: "Pet atualizado com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao atualizar pet:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async schedule(req, res) {
    try {
      const id = req.params.id;
      console.log(`📅 Agendando visita para pet: ${id}`);

      // check if pet exists
      const pet = await Pet.findOne({ _id: id });

      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      // check if user registered the pet
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.equals(user._id)) {
        return res.status(422).json({
          message: "Você não pode agendar uma visita com seu próprio Pet!",
        });
      }

      // check if user has already adopted this pet
      if (pet.adopter) {
        if (pet.adopter._id.equals(user._id)) {
          return res.status(422).json({
            message: "Você já agendou uma visita para este Pet!",
          });
        }
      }

      // add user to pet
      pet.adopter = {
        _id: user._id,
        name: user.name,
        image: user.image,
      };

      await Pet.findByIdAndUpdate(id, pet);
      console.log("✅ Visita agendada com sucesso para pet:", id);

      res.status(200).json({
        message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`,
      });
    } catch (error) {
      console.error("❌ Erro ao agendar visita:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async concludeAdoption(req, res) {
    try {
      const id = req.params.id;
      console.log(`🏁 Concluindo adoção do pet: ${id}`);

      // check if pet exists
      const pet = await Pet.findOne({ _id: id });

      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado!" });
      }

      // check if logged in user registered the pet
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() !== user._id.toString()) {
        return res.status(422).json({
          message:
            "Houve um problema em processar a sua solicitação, tente novamente mais tarde!",
        });
      }

      pet.available = false;

      await Pet.findByIdAndUpdate(id, pet);
      console.log("✅ Adoção concluída com sucesso para pet:", id);

      res.status(200).json({
        message: "Parabéns! O ciclo de adoção foi finalizado com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro ao concluir adoção:", error);
      res.status(500).json({ message: error.message });
    }
  }
};
