document.addEventListener('DOMContentLoaded', () => {
  const selectEquipamento = document.getElementById('selectEquipamento');
  const formEmprestimo = document.getElementById('formEmprestimo');
  const tabelaEmprestimosAtivos = document.getElementById('tabelaEmprestimosAtivos');
  const nomePessoaInput = document.getElementById('nomePessoa'); 

  // ==================== CARREGAR EQUIPAMENTOS DISPONÍVEIS ====================
  async function carregarEquipamentos() {
    try {
      const response = await fetch('/equipamentos/disponiveis');
      const equipamentos = await response.json();

      selectEquipamento.innerHTML = '<option value="" disabled selected>Selecione o Equipamento</option>';

      equipamentos.forEach(equipamento => {
        const option = document.createElement('option');
        option.value = equipamento.id_equipamento;
        option.textContent = equipamento.nome;
        selectEquipamento.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  }

  // ==================== ADICIONAR EMPRÉSTIMO ====================
  formEmprestimo.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!nomePessoaInput.value.trim()) {
      alert('Preencha o nome do responsável.');
      return;
    }

    if (!selectEquipamento.value) {
      alert('Selecione um equipamento!');
      return;
    }

    const formData = {
      nome_pessoa: nomePessoaInput.value.trim(),
      id_equipamento: selectEquipamento.value,
      data_emprestimo: document.getElementById('dataEmprestimo').value,
      data_prevista_devolucao: document.getElementById('dataPrevistaDevolucao').value,
    };

    try {
      const response = await fetch('/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        formEmprestimo.reset();
        carregarEquipamentos();
        listarEmprestimosAtivos();
      } else {
        alert('Erro ao adicionar empréstimo: ' + result.error);
      }
    } catch (error) {
      console.error('Erro de rede ao adicionar empréstimo:', error);
      alert('Erro de rede. Verifique a conexão com o servidor.');
    }
  });

  // ==================== LISTAR EMPRÉSTIMOS ATIVOS ====================
  async function listarEmprestimosAtivos() {
    try {
      const response = await fetch('/emprestimos/ativos');
      const emprestimos = await response.json();

      tabelaEmprestimosAtivos.innerHTML = '';

      if (emprestimos.length === 0) {
        tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Nenhum empréstimo ativo encontrado.</td></tr>';
        return;
      }

      let contador = 1;

      emprestimos.forEach(emp => {
        const row = tabelaEmprestimosAtivos.insertRow();

        row.insertCell().textContent = contador++;
        row.insertCell().textContent = emp.nome_pessoa;
        row.insertCell().textContent = emp.nome_equipamento;
        row.insertCell().textContent = emp.data_emprestimo;
        row.insertCell().textContent = emp.data_prevista_devolucao;
        row.insertCell().textContent = emp.status;

        // ===== COLUNA DE AÇÕES =====
        const acoesCell = row.insertCell();

        // BOTÃO DEVOLVER
        const btnDevolver = document.createElement('button');
        btnDevolver.textContent = 'Devolver';
        btnDevolver.classList.add('btn-devolver');
        btnDevolver.addEventListener('click', () => {
          // Redireciona para a tela de devolução, passando o ID
          window.location.href = `/devolucoes?id=${emp.id_emprestimo}`;
        });
        acoesCell.appendChild(btnDevolver);

        // BOTÃO EXCLUIR
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn-excluir');
        btnExcluir.addEventListener('click', async () => {
          if (!confirm('Deseja realmente excluir este empréstimo?')) return;

          try {
            const res = await fetch(`/emprestimos/${emp.id_emprestimo}`, { method: 'DELETE' });
            const result = await res.json();

            if (res.ok) {
              alert(result.message);
              listarEmprestimosAtivos();
            } else {
              alert('Erro ao excluir: ' + result.error);
            }
          } catch (err) {
            console.error('Erro ao excluir empréstimo:', err);
            alert('Erro ao excluir empréstimo.');
          }
        });
        acoesCell.appendChild(btnExcluir);
      });
    } catch (error) {
      console.error('Erro ao listar empréstimos ativos:', error);
      tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Erro ao carregar empréstimos.</td></tr>';
    }
  }

  // ==================== INICIALIZAÇÃO ====================
  carregarEquipamentos();
  listarEmprestimosAtivos();
});
