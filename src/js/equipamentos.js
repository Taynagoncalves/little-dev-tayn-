document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaEquipamentos");
    const categoriaSelect = document.getElementById("categoria");
    const btnAdicionar = document.getElementById("btnAdicionar");
  
    // carregar categorias
    const categorias = await fetch("/categorias").then(r => r.json());
    categoriaSelect.innerHTML = `<option value="">Categoria</option>` +
      categorias.map(c => `<option value="${c.id_categoria}">${c.nome_categoria}</option>`).join('');
  
    // carregar equipamentos
    async function carregarEquipamentos() {
      const equipamentos = await fetch("/equipamentos").then(r => r.json());
      lista.innerHTML = equipamentos.map(eq => `
        <div class="card-equipamento">
          <img src="data:${eq.tipo_mine};base64,${btoa(
            new Uint8Array(eq.dados.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
          )}" alt="${eq.nome}">
          <h3>${eq.nome}</h3>
          <p>${eq.nome_categoria}</p>
          <p>CÓDIGO: ${eq.codigo}</p>
          <span class="status ${eq.disponibilidade.toLowerCase()}">${eq.disponibilidade}</span>
          <div class="acoes">
            <button class="editar">Editar</button>
            <button class="excluir">Excluir</button>
          </div>
        </div>
      `).join('');
    }
  
    carregarEquipamentos();
  
    // redirecionar para página de cadastro
    btnAdicionar.addEventListener("click", () => {
      window.location.href = "adicionarEquipamento.html";
    });
  });
  