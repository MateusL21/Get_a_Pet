const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("🔧 Supabase Config:", {
  url: supabaseUrl ? "PRESENT" : "MISSING",
  key: supabaseKey ? "PRESENT" : "MISSING",
});

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Multer
const storage = multer.memoryStorage();
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
    fileSize: 5 * 1024 * 1024,
  },
});

// Função para upload no Supabase Storage
const uploadToSupabase = async (file, folder = "pets") => {
  try {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExtension}`;

    console.log("📤 Uploading file:", {
      fileName: fileName,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload error:", {
        message: error.message,
        details: error,
      });
      throw error;
    }

    // Obtém URL pública
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    console.log("✅ Upload successful:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("❌ Error in uploadToSupabase:", error);
    throw error;
  }
};

module.exports = { imageUpload, uploadToSupabase };
