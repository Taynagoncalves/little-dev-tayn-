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
    Swal.fire({
      title: 'Sucesso!',
      text: 'Equipamento adicionado com sucesso!',
      icon: 'success',
      confirmButtonColor: '#111D4A',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/equipamentosPage';
    });
  } else {
    Swal.fire({
      title: 'Erro!',
      text: 'Erro ao adicionar equipamento.',
      icon: 'error',
      confirmButtonColor: '#111D4A',
      confirmButtonText: 'Tentar novamente'
    });
  }
});