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
        `http://localhost:5000/transacoes/${sqlPrefix}`,
        {
          params: numero ? { numero } : {},
        }
      );
      const data = response.data.transacoes;
      setTransacoes(data);
      setSelectedTransacoes(data.map((t) => t.SQL)); // por padrão seleciona todas
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
    selectedTransacoes.includes(t.SQL)
  );

  // Ordena as transações pela data (mais antiga à esquerda)
  const sortedTransacoes = [...filteredTransacoes].sort(
    (a, b) => new Date(a.Data_Transacao) - new Date(b.Data_Transacao)
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
              <label key={t.SQL} className="mr-4">
                <input
                  type="checkbox"
                  checked={selectedTransacoes.includes(t.SQL)}
                  onChange={() => toggleTransaction(t.SQL)}
                />
                {` ${t.SQL}`}
              </label>
            ))}
          </div>

          <BarChart
            width={800}
            height={300}
            data={sortedTransacoes}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="Data_Transacao"
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
              dataKey="Valor_Transacao"
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
                  <td className="border p-2">{t.SQL}</td>
                  <td className="border p-2">{t.Logradouro}</td>
                  <td className="border p-2">{t.Numero}</td>
                  <td className="border p-2">{t.Complemento}</td>
                  <td className="border p-2">
                    {t.Valor_Transacao?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="border p-2">
                    {new Date(t.Data_Transacao).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
