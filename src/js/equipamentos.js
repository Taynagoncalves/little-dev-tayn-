document.addEventListener('DOMContentLoaded', () => {
  // 1. Funcionalidade para o botão "Adicionar Novo Equipamento"
  const addButton = document.querySelector('.add-button');
  if (addButton) {
      addButton.addEventListener('click', () => {
          alert('Ação: Abrir formulário para adicionar novo equipamento.');
      });
  }

  // 2. Funcionalidade para os botões "Editar" e "Excluir"
  const actionButtons = document.querySelectorAll('.action-button');
  actionButtons.forEach(button => {
      button.addEventListener('click', (event) => {
          const action = event.target.getAttribute('data-action'); // 'edit' ou 'delete'
          const id = event.target.getAttribute('data-id'); // Código do equipamento

          if (action === 'edit') {
              alert(`Ação: Editar equipamento de CÓDIGO: ${id}`);
          } else if (action === 'delete') {
              if (confirm(`Tem certeza que deseja EXCLUIR o equipamento de CÓDIGO: ${id}?`)) {
                  alert(`Ação: Equipamento ${id} excluído com sucesso (simulado).`);
                  // Em uma aplicação real, você faria uma requisição para o servidor aqui.
              }
          }
      });
  });

  // 3. Funcionalidade para o Dropdown dos Filtros (exibição/ocultação)
  const filterDropdowns = document.querySelectorAll('.filter-dropdown');

  filterDropdowns.forEach(dropdown => {
      const selected = dropdown.querySelector('.filter-selected');
      const content = dropdown.querySelector('.dropdown-content');

      // Toggle do dropdown ao clicar no seletor
      selected.addEventListener('click', (e) => {
          // Previne o fechamento imediato
          e.stopPropagation(); 
          content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });

      // Simula a seleção de uma opção
      const options = content.querySelectorAll('a');
      options.forEach(option => {
          option.addEventListener('click', (e) => {
              e.preventDefault();
              // Atualiza o texto do filtro selecionado
              selected.textContent = option.textContent; 
              // Oculta o dropdown
              content.style.display = 'none'; 
              
              // Em uma aplicação real, você ativaria a função de filtro de dados aqui.
              alert(`Filtro "${dropdown.querySelector('.filter-label').textContent}" alterado para: ${option.textContent}`);
          });
      });
  });

  // Fecha todos os dropdowns se clicar fora deles
  document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-content').forEach(content => {
          content.style.display = 'none';
      });
  });

});