// IMPORTAÇÕES 
const express = require('express');
const path = require('path');
const util = require('util');
const multer = require('multer');
const connection = require('./models/db');

const app = express();
const query = util.promisify(connection.query).bind(connection);

// CONFIGURAÇÕES
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

//ROTAS DE PÁGINAS HTML 
const htmlDir = path.join(__dirname, 'src/html');

const htmlRoutes = {
  '/': 'index.html',
  '/dashboard': 'dashboard.html',
  '/emprestimos': 'emprestimos.html',
  '/equipamentosPage': 'equipamentos.html',
  '/adicionarEquipamentoPage': 'adicionarEquipamento.html',
  '/editarEquipamentoPage': 'editarEquipamento.html',
  '/devolucoes': 'devolucoes.html',
  '/reservas': 'reservas.html',
  '/relatoriosPage': 'relatorios.html'
};

for (const [route, file] of Object.entries(htmlRoutes)) {
  app.get(route, (req, res) => res.sendFile(path.join(htmlDir, file)));
}

//DASHBOARD RESUMO 
app.get('/dashboard/resumo', async (req, res) => {
  try {
    const [equipamentos] = await query('SELECT COUNT(*) AS total FROM equipamentos');

    const [emprestimos] = await query(`
      SELECT COUNT(*) AS total
      FROM emprestimos
      WHERE status IS NULL OR status NOT IN ('Devolvido', 'Concluído', 'Finalizado')
    `);

    const [atrasos] = await query(`
      SELECT COUNT(*) AS total
      FROM emprestimos
      WHERE (status IS NULL OR status != 'Devolvido')
      AND data_prevista_devolucao < CURDATE()
    `);

    res.json({
      equipamentos: equipamentos.total || 0,
      emprestimos: emprestimos.total || 0,
      atrasos: atrasos.total || 0
    });
  } catch (err) {
    console.error('Erro ao gerar resumo do dashboard:', err);
    res.status(500).json({ error: 'Erro ao gerar resumo do dashboard.' });
  }
});

//  EQUIPAMENTOS
// Listar todos
app.get('/equipamentos', async (req, res) => {
  try {
    const equipamentos = await query(`
      SELECT e.*, c.nome_categoria
      FROM equipamentos e
      LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
    `);
    res.json(equipamentos);
  } catch (err) {
    console.error('Erro ao listar equipamentos:', err);
    res.status(500).json({ error: 'Erro ao listar equipamentos' });
  }
});

// Listar disponíveis
app.get('/equipamentos/disponiveis', async (req, res) => {
  try {
    const equipamentos = await query(`
      SELECT id_equipamento, nome
      FROM equipamentos
      WHERE disponibilidade = 'Disponível'
    `);
    res.json(equipamentos);
  } catch (err) {
    console.error('Erro ao listar equipamentos disponíveis:', err);
    res.status(500).json({ error: 'Erro ao listar equipamentos disponíveis' });
  }
});

// Buscar por ID
app.get('/equipamentos/:id', async (req, res) => {
  try {
    const [equipamento] = await query(`
      SELECT e.*, c.nome_categoria
      FROM equipamentos e
      LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
      WHERE e.id_equipamento = ?
    `, [req.params.id]);

    if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json(equipamento);
  } catch (err) {
    console.error('Erro ao buscar equipamento:', err);
    res.status(500).json({ error: 'Erro ao buscar equipamento' });
  }
});

// Adicionar
app.post('/equipamentos', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, codigo, valor_agregado, id_categoria } = req.body;
    if (!nome || !codigo || !valor_agregado)
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

    const { mimetype = null, buffer = null } = req.file || {};
    await query(`
      INSERT INTO equipamentos (nome, codigo, valor_agregado, id_categoria, tipo_mime, dados)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, codigo, valor_agregado, id_categoria || null, mimetype, buffer]);

    res.json({ message: 'Equipamento adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar equipamento:', err);
    res.status(500).json({ error: 'Erro ao adicionar equipamento' });
  }
});

// Atualizar
app.put('/equipamentos/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, codigo, valor_agregado, id_categoria } = req.body;
    if (!nome || !codigo || !valor_agregado)
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });

    if (req.file) {
      const { mimetype, buffer } = req.file;
      await query(`
        UPDATE equipamentos
        SET nome=?, codigo=?, valor_agregado=?, id_categoria=?, tipo_mime=?, dados=?
        WHERE id_equipamento=?
      `, [nome, codigo, valor_agregado, id_categoria || null, mimetype, buffer, req.params.id]);
    } else {
      await query(`
        UPDATE equipamentos
        SET nome=?, codigo=?, valor_agregado=?, id_categoria=?
        WHERE id_equipamento=?
      `, [nome, codigo, valor_agregado, id_categoria || null, req.params.id]);
    }

    res.json({ message: 'Equipamento atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar equipamento:', err);
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
});

// Excluir
app.delete('/equipamentos/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM equipamentos WHERE id_equipamento = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json({ message: 'Equipamento excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir equipamento:', err);
    res.status(500).json({ error: 'Erro ao excluir equipamento' });
  }
});

//  CATEGORIAS 
app.get('/categorias', async (_, res) => {
  try {
    const categorias = await query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (err) {
    console.warn('Erro ao carregar categorias:', err.message);
    res.json([]);
  }
});

// EMPRÉSTIMOS
app.post('/emprestimos', async (req, res) => {
  try {
    const { nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao } = req.body;
    if (!nome_pessoa || !id_equipamento || !data_emprestimo || !data_prevista_devolucao)
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

    const result = await query(`
      INSERT INTO emprestimos (nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao)
      VALUES (?, ?, ?, ?)
    `, [nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao]);

    await query(`UPDATE equipamentos SET disponibilidade='Emprestado' WHERE id_equipamento=?`, [id_equipamento]);
    res.json({ message: 'Empréstimo adicionado com sucesso!', id: result.insertId });
  } catch (err) {
    console.error('Erro ao adicionar empréstimo:', err);
    res.status(500).json({ error: 'Erro ao adicionar empréstimo' });
  }
});

// Listar empréstimos ativos
app.get('/emprestimos/ativos', async (_, res) => {
  try {
    const emprestimos = await query(`
      SELECT id_emprestimo, nome_pessoa, eq.nome AS nome_equipamento,
             eq.codigo AS codigo_equipamento,
             DATE_FORMAT(data_emprestimo,'%d/%m/%Y') AS data_emprestimo,
             DATE_FORMAT(data_prevista_devolucao,'%d/%m/%Y') AS data_prevista_devolucao,
             status
      FROM emprestimos
      JOIN equipamentos eq ON emprestimos.id_equipamento = eq.id_equipamento
      ORDER BY data_prevista_devolucao ASC
    `);
    res.json(emprestimos);
  } catch (err) {
    console.error('Erro ao listar empréstimos:', err);
    res.status(500).json({ error: 'Erro ao listar empréstimos ativos' });
  }
});

// Excluir empréstimo
app.delete('/emprestimos/:id', async (req, res) => {
  try {
    const [emp] = await query('SELECT id_equipamento FROM emprestimos WHERE id_emprestimo = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

    await query('DELETE FROM emprestimos WHERE id_emprestimo = ?', [req.params.id]);
    await query('UPDATE equipamentos SET disponibilidade="Disponível" WHERE id_equipamento=?', [emp.id_equipamento]);
    res.json({ message: 'Empréstimo excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir empréstimo:', err);
    res.status(500).json({ error: 'Erro ao excluir empréstimo' });
  }
});

//RESERVAS 

// Listar reservas
app.get('/api/reservas', async (_, res) => {
  try {
    const reservas = await query(`
      SELECT r.id_reserva, r.nome_pessoa, e.nome AS nome_equipamento,
             DATE_FORMAT(r.data_reserva, '%d/%m/%Y') AS data_reserva, r.status
      FROM reservas r
      JOIN equipamentos e ON r.id_equipamento = e.id_equipamento
      ORDER BY r.data_reserva DESC
    `);
    res.json(reservas);
  } catch (err) {
    console.error('Erro ao listar reservas:', err);
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
});

// Adicionar reserva
app.post('/api/reservas', async (req, res) => {
  try {
    let { nome_pessoa, id_equipamento, data_reserva, status } = req.body;

    if (!nome_pessoa || !id_equipamento || !data_reserva) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // Garante que a data esteja no formato YYYY-MM-DD
    const dataFormatada = new Date(data_reserva).toISOString().split('T')[0];

    // Verifica se o equipamento existe
    const [equipamento] = await query('SELECT * FROM equipamentos WHERE id_equipamento = ?', [id_equipamento]);
    if (!equipamento) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    // Cadastra reserva
    await query(`
      INSERT INTO reservas (nome_pessoa, id_equipamento, data_reserva, status)
      VALUES (?, ?, ?, ?)
    `, [nome_pessoa, id_equipamento, dataFormatada, status || 'Ativo']);

    // Atualiza disponibilidade do equipamento (somente se a coluna existir)
    try {
      await query(`
        UPDATE equipamentos
        SET disponibilidade = 'Reservado'
        WHERE id_equipamento = ?
      `, [id_equipamento]);
    } catch (erroUpdate) {
      console.warn(' Campo "disponibilidade" não existe na tabela equipamentos, ignorando atualização.');
    }

    res.json({ message: 'Reserva cadastrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar reserva:', err.sqlMessage || err);
    res.status(500).json({ error: 'Erro ao cadastrar reserva. Verifique os dados.' });
  }
});


// Devolver reserva
app.put('/reservas/:id/devolver', async (req, res) => {
  try {
    const [reserva] = await query(`
      SELECT r.*, e.id_equipamento
      FROM reservas r
      JOIN equipamentos e ON r.id_equipamento = e.id_equipamento
      WHERE r.id_reserva = ?
    `, [req.params.id]);

    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada.' });

    await query(`UPDATE reservas SET status='Concluído' WHERE id_reserva=?`, [req.params.id]);
    await query(`UPDATE equipamentos SET disponibilidade='Disponível' WHERE id_equipamento=?`, [reserva.id_equipamento]);
    res.json({ message: 'Reserva devolvida com sucesso!' });
  } catch (err) {
    console.error('Erro ao devolver reserva:', err);
    res.status(500).json({ error: 'Erro ao devolver reserva.' });
  }
});

//devoluções
app.put('/emprestimos/:id/devolver', async (req, res) => {
  const { nome_pessoa, item_devolvido, codigo, data_devolucao, estado_fisico, funcionalidade, condicoes, observacoes } = req.body;
  try {
    const [emprestimo] = await query('SELECT * FROM emprestimos WHERE id_emprestimo=?', [req.params.id]);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

    await query(`
      INSERT INTO devolucoes (nome_pessoa, item_devolvido, codigo, data_devolucao, estado_fisico, funcionalidade, condicoes, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nome_pessoa || emprestimo.nome_pessoa,
      item_devolvido || '',
      codigo || '',
      data_devolucao || new Date().toISOString().slice(0, 10),
      estado_fisico || 'Bom',
      funcionalidade || 'Funciona',
      condicoes || 'Intacto',
      observacoes || null
    ]);

    await query(`
      UPDATE emprestimos SET status='Devolvido', data_devolucao=? WHERE id_emprestimo=?
    `, [data_devolucao || new Date().toISOString().slice(0, 10), req.params.id]);

    await query(`
      UPDATE equipamentos SET disponibilidade='Disponível' WHERE id_equipamento=?
    `, [emprestimo.id_equipamento]);

    res.json({ message: 'Devolução registrada e equipamento liberado!' });
  } catch (err) {
    console.error('Erro ao registrar devolução:', err);
    res.status(500).json({ error: 'Erro ao registrar devolução' });
  }
});

// relatorios
app.get('/api/relatorios', async (_, res) => {
  try {
    const relatorios = await query(`
      SELECT d.nome_pessoa, d.item_devolvido AS nome_equipamento, e.data_emprestimo,
             d.data_devolucao, d.estado_fisico, d.funcionalidade,
             d.condicoes, d.observacoes
      FROM devolucoes d
      LEFT JOIN emprestimos e ON d.nome_pessoa = e.nome_pessoa
      ORDER BY d.data_devolucao DESC
    `);
    res.json(relatorios);
  } catch (err) {
    console.error('Erro ao gerar relatório:', err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

app.listen(8080, () => console.log('Servidor rodando em: http://localhost:8080'));
