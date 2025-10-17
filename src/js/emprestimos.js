document.addEventListener('DOMContentLoaded', () => {
    const selectEquipamento = document.getElementById('selectEquipamento');
    const formEmprestimo = document.getElementById('formEmprestimo');
    const tabelaEmprestimosAtivos = document.getElementById('tabelaEmprestimosAtivos');
    const nomePessoaInput = document.getElementById('nomePessoa'); 

    
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
                headers: {
                    'Content-Type': 'application/json',
                },
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

    async function listarEmprestimosAtivos() {
        try {
          const response = await fetch('/emprestimos/ativos');
          const emprestimos = await response.json();
      
          tabelaEmprestimosAtivos.innerHTML = '';
      
          if (emprestimos.length === 0) {
            tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Nenhum empréstimo ativo encontrado.</td></tr>';
            return;
          }
      
          // Sequência do ID na tabela
          let contador = 1;
      
          emprestimos.forEach(emp => {
            const row = tabelaEmprestimosAtivos.insertRow();
      
            // ID sequencial
            row.insertCell().textContent = contador++;
      
            row.insertCell().textContent = emp.nome_pessoa;
            row.insertCell().textContent = emp.nome_equipamento;
            row.insertCell().textContent = emp.data_emprestimo;
            row.insertCell().textContent = emp.data_prevista_devolucao;
            row.insertCell().textContent = emp.status;
      
            // Coluna de Ações
            const acoesCell = row.insertCell();
      
            // Botão Devolver
            const btnDevolver = document.createElement('button');
            btnDevolver.textContent = 'Devolver';
            btnDevolver.classList.add('btn-devolver');
            acoesCell.appendChild(btnDevolver);
      
            // Botão Excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.classList.add('btn-excluir');
            acoesCell.appendChild(btnExcluir);
      
            // Evento de exclusão
            btnExcluir.addEventListener('click', async () => {
              if (!confirm('Deseja realmente excluir este empréstimo?')) return;
      
              try {
                const res = await fetch(`/emprestimos/${emp.id_emprestimo}`, {
                  method: 'DELETE',
                });
                const result = await res.json();
      
                if (res.ok) {
                  alert(result.message);
                  listarEmprestimosAtivos(); // Atualiza tabela
                } else {
                  alert('Erro ao excluir: ' + result.error);
                }
              } catch (err) {
                console.error('Erro ao excluir empréstimo:', err);
                alert('Erro ao excluir empréstimo.');
              }
            });
      
            // Aqui você pode adicionar a lógica de "Devolver" no futuro
            btnDevolver.addEventListener('click', () => {
              alert('Funcionalidade de devolver ainda não implementada.');
            });
          });
        } catch (error) {
          console.error('Erro ao listar empréstimos ativos:', error);
          tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Erro ao carregar empréstimos.</td></tr>';
        }
      }
      

    // Inicialização
    carregarEquipamentos();
    listarEmprestimosAtivos();
});
