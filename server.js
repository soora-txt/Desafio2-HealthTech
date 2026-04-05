const express = require("express");
const { criarBanco } = require("./database");
const app = express();
app.use(express.json());

// Rota Raiz
app.get("/", (req, res) => {
  res.send(`
    <body>
      <h1>CuidarBem</h1>
      <h2>Sistema de Acompanhamento de Pacientes</h2>
      <p>Endpoints disponíveis:</p>
      <ul>
        <li>GET /pacientes</li>
        <li>GET /pacientes/:id</li>
        <li>POST /pacientes</li>
        <li>GET /pacientes/:id/atendimentos</li>
        <li>POST /atendimentos</li>
        <li>GET /atendimentos/:id/registros</li>
        <li>POST /registros</li>
      </ul>
    </body>
  `);
});

// -------- PACIENTES --------

// Listar todos os pacientes
app.get("/pacientes", async (req, res) => {
  const db = await criarBanco();
  const lista = await db.all(`SELECT * FROM pacientes`);
  res.json(lista);
});

// Buscar paciente específico
app.get("/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  const db = await criarBanco();
  const paciente = await db.get(`SELECT * FROM pacientes WHERE id = ?`, [id]);
  res.json(paciente);
});

// Cadastrar novo paciente
app.post("/pacientes", async (req, res) => {
  const { nome, idade, nivel_autonomia, condicoes, contato_familiar } = req.body;
  const db = await criarBanco();
  await db.run(
    `INSERT INTO pacientes(nome, idade, nivel_autonomia, condicoes, contato_familiar) VALUES (?, ?, ?, ?, ?)`,
    [nome, idade, nivel_autonomia, condicoes, contato_familiar]
  );
  res.send(`Paciente ${nome} cadastrado com sucesso!`);
});

// -------- ATENDIMENTOS --------

// Listar atendimentos de um paciente (histórico)
app.get("/pacientes/:id/atendimentos", async (req, res) => {
  const { id } = req.params;
  const db = await criarBanco();
  const atendimentos = await db.all(
    `SELECT * FROM atendimentos WHERE paciente_id = ? ORDER BY data DESC`,
    [id]
  );
  res.json(atendimentos);
});

// Registrar novo atendimento
app.post("/atendimentos", async (req, res) => {
  const { paciente_id, data, observacoes_gerais } = req.body;
  const db = await criarBanco();
  await db.run(
    `INSERT INTO atendimentos(paciente_id, data, observacoes_gerais) VALUES (?, ?, ?)`,
    [paciente_id, data, observacoes_gerais]
  );
  res.send(`Atendimento do dia ${data} registrado com sucesso!`);
});

// -------- REGISTROS --------

// Listar registros de um atendimento
app.get("/atendimentos/:id/registros", async (req, res) => {
  const { id } = req.params;
  const db = await criarBanco();
  const registros = await db.all(
    `SELECT * FROM registros WHERE atendimento_id = ? ORDER BY hora`,
    [id]
  );
  res.json(registros);
});

// Adicionar registro a um atendimento
app.post("/registros", async (req, res) => {
  const { atendimento_id, categoria, descricao, hora } = req.body;
  const db = await criarBanco();
  await db.run(
    `INSERT INTO registros(atendimento_id, categoria, descricao, hora) VALUES (?, ?, ?, ?)`,
    [atendimento_id, categoria, descricao, hora]
  );
  res.send(`Registro de ${categoria} adicionado às ${hora}!`);
});

// -------- SERVIDOR --------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});