async function carregarEquipamentos() {
    try {
      const res = await fetch('/equipamentos');
      const equipamentos = await res.json();
      const container = document.getElementById('equipamentos-container');
      container.innerHTML = '';

      if (!equipamentos.length) {
        container.innerHTML = '<p>Nenhum equipamento encontrado.</p>';
        return;
      }

      equipamentos.forEach(eq => {
        const imgSrc = eq.dados
          ? `data:${eq.tipo_mine};base64,${arrayBufferToBase64(eq.dados.data)}`
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
            <p class="category">${eq.nome_categoria}</p>
            <p class="code">CÓDIGO: ${eq.codigo}</p>
            <span class="status ${statusClass}">${eq.disponibilidade}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-edit" onclick="editarEquipamento(${eq.id_equipamento})">
              <i class="fas fa-pen"></i> Editar
            </button>
            <button class="btn btn-delete" onclick="excluirEquipamento(${eq.id_equipamento})">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      document.getElementById('equipamentos-container').innerHTML = '<p>Erro ao carregar equipamentos.</p>';
    }
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach(b => binary += String.fromCharCode(b));
    return window.btoa(binary);
  }

  function editarEquipamento(id) {
    window.location.href = `editarEquipamento.html=${id}`;
  }

  async function excluirEquipamento(id) {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      const res = await fetch(`/equipamentos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Equipamento excluído com sucesso!');
        carregarEquipamentos();
      } else {
        alert('Erro ao excluir equipamento.');
      }
    }
  }

  carregarEquipamentos();

  document.getElementById('search-input').addEventListener('input', e => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll('.equipment-card').forEach(card => {
      const nome = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = nome.includes(termo) ? 'flex' : 'none';
    });
  });