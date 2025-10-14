async function carregarCategorias() {
  const res = await fetch('/categorias');
  const categorias = await res.json();
  const select = document.getElementById('categoriaSelect');
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id_categoria;
    option.textContent = cat.nome_categoria;
    select.appendChild(option);
  });
}

carregarCategorias();

document.getElementById('formEquipamento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const res = await fetch('/equipamentos', { method: 'POST', body: formData });

  if (res.ok) {
    alert('Equipamento adicionado com sucesso!');
    window.location.href = '/equipamentosPage';
  } else {
    alert('Erro ao adicionar equipamento.');
  }
});