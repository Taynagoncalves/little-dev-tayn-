document.addEventListener('DOMContentLoaded', async () => {
  const tabelaBody = document.querySelector('#tabelaRelatorios tbody');
  const btnDownloadCSV = document.getElementById('btnDownloadCSV');

  // ✅ Função para formatar data em dd/mm/yyyy
  function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data);
    if (isNaN(d)) return '-';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // ✅ Função para carregar relatórios
  async function carregarRelatorios() {
    try {
      const response = await fetch('/api/relatorios');
      const relatorios = await response.json();

      tabelaBody.innerHTML = '';

      if (relatorios.length === 0) {
        tabelaBody.innerHTML = '<tr><td colspan="8">Nenhum relatório disponível.</td></tr>';
        return;
      }

      relatorios.forEach(rel => {
        const row = tabelaBody.insertRow();

        row.insertCell().textContent = rel.nome_pessoa || '-';
        row.insertCell().textContent = rel.nome_equipamento || '-';
        row.insertCell().textContent = formatarData(rel.data_emprestimo);
        row.insertCell().textContent = formatarData(rel.data_devolucao);
        row.insertCell().textContent = rel.estado_fisico || '-';
        row.insertCell().textContent = rel.funcionalidade || '-';
        row.insertCell().textContent = rel.condicoes || '-';
        row.insertCell().textContent = rel.observacoes || '-';
      });
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
      tabelaBody.innerHTML = '<tr><td colspan="8">Erro ao carregar relatórios.</td></tr>';
    }
  }

  // ✅ Função para exportar para CSV
  function exportarCSV() {
    const linhas = [];
    const cabecalho = [
      'Responsável',
      'Equipamento',
      'Data Empréstimo',
      'Data Devolução',
      'Estado Físico',
      'Funcionalidade',
      'Condições',
      'Observações'
    ];
    linhas.push(cabecalho.join(','));

    const rows = tabelaBody.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const valores = Array.from(cells).map(td => `"${td.textContent.trim()}"`);
      linhas.push(valores.join(','));
    });

    const csvContent = linhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio_devolucoes.csv';
    link.click();
  }

  btnDownloadCSV.addEventListener('click', exportarCSV);

  // ✅ Carregar relatórios ao abrir a página
  carregarRelatorios();
});
