import { NextResponse } from 'next/server';
import mongoose, { Schema, models } from 'mongoose';
import { connectDB } from '@/app/lib/mongodb';

await connectDB(); // Garante a conexão antes de executar

const ManutencaoSchema = new Schema({
    equipamento: { type: String, required: true },
    dataRevisao: { type: Date, required: true },
    observacoes: String,
}, { timestamps: true });

const Manutencao = models.Manutencao || mongoose.model('Manutencao', ManutencaoSchema);

export async function GET() {
    try {
        const manutencoes = await Manutencao.find();
        return NextResponse.json(manutencoes);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const novaManutencao = new Manutencao(body);
        await novaManutencao.save();
        return NextResponse.json(novaManutencao, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
