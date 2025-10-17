// ==================== LISTAR EQUIPAMENTOS ====================
document.addEventListener('DOMContentLoaded', async () => {
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
  
        filtrados.forEach(equip => {
          const card = document.createElement('div');
          card.classList.add('equipment-card');
  
          const imgSrc = equip.dados
            ? `data:${equip.tipo_mime};base64,${arrayBufferToBase64(equip.dados.data)}`
            : '../imagens/placeholder.png';
  
          card.innerHTML = `
            <img src="${imgSrc}" alt="${equip.nome}" class="equipment-image">
            <h3>${equip.nome}</h3>
            <p><strong>Código:</strong> ${equip.codigo}</p>
            <p><strong>Categoria:</strong> ${equip.nome_categoria || 'Sem categoria'}</p>
            <p><strong>Valor Agregado:</strong> ${equip.valor_agregado}</p>
            <div class="card-actions">
              <button class="edit-btn" data-id="${equip.id_equipamento}">Editar</button>
              <button class="delete-btn" data-id="${equip.id_equipamento}">Excluir</button>
            </div>
          `;
  
          container.appendChild(card);
        });
  
        // Eventos dos botões
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja excluir este equipamento?')) {
              const delRes = await fetch(`/equipamentos/${id}`, { method: 'DELETE' });
              const msg = await delRes.json();
              alert(msg.message || 'Equipamento excluído');
              carregarEquipamentos();
            }
          });
        });
  
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            window.location.href = `editarEquipamento.html?id=${id}`;
          });
        });
  
      } catch (err) {
        console.error('Erro ao carregar equipamentos:', err);
        container.innerHTML = '<p>Erro ao carregar equipamentos.</p>';
      }
    }
  
    // Função auxiliar: converter buffer para Base64
    function arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
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
  