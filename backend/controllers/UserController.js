const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { imageUpload, uploadToSupabase } = require("../helpers/image-upload");

// helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body;

    // validations
    if (!name) {
      return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    if (!email) {
      return res.status(422).json({ msg: "O e-mail é obrigatório!" });
    }

    if (!phone) {
      return res.status(422).json({ msg: "O telefone é obrigatório!" });
    }

    if (!password) {
      return res.status(422).json({ msg: "A senha é obrigatório!" });
    }

    if (!confirmpassword) {
      return res
        .status(422)
        .json({ msg: "A confirmação de senha é obrigatório!" });
    }

    if (password !== confirmpassword) {
      return res
        .status(422)
        .json({ msg: "A senha e a confirmação de senha precisam ser iguais!" });
    }

    // check if user exists
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      // Upload de imagem para Supabase se existir
      if (req.file) {
        try {
          const imageUrl = await uploadToSupabase(req.file, "users");
          user.image = imageUrl;
        } catch (uploadError) {
          console.error("Erro no upload de imagem:", uploadError);
          // Continua sem imagem se houver erro no upload
        }
      }

      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ msg: "O e-mail é obrigatório!" });
    }

    if (!password) {
      return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    // check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(422)
        .json({ msg: "Não há usuário cadastrado com este e-mail!" });
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha inválida" });
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(422).json({ msg: "Usuário não encontrado!" });
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmpassword } = req.body;

    if (req.file) {
      try {
        const imageUrl = await uploadToSupabase(req.file, "users");
        user.image = imageUrl;
      } catch (uploadError) {
        console.error("Erro no upload de imagem:", uploadError);
        return res.status(500).json({ msg: "Erro ao fazer upload da imagem" });
      }
    }

    // validations
    if (!name) {
      return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    user.name = name;

    if (!email) {
      return res.status(422).json({ msg: "O e-mail é obrigatório!" });
    }

    // check if email has already taken
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    user.email = email;

    if (!phone) {
      return res.status(422).json({ msg: "O telefone é obrigatório!" });
    }

    user.phone = phone;

    if (password != confirmpassword) {
      return res.status(422).json({ msg: "As senhas não conferem." });
    } else if (password === confirmpassword && password != null) {
      // creating password
      const salt = await bcrypt.genSalt(12);
      const reqPassword = req.body.password;

      const passwordHash = await bcrypt.hash(reqPassword, salt);

      user.password = passwordHash;
    }

    try {
      // returns updated data
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      res.json({
        msg: "Usuário atualizado com sucesso!",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ msg: error });
    }
  }
};
