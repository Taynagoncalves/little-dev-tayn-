// ==================== EDITAR EQUIPAMENTO ====================

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEditarEquipamento");
  const preview = document.getElementById("preview");
  const categoriaSelect = document.getElementById("id_categoria");

  // Função para obter o ID da URL
  function getEquipamentoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  const equipamentoId = getEquipamentoId();
  if (!equipamentoId) {
    alert("Nenhum equipamento selecionado para edição!");
    window.location.href = "equipamentos.html";
    return;
  }

  // ==================== Carregar Categorias ====================
  async function carregarCategorias() {
    try {
      const res = await fetch("/categorias");
      const categorias = await res.json();
      categoriaSelect.innerHTML = "";
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id_categoria;
        opt.textContent = cat.nome_categoria;
        categoriaSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  }

  // ==================== Carregar Dados do Equipamento ====================
  async function carregarEquipamento() {
    try {
      const res = await fetch(`/equipamentos/${equipamentoId}`);
      const equipamento = await res.json();

      if (!equipamento || equipamento.error) {
        alert("Equipamento não encontrado!");
        window.location.href = "equipamentos.html";
        return;
      }

      document.getElementById("nome").value = equipamento.nome;
      document.getElementById("codigo").value = equipamento.codigo;
      document.getElementById("valor_agregado").value = equipamento.valor_agregado;
      categoriaSelect.value = String(equipamento.id_categoria);

      // Exibir imagem, se existir
      if (equipamento.dados && equipamento.tipo_mime) {
        const base64 = arrayBufferToBase64(equipamento.dados.data);
        preview.src = `data:${equipamento.tipo_mime};base64,${base64}`;
      } else {
        preview.src = "../imagens/placeholder.png";
      }
    } catch (err) {
      console.error("Erro ao carregar equipamento:", err);
    }
  }

  // ==================== Converter buffer em Base64 ====================
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // ==================== Atualizar Equipamento ====================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch(`/equipamentos/${equipamentoId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Equipamento atualizado com sucesso!");
        window.location.href = "equipamentos.html";
      } else {
        alert(result.error || "Erro ao atualizar equipamento.");
      }
    } catch (err) {
      console.error("Erro ao enviar atualização:", err);
      alert("Erro ao conectar com o servidor.");
    }
  });

  // ==================== Inicialização ====================
  await carregarCategorias();
  await carregarEquipamento();
});
