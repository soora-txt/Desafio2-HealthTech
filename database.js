const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const criarBanco = async () => {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  // Criando a tabela de pacientes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,                  -- Nome do paciente
      idade INTEGER,              -- Idade
      nivel_autonomia TEXT,       -- independente, parcial ou dependente
      condicoes TEXT,             -- Doenças ou limitações relevantes
      contato_familiar TEXT       -- Nome e telefone do familiar responsável
    )
  `);

  // Criando a tabela de atendimentos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS atendimentos(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,        -- Qual paciente foi atendido
      data TEXT,                  -- Data do atendimento (ex: 05/04/2026)
      observacoes_gerais TEXT,    -- Resumo geral do dia
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    )
  `);

  // Criando a tabela de registros (detalhes de cada atendimento)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS registros(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atendimento_id INTEGER,     -- A qual atendimento esse registro pertence
      categoria TEXT,             -- medicação, alimentação, humor, higiene...
      descricao TEXT,             -- O que aconteceu de fato
      hora TEXT,                  -- Hora do registro (ex: 14:30)
      FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
    )
  `);

  console.log("Banco de dados configurado: Tabelas prontas!");

  // Inserindo dados iniciais para teste
  const checagem = await db.get(`SELECT COUNT(*) AS total FROM pacientes`);
  if (checagem.total === 0) {
    await db.exec(`
      INSERT INTO pacientes(nome, idade, nivel_autonomia, condicoes, contato_familiar) VALUES
      ("Dona Maria", 78, "parcial", "Hipertensão e diabetes tipo 2", "Carlos (filho) - (38) 99999-1111"),
      ("Seu Antônio", 82, "dependente", "Alzheimer em estágio inicial", "Fernanda (filha) - (38) 99999-2222"),
      ("Dona Rosa", 70, "independente", "Artrose no joelho direito", "Paulo (neto) - (38) 99999-3333")
    `);
    console.log("Pacientes de exemplo inseridos!");

    await db.exec(`
      INSERT INTO atendimentos(paciente_id, data, observacoes_gerais) VALUES
      (1, "05/04/2026", "Dia tranquilo, pressão estável"),
      (2, "05/04/2026", "Paciente agitado pela manhã, acalmou após almoço"),
      (1, "04/04/2026", "Reclamou de dor de cabeça no final da tarde")
    `);
    console.log("Atendimentos de exemplo inseridos!");

    await db.exec(`
      INSERT INTO registros(atendimento_id, categoria, descricao, hora) VALUES
      (1, "medicação", "Administrado Losartana 50mg e Metformina", "08:00"),
      (1, "alimentação", "Café da manhã completo, comeu bem", "08:30"),
      (2, "humor", "Acordou confuso, não reconheceu a cuidadora de imediato", "07:30"),
      (2, "medicação", "Donepezila administrada conforme prescrição", "12:00"),
      (3, "medicação", "Dipirona administrada para dor de cabeça", "16:00")
    `);
    console.log("Registros de exemplo inseridos!");
  } else {
    console.log(`Banco já populado com ${checagem.total} pacientes`);
  }

  return db;
};

module.exports = { criarBanco };