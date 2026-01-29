'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Manutencao {
    _id?: string;
    equipamento: string;
    dataRevisao: string;
    atuador1: string;
    atuador2: string;
    atuador3: string;
    sensorUmidade: string;
    sensorPressao: string;
    diferencialPressao: string;
    observacoes: string;
}

export default function Home() {
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [form, setForm] = useState<Manutencao>({
        equipamento: '',
        dataRevisao: '',
        atuador1: '',
        atuador2: '',
        atuador3: '',
        sensorUmidade: '',
        sensorPressao: '',
        diferencialPressao: '',
        observacoes: ''
    });

    useEffect(() => {
        fetch('/api/manutencao')
            .then(res => res.json())
            .then(data => setManutencoes(data));
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/manutencao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setForm({
                equipamento: '',
                dataRevisao: '',
                atuador1: '',
                atuador2: '',
                atuador3: '',
                sensorUmidade: '',
                sensorPressao: '',
                diferencialPressao: '',
                observacoes: ''
            });
            const newManutencao = await res.json();
            setManutencoes([...manutencoes, newManutencao]);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Registro de Manutenção</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="equipamento"
                    value={form.equipamento}
                    onChange={handleChange}
                    placeholder="Equipamento"
                    required
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    name="dataRevisao"
                    value={form.dataRevisao}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="atuador1"
                    value={form.atuador1}
                    onChange={handleChange}
                    placeholder="Atuador 1º Estágio"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="atuador2"
                    value={form.atuador2}
                    onChange={handleChange}
                    placeholder="Atuador 2º Estágio"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="atuador3"
                    value={form.atuador3}
                    onChange={handleChange}
                    placeholder="Atuador 3º Estágio"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="sensorUmidade"
                    value={form.sensorUmidade}
                    onChange={handleChange}
                    placeholder="Sensor de Umidade"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="sensorPressao"
                    value={form.sensorPressao}
                    onChange={handleChange}
                    placeholder="Sensor de Pressão"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="diferencialPressao"
                    value={form.diferencialPressao}
                    onChange={handleChange}
                    placeholder="Diferencial de Pressão"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    placeholder="Observações"
                    className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="w-full p-3 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Salvar
                </button>
            </form>

            <h2 className="text-2xl font-semibold mt-8">Registros</h2>
            <ul className="mt-4 space-y-2">
                {manutencoes.map((item) => (
                    <li key={item._id} className="p-4 border rounded-md shadow-sm">
                        {item.equipamento} - {new Date(item.dataRevisao).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}
