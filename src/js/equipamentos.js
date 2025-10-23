// ==================== LISTAR E GERENCIAR EQUIPAMENTOS ====================
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('equipamentos-container');
  const searchInput = document.getElementById('search-input');

  async function carregarEquipamentos(filtro = '') {
    try {
      container.innerHTML = '<p>Carregando equipamentos...</p>';
      const res = await fetch('/equipamentos');
      const equipamentos = await res.json();

      container.innerHTML = '';

      const filtrados = equipamentos.filter(e =>
        e.nome.toLowerCase().includes(filtro.toLowerCase())
      );

      if (filtrados.length === 0) {
        container.innerHTML = '<p>Nenhum equipamento encontrado.</p>';
        return;
      }

      filtrados.forEach(eq => {
        const imgSrc = eq.dados
          ? `data:${eq.tipo_mime};base64,${arrayBufferToBase64(eq.dados.data)}`
          : '../imagens/placeholder.png';

        let statusClass = 'available';
        if (eq.disponibilidade === 'Emprestado') statusClass = 'borrowed';
        if (eq.disponibilidade === 'Atrasado') statusClass = 'late';

        const card = document.createElement('div');
        card.classList.add('equipment-card');
        card.innerHTML = `
          <img src="${imgSrc}" alt="${eq.nome}" class="equipment-image">
          <div class="card-content">
            <h3>${eq.nome}</h3>
            <p class="category">${eq.nome_categoria || 'Sem categoria'}</p>
            <p class="code">CÓDIGO: ${eq.codigo}</p>
            <span class="status ${statusClass}">${eq.disponibilidade || 'Disponível'}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-edit" data-id="${eq.id_equipamento}">
              <i class="fas fa-pen"></i> Editar
            </button>
            <button class="btn btn-delete" data-id="${eq.id_equipamento}">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      // Eventos dos botões
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = e.currentTarget.dataset.id;
          window.location.href = `editarEquipamento.html?id=${id}`;
        });
      });

      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = e.currentTarget.dataset.id;
          if (confirm('Tem certeza que deseja excluir este equipamento?')) {
            const res = await fetch(`/equipamentos/${id}`, { method: 'DELETE' });
            if (res.ok) {
              alert('Equipamento excluído com sucesso!');
              carregarEquipamentos();
            } else {
              alert('Erro ao excluir equipamento.');
            }
          }
        });
      });

    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
      container.innerHTML = '<p>Erro ao carregar equipamentos.</p>';
    }
  }

  // Converter dados binários para base64 (para exibir imagem)
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Filtro de pesquisa
  searchInput.addEventListener('input', e => {
    carregarEquipamentos(e.target.value);
  });

  carregarEquipamentos();
});
