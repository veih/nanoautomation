import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("A variável MONGODB_URI não está definida no .env.local");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'manutencaoDB',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    console.log("🔥 Conectado ao MongoDB!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

