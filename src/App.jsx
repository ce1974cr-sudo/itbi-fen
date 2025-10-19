import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function App() {
  const [sqlPrefix, setSqlPrefix] = useState("");
  const [numero, setNumero] = useState("");
  const [transacoes, setTransacoes] = useState([]);
  const [selectedTransacoes, setSelectedTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!sqlPrefix) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://itbi-bke.onrender.com/transacoes/${sqlPrefix}`,
        {
          params: numero ? { numero } : {},
        }
      );
      const data = response.data.transacoes || []; // Garante array vazio se undefined
      setTransacoes(data);
      setSelectedTransacoes(data.map((t) => t.sql)); // Usa chave 'sql' (lowercase)
      console.log("✅ Resposta backend:", response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      setTransacoes([]);
      setSelectedTransacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTransaction = (sql) => {
    if (selectedTransacoes.includes(sql)) {
      setSelectedTransacoes(selectedTransacoes.filter((s) => s !== sql));
    } else {
      setSelectedTransacoes([...selectedTransacoes, sql]);
    }
  };

  const filteredTransacoes = transacoes.filter((t) =>
    selectedTransacoes.includes(t.sql) // Usa chave 'sql'
  );

  // Ordena as transações pela data (mais antiga à esquerda)
  const sortedTransacoes = [...filteredTransacoes].sort(
    (a, b) => new Date(a.data_transacao) - new Date(b.data_transacao) // Usa 'data_transacao'
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transações ITBI - PMSP</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Prefixo SQL (6 dígitos)"
          value={sqlPrefix}
          onChange={(e) => setSqlPrefix(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Número do imóvel (opcional)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-purple-500 text-white p-2 rounded"
        >
          Buscar
        </button>
      </div>

      {loading && <p>Carregando transações...</p>}

      {transacoes.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Gráfico de Transações</h2>

          <div className="mb-4">
            {transacoes.map((t) => (
              <label key={t.sql} className="mr-4">
                <input
                  type="checkbox"
                  checked={selectedTransacoes.includes(t.sql)} // Usa 'sql'
                  onChange={() => toggleTransaction(t.sql)} // Usa 'sql'
                />
                {` ${t.sql}`}
              </label>
            ))}
          </div>

          <BarChart
            width={800}
            height={300}
            data={sortedTransacoes}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3"