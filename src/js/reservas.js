// Carregar equipamentos disponíveis no select
async function carregarEquipamentos() {
  const select = document.getElementById("equipamento");
  try {
    const resp = await fetch("/equipamentos/disponiveis");
    const equipamentos = await resp.json();
    equipamentos.forEach(eq => {
      const option = document.createElement("option");
      option.value = eq.id_equipamento;
      option.textContent = eq.nome;
      select.appendChild(option);
    });
  } catch {
    console.error("Erro ao carregar equipamentos disponíveis.");
  }
}

// Enviar reserva
document.getElementById("formReserva").addEventListener("submit", async e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const id_equipamento = document.getElementById("equipamento").value;
  const data_reserva = document.getElementById("dataReserva").value;

  if (!nome || !id_equipamento || !data_reserva) {
    alert("Preencha todos os campos!");
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

    if (resp.ok) {
      alert("Reserva cadastrada com sucesso!");
      document.getElementById("formReserva").reset();
      carregarReservas();
      carregarCalendario();
    } else {
      alert("Erro ao cadastrar reserva.");
    }
  } catch (err) {
    console.error("Erro ao enviar reserva:", err);
  }
});

// Carregar reservas
async function carregarReservas() {
  try {
    const resp = await fetch("/api/reservas");
    const reservas = await resp.json();
    const tabela = document.getElementById("listaReservas");
    tabela.innerHTML = "";

    if (reservas.length === 0) {
      tabela.innerHTML = `<tr><td colspan="5">Nenhuma reserva encontrada</td></tr>`;
      return;
    }

    reservas.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.nome_pessoa}</td>
        <td>${r.nome_equipamento}</td>
        <td>${r.data_reserva}</td>
        <td>${r.status}</td>
        <td><button class="btn-primario" onclick="irParaDevolucao()">Devolver</button></td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar reservas:", err);
  }
}

// Calendário estilizado
async function carregarCalendario() {
  const container = document.getElementById("calendario");
  container.innerHTML = "";

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const inicioMes = new Date(ano, mes, 1);
  const fimMes = new Date(ano, mes + 1, 0);
  const totalDias = fimMes.getDate();

  let diasIndisponiveis = [];
  try {
    const resposta = await fetch("/api/reservas/datas");
    if (resposta.ok) {
      const datas = await resposta.json();
      diasIndisponiveis = datas.map(d => new Date(d.data_reserva).getDate());
    }
  } catch {}

  for (let dia = 1; dia <= totalDias; dia++) {
    const cel = document.createElement("div");
    cel.classList.add("dia");
    cel.textContent = dia;
    if (diasIndisponiveis.includes(dia)) cel.classList.add("indisponivel");
    container.appendChild(cel);
  }
}

// Filtro
document.getElementById("buscarReserva").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  document.querySelectorAll("#listaReservas tr").forEach(l => {
    const texto = l.textContent.toLowerCase();
    l.style.display = texto.includes(termo) ? "" : "none";
  });
});

function irParaDevolucao() {
  window.location.href = "/devolucoes";
}

document.addEventListener("DOMContentLoaded", () => {
  carregarEquipamentos();
  carregarReservas();
  carregarCalendario();
});
