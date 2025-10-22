const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary usando CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  // Usa a URL completa se disponível
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  // Fallback para variáveis individuais (desenvolvimento)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djcdrg97c",
    api_key: process.env.CLOUDINARY_API_KEY || "319267286475627",
    api_secret:
      process.env.CLOUDINARY_API_SECRET || "VlT2x6KnuZMkpZsXW-CIZrPh-G0",
  });
}

// Configuração do storage no Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "getapet",
    format: async (req, file) => {
      // Determina o formato baseado no mimetype
      const format = file.mimetype.split("/")[1];
      return ["jpg", "jpeg", "png", "webp"].includes(format) ? format : "jpg";
    },
    public_id: (req, file) => {
      return `pet_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    },
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto" },
      { format: "auto" },
    ],
  },
});

const imageUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Log para debug (remova em produção)
console.log("Cloudinary configurado para:", cloudinary.config().cloud_name);

module.exports = { imageUpload };
