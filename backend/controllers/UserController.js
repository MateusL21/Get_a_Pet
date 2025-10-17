// these lines below just import the modules we need
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helpers imports
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

// export the class with the methods for user controller
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, phone, confirmPassword } = req.body;

    // validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    }

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatório!" });
      return;
    }

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: "A confirmação da senha é obrigatória" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({
        message: "A senha e a confirmação da senha precisam ser iguais!",
      });
      return;
    }

    // check if user exists by checking if the email is already in the database
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res.status(422).json({ message: "Por favor, utilize outro email!" });
      return;
    }

    // create a password hash using bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user, so when the user is created, we can generate a token and send it to the user
    // we don't send the password hash to the user, only the token
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
      res.status(201).json({ message: "Usuário criado com sucesso!", newUser });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // login method to authenticate user and generate a token
  static async login(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" });
      return;
    }
    // check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      res
        .status(422)
        .json({ message: "Não há usuário cadastrado com esse email" });
      return;
    }

    // check if password matches
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({ message: "Senha inválida!" });
      return;
    }
    await createUserToken(user, req, res);
  }

  // get current logged in user
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
      res.status(422).json({ message: "Usuário não encontrado!" });
      return;
    }
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    try {
      const id = req.params.id;

      // First, check if req.body exists
      if (!req.body) {
        return res.status(400).json({
          message: "Dados inválidos! O corpo da requisição está vazio.",
        });
      }

      const { name, email, phone, password, confirmPassword } = req.body;

      // Check if user is authenticated and get token
      const token = getToken(req);
      if (!token) {
        return res
          .status(401)
          .json({ message: "Acesso negado! Token não fornecido." });
      }

      // Get user by token
      const user = await getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      // Check if user is authorized to edit this profile
      if (user._id.toString() !== id) {
        return res.status(403).json({
          message: "Acesso negado! Você não pode editar este perfil.",
        });
      }

      // Handle image upload - ADDED THIS PART
      if (req.file) {
        user.image = req.file.filename;
      }

      // Validations
      if (!name) {
        return res.status(422).json({ message: "O nome é obrigatório!" });
      }

      if (!email) {
        return res.status(422).json({ message: "O email é obrigatório!" });
      }

      if (!phone) {
        return res.status(422).json({ message: "O telefone é obrigatório!" });
      }

      // Check if email is already taken by another user
      const userExists = await User.findOne({ email: email });
      if (user.email !== email && userExists) {
        return res
          .status(422)
          .json({ message: "Por favor, utilize outro email!" });
      }

      // Update user fields
      user.name = name;
      user.email = email;
      user.phone = phone;

      // Only update password if provided
      if (password) {
        if (!confirmPassword) {
          return res
            .status(422)
            .json({ message: "A confirmação da senha é obrigatória!" });
        }

        if (password !== confirmPassword) {
          return res
            .status(422)
            .json({ message: "A senha e a confirmação precisam ser iguais!" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        user.password = passwordHash;
      }

      // Save the updated user
      await user.save();

      // Return success response
      return res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          _id: user._id,
        },
      });
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      return res
        .status(500)
        .json({ message: "Erro interno do servidor ao editar usuário." });
    }
  }
};
