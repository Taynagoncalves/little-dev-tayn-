// emprestimos.js

document.addEventListener('DOMContentLoaded', () => {
    const selectEquipamento = document.getElementById('selectEquipamento');
    const formEmprestimo = document.getElementById('formEmprestimo');
    const tabelaEmprestimosAtivos = document.getElementById('tabelaEmprestimosAtivos');
    const nomePessoaInput = document.getElementById('nomePessoa'); // Input para o nome do responsável

    // 1. Função para carregar os equipamentos disponíveis no SELECT
    async function carregarEquipamentos() {
        try {
            const response = await fetch('/equipamentos/disponiveis');
            const equipamentos = await response.json();

            // Limpa as opções e adiciona a opção default
            selectEquipamento.innerHTML = '<option value="" disabled selected>Selecione o Equipamento</option>';

            equipamentos.forEach(equipamento => {
                const option = document.createElement('option');
                option.value = equipamento.id_equipamento; 
                option.textContent = equipamento.nome;
                selectEquipamento.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar equipamentos:', error);
            // Mensagem de erro para o usuário, se a busca falhar
        }
    }
    
    // 2. Função para registrar um novo empréstimo (ao clicar em "Adicionar")
    formEmprestimo.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ATENÇÃO: É necessário buscar o ID da pessoa no backend. 
        // O campo 'nomePessoa' no HTML não é suficiente para o POST.
        // Vou usar um ID fixo '1' como exemplo, mas você deve criar uma API 
        // de busca/criação de pessoas para usar o ID real.
        const id_pessoa_simulado = 1; 
        
        // Se você não tem uma rota para buscar pessoas, esta validação é importante:
        if (!nomePessoaInput.value.trim()) {
            alert('Preencha o nome do responsável.');
            return;
        }

        // Coleta os dados do formulário
        const formData = {
            id_pessoa: id_pessoa_simulado, 
            id_equipamento: selectEquipamento.value,
            data_emprestimo: document.getElementById('dataEmprestimo').value,
            data_prevista_devolucao: document.getElementById('dataPrevistaDevolucao').value,
        };

        if (!formData.id_equipamento) {
            alert('Selecione um equipamento!');
            return;
        }

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
                formEmprestimo.reset(); // Limpa o formulário
                // Recarrega equipamentos (o emprestado deve sumir) e a lista de ativos
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


    // 3. Função para listar os "Empréstimos Ativos" na tabela
    async function listarEmprestimosAtivos() {
        try {
            const response = await fetch('/emprestimos/ativos');
            const emprestimos = await response.json();

            // Limpa a tabela
            tabelaEmprestimosAtivos.innerHTML = '';

            if (emprestimos.length === 0) {
                tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Nenhum empréstimo ativo encontrado.</td></tr>';
                return;
            }

            emprestimos.forEach(emp => {
                const row = tabelaEmprestimosAtivos.insertRow();
                
                // Colunas da Tabela
                row.insertCell().textContent = emp.id_emprestimo;
                row.insertCell().textContent = emp.nome_pessoa;
                row.insertCell().textContent = emp.nome_equipamento;
                row.insertCell().textContent = emp.data_emprestimo;
                row.insertCell().textContent = emp.data_prevista_devolucao;
                row.insertCell().textContent = emp.status;

                // Coluna Ações (Botão Devolver)
                const acoesCell = row.insertCell();
                const btnDevolver = document.createElement('button');
                btnDevolver.textContent = 'Devolver';
                btnDevolver.classList.add('btn-devolver'); 
                // Você deve implementar a lógica de devolução (rota PUT/PATCH) aqui.
                acoesCell.appendChild(btnDevolver);
            });

        } catch (error) {
            console.error('Erro ao listar empréstimos ativos:', error);
            tabelaEmprestimosAtivos.innerHTML = '<tr><td colspan="7">Erro ao carregar empréstimos.</td></tr>';
        }
    }


    // Inicialização: Carrega os equipamentos e lista os empréstimos ativos
    carregarEquipamentos();
    listarEmprestimosAtivos();
});