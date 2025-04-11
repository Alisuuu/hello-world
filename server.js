const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HYPERBEAM_API_KEY = process.env.HYPERBEAM_API_KEY;

app.post("/create", async (req, res) => {
  try {
    const response = await axios.post(
      "https://engine.hyperbeam.com/v0/vm",
      {},
      {
        headers: {
          Authorization: `Bearer ${HYPERBEAM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao criar VM:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar VM" });
  }
});

app.post("/delete", async (req, res) => {
  const { session_id } = req.body;

  try {
    await axios.delete(`https://engine.hyperbeam.com/v0/vm/${session_id}`, {
      headers: {
        Authorization: `Bearer ${HYPERBEAM_API_KEY}`,
      },
    });

    res.json({ message: "Sessão encerrada com sucesso" });
  } catch (error) {
    console.error("Erro ao encerrar VM:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao encerrar VM" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
