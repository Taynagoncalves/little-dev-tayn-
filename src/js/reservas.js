// ==================== CARREGAR EQUIPAMENTOS DISPONÍVEIS ====================
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
  }
}

// ==================== ENVIAR RESERVA ====================
document.getElementById("formReserva").addEventListener("submit", async e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const id_equipamento = document.getElementById("equipamento").value;
  const data_reserva = document.getElementById("dataReserva").value;

  if (!nome || !id_equipamento || !data_reserva) {
    alert("⚠️ Preencha todos os campos!");
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
      alert(resultado.message || "✅ Reserva cadastrada com sucesso!");
      document.getElementById("formReserva").reset();
      carregarReservas();
      carregarCalendario();
    } else {
      alert("❌ Erro ao cadastrar reserva: " + (resultado.error || "Erro desconhecido"));
    }
  } catch (err) {
    console.error("Erro ao enviar reserva:", err);
    alert("Erro ao cadastrar reserva. Verifique os dados e tente novamente.");
  }
});

// ==================== LISTAR RESERVAS ====================
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
            : `<button class="btn-primario" onclick="devolverReserva(${r.id_reserva})">Devolver</button>`}
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar reservas:", err);
    tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar reservas.</td></tr>`;
  }
}

// ==================== CALENDÁRIO DE RESERVAS ====================

// Função auxiliar para interpretar data corretamente
function parseDateFlexible(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;

  if (typeof dateStr === "string" && dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    const parsed = new Date(`${y}-${m}-${d}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

// Função principal do calendário
async function carregarCalendario() {
  const container = document.getElementById("calendario");
  if (!container) return;
  container.innerHTML = "";

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const fimMes = new Date(ano, mes + 1, 0);
  const totalDias = fimMes.getDate();

  const reservasPorDia = new Map();

  try {
    const resp = await fetch("/api/reservas");
    if (!resp.ok) throw new Error("Falha ao buscar reservas");

    const reservas = await resp.json();

    reservas.forEach(r => {
      const data = parseDateFlexible(r.data_reserva);
      if (!data) return;

      if (data.getMonth() === mes && data.getFullYear() === ano) {
        const dia = data.getDate();
        const nome = r.nome_pessoa || "Reservado";

        if (!reservasPorDia.has(dia)) reservasPorDia.set(dia, []);
        reservasPorDia.get(dia).push(nome);
      }
    });
  } catch (err) {
    console.error("Erro ao carregar reservas do calendário:", err);
  }

  // Gera os dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const cel = document.createElement("div");
    cel.classList.add("dia");
    cel.textContent = dia;

    if (reservasPorDia.has(dia)) {
      cel.classList.add("indisponivel");
      const nomes = reservasPorDia.get(dia).join(", ");
      cel.title = `Reservado por: ${nomes}`;
    }

    container.appendChild(cel);
  }
}

// ==================== FILTRO DE BUSCA ====================
document.getElementById("buscarReserva").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  document.querySelectorAll("#listaReservas tr").forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? "" : "none";
  });
});

// ==================== DEVOLVER RESERVA ====================
async function devolverReserva(idReserva) {
  if (!confirm("Deseja marcar esta reserva como devolvida?")) return;

  try {
    const resp = await fetch(`/reservas/${idReserva}/devolver`, { method: "PUT" });
    const result = await resp.json();

    if (resp.ok) {
      alert(result.message || "Reserva devolvida com sucesso!");
      carregarReservas();
      carregarCalendario();
    } else {
      alert("Erro: " + (result.error || "Falha ao devolver reserva."));
    }
  } catch (err) {
    console.error("Erro ao devolver reserva:", err);
    alert("Erro ao devolver reserva.");
  }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", () => {
  carregarEquipamentos();
  carregarReservas();
  carregarCalendario();
});
