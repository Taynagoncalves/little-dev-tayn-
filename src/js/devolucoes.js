document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const idEmprestimo = params.get('id');

  const form = document.getElementById('formDevolucao');
  const voltarBtn = document.getElementById('voltarBtn');

  if (!idEmprestimo) {
    alert('ID de empréstimo não informado.');
    window.location.href = '/emprestimos';
    return;
  }

  try {
    // Buscar dados do empréstimo
    const res = await fetch(`/emprestimos/ativos`);
    const emprestimos = await res.json();
    const emprestimo = emprestimos.find(e => e.id_emprestimo == idEmprestimo);

    if (!emprestimo) {
      alert('Empréstimo não encontrado.');
      window.location.href = '/emprestimos';
      return;
    }

    document.getElementById('nomePessoa').value = emprestimo.nome_pessoa;
    document.getElementById('itemDevolvido').value = emprestimo.nome_equipamento;
    document.getElementById('codigo').value = emprestimo.codigo_equipamento;
    document.getElementById('dataDevolucao').value = new Date().toISOString().split('T')[0];
  } catch (err) {
    console.error('Erro ao carregar dados do empréstimo:', err);
    alert('Erro ao carregar dados.');
  }

  // Enviar devolução
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const devolucaoData = {
      nome_pessoa: document.getElementById('nomePessoa').value,
      item_devolvido: document.getElementById('itemDevolvido').value,
      codigo: document.getElementById('codigo').value,
      data_devolucao: document.getElementById('dataDevolucao').value,
      estado_fisico: document.getElementById('estadoFisico').value,
      funcionalidade: document.getElementById('funcionalidade').value,
      condicoes: document.getElementById('condicoes').value,
      observacoes: document.getElementById('observacoes').value
    };

    try {
      const res = await fetch(`/emprestimos/${idEmprestimo}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devolucaoData)
      });

      const result = await res.json();

      if (res.ok) {
        alert('✅ Devolução registrada com sucesso!');
        window.location.href = '/emprestimos';
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (err) {
      console.error('Erro ao registrar devolução:', err);
      alert('Erro ao enviar devolução.');
    }
  });

  voltarBtn.addEventListener('click', () => {
    window.location.href = '/emprestimos';
  });
});
