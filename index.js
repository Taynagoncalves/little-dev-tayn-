const express = require('express');
const path = require('path');
const util = require('util');
const multer = require('multer');
const connection = require('./models/db');

const app = express();
const query = util.promisify(connection.query).bind(connection);
const upload = multer();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// ==================== ROTAS DE PÁGINAS ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src/html/index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'src/html/dashboard.html')));
app.get('/emprestimos', (req, res) => res.sendFile(path.join(__dirname, 'src/html/emprestimos.html')));
app.get('/equipamentosPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/equipamentos.html')));
app.get('/adicionarEquipamentoPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/adicionarEquipamento.html')));
app.get('/editarEquipamentoPage', (req, res) => res.sendFile(path.join(__dirname, 'src/html/editarEquipamento.html')));

// ==================== ROTAS DE EQUIPAMENTOS ====================

// 🔹 LISTAR TODOS
app.get('/equipamentos', async (req, res) => {
  try {
    const equipamentos = await query(`
      SELECT e.*, c.nome_categoria
      FROM equipamentos e
      LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
    `);
    res.json(equipamentos);
  } catch (err) {
    console.error('❌ Erro ao listar equipamentos:', err);
    res.status(500).json({ error: 'Erro ao listar equipamentos', details: err.message });
  }
});

// 🔹 BUSCAR POR ID
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

    if (!equipamento) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    res.json(equipamento);
  } catch (err) {
    console.error('❌ Erro ao buscar equipamento:', err);
    res.status(500).json({ error: 'Erro ao buscar equipamento', details: err.message });
  }
});

// 🔹 ADICIONAR NOVO
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

    console.log(`✅ Equipamento "${nome}" adicionado com sucesso.`);
    res.json({ message: 'Equipamento adicionado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao adicionar equipamento:', err);
    res.status(500).json({ error: 'Erro ao adicionar equipamento', details: err.message });
  }
});

// 🔹 EDITAR EXISTENTE
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

    console.log(`✏️ Equipamento ${id} atualizado com sucesso.`);
    res.json({ message: 'Equipamento atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar equipamento:', err);
    res.status(500).json({ error: 'Erro ao atualizar equipamento', details: err.message });
  }
});

// 🔹 EXCLUIR
app.delete('/equipamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM equipamentos WHERE id_equipamento = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }
    console.log(`🗑️ Equipamento ${id} excluído com sucesso.`);
    res.json({ message: 'Equipamento excluído com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao excluir equipamento:', err);
    res.status(500).json({ error: 'Erro ao excluir equipamento', details: err.message });
  }
});

// ==================== ROTAS DE CATEGORIAS ====================
app.get('/categorias', async (req, res) => {
  try {
    const categorias = await query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (err) {
    console.warn('⚠️ Não foi possível carregar categorias:', err.message);
    res.json([]);
  }
});

// ==================== INICIAR SERVIDOR ====================
app.listen(8080, () => {
  console.log('🚀 Servidor rodando em: http://localhost:8080');
});
