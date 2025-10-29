import React, { useState } from "react";
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
// Usa variável de ambiente para a URL do backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://itbi-bke.onrender.com';

function App() {
  const [sqlPrefix, setSqlPrefix] = useState("");
  const [numero, setNumero] = useState("");
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!sqlPrefix) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/transacoes/${sqlPrefix}`,
        {
          params: numero ? { numero } : {},
        }
      );
      const data = response.data.transacoes || [];
      setTransacoes(data);
      console.log("✅ Resposta backend:", response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  };

  // Ordena as transações pela data (mais antiga à esquerda)
  const sortedTransacoes = [...transacoes].sort(
    (a, b) => new Date(a.data_transacao) - new Date(b.data_transacao)
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
      {transacoes.length > 0 ? (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Gráfico de Transações</h2>
          <BarChart
            width={800}
            height={300}
            data={sortedTransacoes}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" /> {/* Tag corrigida */}
            <XAxis
              dataKey="data_transacao"
              tickFormatter={(tick) =>
                new Date(tick).toLocaleDateString("pt-BR")
              }
            />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />
            <Legend />
            <Bar
              dataKey="valor_transacao"
              fill="#7e57c2"
              name="Valor da transação"
            />
          </BarChart>
          <h2 className="text-xl font-bold mt-6 mb-2">Lista de Transações</h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                <th className="border p-2">SQL</th>
                <th className="border p-2">Logradouro</th>
                <th className="border p-2">Número</th>
                <th className="border p-2">Complemento</th>
                <th className="border p-2">Valor</th>
                <th className="border p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransacoes.map((t, index) => (
                <tr key={index}>
                  <td className="border p-2">{t.sql}</td>
                  <td className="border p-2">{t.logradouro}</td>
                  <td className="border p-2">{t.numero}</td>
                  <td className="border p-2">{t.complemento || 'N/A'}</td>
                  <td className="border p-2">
                    {t.valor_transacao?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) || 'N/A'}
                  </td>
                  <td className="border p-2">
                    {t.data_transacao
                      ? new Date(t.data_transacao).toLocaleDateString("pt-BR")
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Nenhuma transação encontrada.</p>
      )}
    </div>
  );
}

export default App;