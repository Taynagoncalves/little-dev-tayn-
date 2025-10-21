async function carregarReservas() {
  try {
    const response = await fetch('/api/reservas');
    const reservas = await response.json();

    const tabela = document.getElementById('listaReservas');
    tabela.innerHTML = '';

    if (reservas.length === 0) {
      tabela.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">Nenhuma reserva encontrada</td></tr>`;
      return;
    }

    reservas.forEach(reserva => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${reserva.nome_pessoa}</td>
        <td>${reserva.nome_equipamento}</td>
        <td>${reserva.data_reserva}</td>
        <td>${reserva.status}</td>
        <td>
          <button class="btn-primario" onclick="irParaDevolucao()">Devolver</button>
        </td>
      `;

      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao carregar reservas:', err);
  }
}

async function carregarCalendario() {
  const container = document.getElementById('calendario');
  container.innerHTML = '';

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const inicioMes = new Date(ano, mes, 1);
  const fimMes = new Date(ano, mes + 1, 0);
  const totalDias = fimMes.getDate();

  // Busca as datas reservadas
  const resposta = await fetch('/api/reservas/datas');
  const datasReservadas = await resposta.json();
  const diasIndisponiveis = datasReservadas.map(d => new Date(d.data_reserva).getDate());

  // Cabeçalho do mês
  const tituloMes = document.createElement('h3');
  tituloMes.textContent = inicioMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  tituloMes.classList.add('titulo-mes');
  container.appendChild(tituloMes);

  // Grade dos dias
  const calendario = document.createElement('div');
  calendario.classList.add('grade-calendario');

  for (let dia = 1; dia <= totalDias; dia++) {
    const celula = document.createElement('div');
    celula.classList.add('dia');
    celula.textContent = dia;

    if (diasIndisponiveis.includes(dia)) {
      celula.classList.add('indisponivel');
    }

    calendario.appendChild(celula);
  }

  container.appendChild(calendario);
}

function irParaDevolucao() {
  window.location.href = '/devolucoes';
}

document.addEventListener('DOMContentLoaded', () => {
  carregarReservas();
  carregarCalendario();
});
