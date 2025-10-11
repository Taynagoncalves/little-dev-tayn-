document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipamento");
  const categoriaSelect = document.getElementById("categoriaSelect");

  try {
    const response = await fetch("/categorias");
    if (!response.ok) throw new Error("Erro ao carregar categorias");
    const categorias = await response.json();

    categoriaSelect.innerHTML = categorias
      .map(c => `<option value="${c.id_categoria}">${c.nome_categoria}</option>`)
      .join("");
  } catch (error) {
    alert("Erro ao carregar categorias.");
    console.error(error);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const resp = await fetch("/equipamentos", {
        method: "POST",
        body: formData
      });

      if (resp.ok) {
        alert("✅ Equipamento adicionado com sucesso!");
        window.location.href = "equipamentos.html";
      } else {
        const text = await resp.text();
        console.error("Erro do servidor:", text);
        alert("❌ Erro ao adicionar equipamento. Verifique o servidor.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Falha ao conectar com o servidor.");
    }
  });
});
