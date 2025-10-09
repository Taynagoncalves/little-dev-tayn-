document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formEquipamento");
    const categoriaSelect = document.getElementById("categoriaSelect");
  
   
    const categorias = await fetch("/categorias").then(r => r.json());
    categoriaSelect.innerHTML = categorias
      .map(c => `<option value="${c.id_categoria}">${c.nome_categoria}</option>`)
      .join('');
  
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
  
      const resp = await fetch("/equipamentos", {
        method: "POST",
        body: formData
      });
  
      if (resp.ok) {
        alert("Equipamento adicionado com sucesso!");
        window.location.href = "equipamentos.html";
      } else {
        alert("Erro ao adicionar equipamento.");
      }
    });
  });
  