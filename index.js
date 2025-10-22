// IMPORTAÇÕES 
const express = require('express');
const path = require('path');
const util = require('util');
const multer = require('multer');
const connection = require('./models/db');

const app = express();
const query = util.promisify(connection.query).bind(connection);

// Configuração Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// ==================== ROTAS HTML ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src/html/index.html')));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'src/html/dashboard.html')));

app.get('/emprestimos', (req, res) => res.sendFile(path.join(__dirname, 'src/html/emprestimos.html')));

app.get('/equipamentosPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/equipamentos.html')));

app.get('/adicionarEquipamentoPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/adicionarEquipamento.html')));

app.get('/editarEquipamentoPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/editarEquipamento.html')));

app.get('/devolucoes', (req, res) => res.sendFile(path.join(__dirname, 'src/html/devolucoes.html')));

app.get('/reservas', (req, res) => res.sendFile(path.join(__dirname, 'src/html/reservas.html')));

app.get('/relatoriosPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/relatorios.html')));


//RESUMO DASHBOARD
app.get('/dashboard/resumo', async (req, res) => {
  try {
    const [equipamentos] = await query(`SELECT COUNT(*) AS total FROM equipamentos`);

    // Conta empréstimos ativos: status NULL ou diferente de "Devolvido"
    const [emprestimos] = await query(`
      SELECT COUNT(*) AS total 
      FROM emprestimos
      WHERE status IS NULL OR status NOT IN ('Devolvido', 'Concluído', 'Finalizado')
    `);

    // Conta atrasos: previsão anterior à data atual e ainda não devolvido
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


// EQUIPAMENTOS 

// Equipamentos disponíveis
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

// Listar todos equipamentos
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

// Buscar equipamento por ID
app.get('/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [equipamento] = await query(
      `SELECT e.*, c.nome_categoria
       FROM equipamentos e
       LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
       WHERE e.id_equipamento = ?`,
      [id]
    );
    if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json(equipamento);
  } catch (err) {
    console.error('Erro ao buscar equipamento:', err);
    res.status(500).json({ error: 'Erro ao buscar equipamento' });
  }
});

// Adicionar equipamento
app.post('/equipamentos', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, codigo, valor_agregado, id_categoria } = req.body;
    if (!nome || !codigo || !valor_agregado) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    let mimetype = null;
    let buffer = null;
    if (req.file) {
      mimetype = req.file.mimetype;
      buffer = req.file.buffer;
    }

    await query(
      `INSERT INTO equipamentos (nome, codigo, valor_agregado, id_categoria, tipo_mime, dados)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, codigo, valor_agregado, id_categoria || null, mimetype, buffer]
    );

    res.json({ message: 'Equipamento adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar equipamento:', err);
    res.status(500).json({ error: 'Erro ao adicionar equipamento' });
  }
});

// Atualizar equipamento
app.put('/equipamentos/:id', upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const { nome, codigo, valor_agregado, id_categoria } = req.body;

  try {
    if (!nome || !codigo || !valor_agregado) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    if (req.file) {
      const { mimetype, buffer } = req.file;
      await query(
        `UPDATE equipamentos
         SET nome=?, codigo=?, valor_agregado=?, id_categoria=?, tipo_mime=?, dados=?
         WHERE id_equipamento=?`,
        [nome, codigo, valor_agregado, id_categoria || null, mimetype, buffer, id]
      );
    } else {
      await query(
        `UPDATE equipamentos
         SET nome=?, codigo=?, valor_agregado=?, id_categoria=?
         WHERE id_equipamento=?`,
        [nome, codigo, valor_agregado, id_categoria || null, id]
      );
    }

    res.json({ message: 'Equipamento atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar equipamento:', err);
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
});

app.get('/api/relatorios', async (req, res) => {
  try {
    const relatorios = await query(`
      SELECT 
        d.nome_pessoa,
        d.item_devolvido AS nome_equipamento,
        e.data_emprestimo,
        d.data_devolucao,
        d.estado_fisico,
        d.funcionalidade,
        d.condicoes,
        d.observacoes
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


// Excluir equipamento
app.delete('/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM equipamentos WHERE id_equipamento = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json({ message: 'Equipamento excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir equipamento:', err);
    res.status(500).json({ error: 'Erro ao excluir equipamento' });
  }
});

//  CATEGORIAS 
app.get('/categorias', async (req, res) => {
  try {
    const categorias = await query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (err) {
    console.warn('Não foi possível carregar categorias:', err.message);
    res.json([]);
  }
});

// EMPRÉSTIMOS 

// Adicionar empréstimo
app.post('/emprestimos', async (req, res) => {
  try {
    const { nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao } = req.body;
    if (!nome_pessoa || !id_equipamento || !data_emprestimo || !data_prevista_devolucao) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    const insertResult = await query(
      `INSERT INTO emprestimos (nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao)
       VALUES (?, ?, ?, ?)`,
      [nome_pessoa, id_equipamento, data_emprestimo, data_prevista_devolucao]
    );

    await query(
      `UPDATE equipamentos
       SET disponibilidade = 'Emprestado'
       WHERE id_equipamento = ?`,
      [id_equipamento]
    );

    res.json({ message: 'Empréstimo adicionado com sucesso!', id: insertResult.insertId });
  } catch (err) {
    console.error('Erro ao adicionar empréstimo:', err);
    res.status(500).json({ error: 'Erro ao adicionar empréstimo' });
  }
});
app.get('/api/reservas', async (req, res) => {
  try {
    const reservas = await query(`
      SELECT 
        r.id_reserva,
        r.nome_pessoa,
        e.nome AS nome_equipamento,
        DATE_FORMAT(r.data_reserva, '%d/%m/%Y') AS data_reserva,
        r.status
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
// Listar todos empréstimos ativos
app.get('/emprestimos/ativos', async (req, res) => {
  try {
    const emprestimos = await query(`
      SELECT
        id_emprestimo,
        nome_pessoa,
        eq.nome AS nome_equipamento,
        eq.codigo AS codigo_equipamento,
        DATE_FORMAT(data_emprestimo, '%d/%m/%Y') AS data_emprestimo,
        DATE_FORMAT(data_prevista_devolucao, '%d/%m/%Y') AS data_prevista_devolucao,
        status
      FROM emprestimos
      JOIN equipamentos eq ON emprestimos.id_equipamento = eq.id_equipamento
      ORDER BY data_prevista_devolucao ASC
    `);
    res.json(emprestimos);
  } catch (err) {
    console.error('Erro ao listar empréstimos ativos:', err);
    res.status(500).json({ error: 'Erro ao listar empréstimos ativos' });
  }
});

// Excluir empréstimo
app.delete('/emprestimos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [emprestimo] = await query('SELECT id_equipamento FROM emprestimos WHERE id_emprestimo = ?', [id]);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado.' });

    await query('DELETE FROM emprestimos WHERE id_emprestimo = ?', [id]);
    await query('UPDATE equipamentos SET disponibilidade = "Disponível" WHERE id_equipamento = ?', [emprestimo.id_equipamento]);

    res.json({ message: 'Empréstimo excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir empréstimo:', err);
    res.status(500).json({ error: 'Erro ao excluir empréstimo' });
  }
});

// DEVOLUÇÕES 

// Registrar devolução
app.put('/emprestimos/:id/devolver', async (req, res) => {
  const idEmprestimo = req.params.id;
  const {
    nome_pessoa,
    item_devolvido,
    codigo,
    data_devolucao,
    estado_fisico,
    funcionalidade,
    condicoes,
    observacoes
  } = req.body;

  try {
    const [emprestimo] = await query('SELECT * FROM emprestimos WHERE id_emprestimo = ?', [idEmprestimo]);
    if (!emprestimo) {
      return res.status(404).json({ error: 'Empréstimo não encontrado.' });
    }

    // Inserir na tabela devolucoes
    await query(
      `INSERT INTO devolucoes 
       (nome_pessoa, item_devolvido, codigo, data_devolucao, estado_fisico, funcionalidade, condicoes, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_pessoa || emprestimo.nome_pessoa,
        item_devolvido || '',
        codigo || '',
        data_devolucao || new Date().toISOString().slice(0, 10),
        estado_fisico || 'Bom',
        funcionalidade || 'Funciona',
        condicoes || 'Intacto',
        observacoes || null
      ]
    );

    // Atualizar empréstimo
    await query(
      `UPDATE emprestimos
       SET status = 'Devolvido', data_devolucao = ?
       WHERE id_emprestimo = ?`,
      [data_devolucao || new Date().toISOString().slice(0, 10), idEmprestimo]
    );

    // Liberar equipamento
    if (emprestimo.id_equipamento) {
      await query(
        `UPDATE equipamentos
         SET disponibilidade = 'Disponível'
         WHERE id_equipamento = ?`,
        [emprestimo.id_equipamento]
      );
    }

    res.json({ message: 'Devolução registrada e equipamento liberado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar devolução:', err);
    res.status(500).json({ error: 'Erro ao registrar devolução' });
  }
});


app.listen(8080, () => {
  console.log(' Servidor rodando em: http://localhost:8080');
});
