
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();


async function carregarEquipamentos() {
  const select = document.getElementById("equipamento");
  if (!select) return;

  select.innerHTML = '<option value="">Carregando...</option>';

  try {
    const resp = await fetch("/equipamentos/disponiveis");
    const equipamentos = await resp.json();
    select.innerHTML = '<option value="">Selecione um equipamento</option>';

    equipamentos.forEach(eq => {
      const option = document.createElement("option");
      option.value = eq.id_equipamento;
      option.textContent = eq.nome;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar equipamentos disponíveis:", err);
    select.innerHTML = '<option value="">Erro ao carregar</option>';
    Swal.fire({
      title: 'Erro!',
      text: 'Falha ao carregar equipamentos disponíveis.',
      icon: 'error',
      confirmButtonColor: '#111D4A'
    });
  }
}


async function carregarReservas() {
  const tabela = document.getElementById("listaReservas");
  if (!tabela) return;

  tabela.innerHTML = `<tr><td colspan="5">Carregando reservas...</td></tr>`;

  try {
    const resp = await fetch("/api/reservas");
    const reservas = await resp.json();
    tabela.innerHTML = "";

    if (!reservas.length) {
      tabela.innerHTML = `<tr><td colspan="5">Nenhuma reserva encontrada.</td></tr>`;
      return;
    }

    reservas.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.nome_pessoa}</td>
        <td>${r.nome_equipamento}</td>
        <td>${r.data_reserva}</td>
        <td>${r.status}</td>
        <td>
          ${r.status === "Concluído"
            ? "<span style='color:gray;'>Finalizada</span>"
            : `<button class="btn-primario" onclick="devolverReserva(${r.id_reserva})">Finalizar</button>`}
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar reservas:", err);
    tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar reservas.</td></tr>`;
    Swal.fire({
      title: 'Erro!',
      text: 'Não foi possível carregar as reservas.',
      icon: 'error',
      confirmButtonColor: '#111D4A'
    });
  }
}

//função para enviar nova reserva
document.getElementById("formReserva").addEventListener("submit", async e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const id_equipamento = document.getElementById("equipamento").value;
  const data_reserva = document.getElementById("dataReserva").value;

  if (!nome || !id_equipamento || !data_reserva) {
    Swal.fire({
      title: 'Atenção!',
      text: 'Preencha todos os campos!',
      icon: 'warning',
      confirmButtonColor: '#111D4A'
    });
    return;
  }

  try {
    const resp = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_pessoa: nome,
        id_equipamento,
        data_reserva,
        status: "Ativo"
      })
    });

    const resultado = await resp.json();

    if (resp.ok) {
      await Swal.fire({
        title: 'Sucesso!',
        text: resultado.message || 'Reserva cadastrada com sucesso!',
        icon: 'success',
        confirmButtonColor: '#111D4A'
      });
      document.getElementById("formReserva").reset();
      carregarReservas();
      carregarCalendario();
    } else {
      Swal.fire({
        title: 'Erro!',
        text: 'Erro ao cadastrar reserva: ' + (resultado.error || 'Erro desconhecido'),
        icon: 'error',
        confirmButtonColor: '#111D4A'
      });
    }
  } catch (err) {
    console.error("Erro ao enviar reserva:", err);
    Swal.fire({
      title: 'Erro!',
      text: 'Erro ao cadastrar reserva. Verifique os dados e tente novamente.',
      icon: 'error',
      confirmButtonColor: '#111D4A'
    });
  }
});

async function devolverReserva(idReserva) {
  const result = await Swal.fire({
    title: 'Confirmação',
    text: 'Deseja concluir essa reserva?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#111D4A',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, concluir',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    const resp = await fetch(`/reservas/${idReserva}/devolver`, { method: "PUT" });
    const resultJson = await resp.json();

    if (resp.ok) {
      await Swal.fire({
        title: 'Sucesso!',
        text: resultJson.message || 'Reserva concluída com sucesso!',
        icon: 'success',
        confirmButtonColor: '#111D4A'
      });
      carregarReservas();
      carregarCalendario();
    } else {
      Swal.fire({
        title: 'Erro!',
        text: 'Erro: ' + (resultJson.error || 'Falha ao devolver reserva.'),
        icon: 'error',
        confirmButtonColor: '#111D4A'
      });
    }
  } catch (err) {
    console.error("Erro ao devolver reserva:", err);
    Swal.fire({
      title: 'Erro!',
      text: 'Erro ao devolver reserva.',
      icon: 'error',
      confirmButtonColor: '#111D4A'
    });
  }
}


//função para analisar datas em múltiplos formatos
function parseDateFlexible(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed) ? null : parsed;
}

async function carregarCalendario() {
  const container = document.getElementById("calendario");
  const tituloMes = document.getElementById("tituloMes");
  if (!container) return;
  container.innerHTML = "";

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (tituloMes) tituloMes.textContent = `${nomesMeses[mesAtual]} de ${anoAtual}`;

  const inicioMes = new Date(anoAtual, mesAtual, 1);
  const fimMes = new Date(anoAtual, mesAtual + 1, 0);
  const totalDias = fimMes.getDate();

  const reservasPorDia = new Map();

  try {
    const resp = await fetch("/api/reservas");
    if (!resp.ok) throw new Error("Falha ao buscar reservas");

    const reservas = await resp.json();

    reservas.forEach(r => {
      const data = parseDateFlexible(r.data_reserva);
      if (!data) return;

      if (r.status !== "Concluído" && data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
        const dia = data.getDate();
        const nome = r.nome_pessoa || "Reservado";
        if (!reservasPorDia.has(dia)) reservasPorDia.set(dia, []);
        reservasPorDia.get(dia).push(nome);
      }
    });
  } catch (err) {
    console.error("Erro ao carregar reservas do calendário:", err);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const cel = document.createElement("div");
    cel.classList.add("dia");
    cel.textContent = dia;

    if (reservasPorDia.has(dia)) {
      cel.classList.add("indisponivel");
      cel.title = `Reservado por: ${reservasPorDia.get(dia).join(", ")}`;
    }

    container.appendChild(cel);
  }
}

function mudarMes(offset) {
  mesAtual += offset;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  } else if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  carregarCalendario();
}

document.getElementById("buscarReserva").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  document.querySelectorAll("#listaReservas tr").forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? "" : "none";
  });
});


document.getElementById("btnPrev").addEventListener("click", () => mudarMes(-1));
document.getElementById("btnNext").addEventListener("click", () => mudarMes(1));


document.addEventListener("DOMContentLoaded", () => {
  carregarEquipamentos();
  carregarReservas();
  carregarCalendario();
});

