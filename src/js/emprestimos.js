document.addEventListener('DOMContentLoaded', () => {
  const selectEquipamento = document.getElementById('selectEquipamento');
  const formEmprestimo = document.getElementById('formEmprestimo');
  const tabelaEmprestimosAtivos = document.getElementById('tabelaEmprestimosAtivos');
  const nomePessoaInput = document.getElementById('nomePessoa'); 

  //carregar equipamentos disponíveis
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
      Swal.fire({
        title: 'Erro!',
        text: 'Falha ao carregar equipamentos.',
        icon: 'error',
        confirmButtonColor: '#111D4A'
      });
    }
  }

  //adicionar empréstimo
  formEmprestimo.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!nomePessoaInput.value.trim()) {
      Swal.fire({
        title: 'Atenção!',
        text: 'Preencha o nome do responsável.',
        icon: 'warning',
        confirmButtonColor: '#111D4A'
      });
      return;
    }

    if (!selectEquipamento.value) {
      Swal.fire({
        title: 'Atenção!',
        text: 'Selecione um equipamento!',
        icon: 'warning',
        confirmButtonColor: '#111D4A'
      });
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
        await Swal.fire({
          title: 'Sucesso!',
          text: result.message,
          icon: 'success',
          confirmButtonColor: '#111D4A'
        });
        formEmprestimo.reset();
        carregarEquipamentos();
        listarEmprestimosAtivos();
      } else {
        Swal.fire({
          title: 'Erro!',
          text: 'Erro ao adicionar empréstimo: ' + result.error,
          icon: 'error',
          confirmButtonColor: '#111D4A'
        });
      }
    } catch (error) {
      console.error('Erro de rede ao adicionar empréstimo:', error);
      Swal.fire({
        title: 'Erro!',
        text: 'Erro de rede. Verifique a conexão com o servidor.',
        icon: 'error',
        confirmButtonColor: '#111D4A'
      });
    }
  });

  //listar empréstimos ativos
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

        //coluna de ações
        const acoesCell = row.insertCell();

        //botao devolver
        const btnDevolver = document.createElement('button');
        btnDevolver.textContent = 'Devolver';
        btnDevolver.classList.add('btn-devolver');
        btnDevolver.addEventListener('click', () => {
          // Redireciona para a tela de devolução, passando o ID
          window.location.href = `/devolucoes?id=${emp.id_emprestimo}`;
        });
        acoesCell.appendChild(btnDevolver);

        //botao excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn-excluir');
        btnExcluir.addEventListener('click', async () => {
          const result = await Swal.fire({
            title: 'Confirmação',
            text: 'Deseja realmente excluir este empréstimo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#111D4A',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
          });

          if (!result.isConfirmed) return;

          try {
            const res = await fetch(`/emprestimos/${emp.id_emprestimo}`, { method: 'DELETE' });
            const resultJson = await res.json();

            if (res.ok) {
              await Swal.fire({
                title: 'Excluído!',
                text: resultJson.message,
                icon: 'success',
                confirmButtonColor: '#111D4A'
              });
              listarEmprestimosAtivos();
            } else {
              Swal.fire({
                title: 'Erro!',
                text: 'Erro ao excluir: ' + resultJson.error,
                icon: 'error',
                confirmButtonColor: '#111D4A'
              });
            }
          } catch (err) {
            console.error('Erro ao excluir empréstimo:', err);
            Swal.fire({
              title: 'Erro!',
              text: 'Erro ao excluir empréstimo.',
              icon: 'error',
              confirmButtonColor: '#111D4A'
            });
          }
        });
        acoesCell.appendChild(btnExcluir);
      });
    } catch (error) {
      console.error('Erro ao listar empréstimos ativos:', error);
      tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Erro ao carregar empréstimos.</td></tr>';
    }
  }

  carregarEquipamentos();
  listarEmprestimosAtivos();
});
