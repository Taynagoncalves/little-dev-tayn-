const express = require('express');
const path = require('path');
const util = require('util');
const multer = require('multer');
const connection = require('./models/db');

const app = express();
const query = util.promisify(connection.query).bind(connection);
const upload = multer(); // para upload de imagens

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// Rotas principais
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', '/html/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', '/html/dashboard.html'));
});

app.get('/emprestimos', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', '/html/emprestimos.html'));
});

// ✅ Nova rota: equipamentos
app.get('/equipamentosPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', '/html/equipamentos.html'));
});

// ✅ Nova rota: página de adicionar equipamento
app.get('/adicionarEquipamentoPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', '/html/adicionarEquipamento.html'));
});

// ✅ Listar equipamentos (com imagem)
app.get('/equipamentos', async (req, res) => {
  try {
    const equipamentos = await query(`
      SELECT e.*, c.nome_categoria 
      FROM equipamentos e
      JOIN categorias c ON e.id_categoria = c.id_categoria
    `);
    res.json(equipamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar equipamentos' });
  }
});

// ✅ Listar categorias (para popular o select)
app.get('/categorias', async (req, res) => {
  try {
    const categorias = await query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// ✅ Inserir novo equipamento
app.post('/equipamentos', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, codigo, valor_agregado, id_categoria } = req.body;
    const { mimetype, buffer } = req.file;

    await query(
      `INSERT INTO equipamentos 
      (nome, codigo, valor_agregado, id_categoria, tipo_mine, dados) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, codigo, valor_agregado, id_categoria, mimetype, buffer]
    );

    res.json({ message: 'Equipamento adicionado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar equipamento' });
  }
});

// ✅ Porta padrão
app.listen(8080, () => {
  console.log('🚀 Servidor rodando em http://localhost:8080');
});
