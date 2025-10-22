const itensMenu = document.querySelectorAll('.menu li');

itensMenu.forEach(item => {
  item.addEventListener('click', () => {
 
    itensMenu.forEach(i => i.classList.remove('ativo'));
   
    item.classList.add('ativo');
  });
});

async function carregarResumo() {
  try {
    const res = await fetch('/dashboard/resumo');
    const data = await res.json();

    document.getElementById('total-equipamentos').textContent = data.equipamentos;
    document.getElementById('total-emprestimos').textContent = data.emprestimos;
    document.getElementById('total-atrasos').textContent = data.atrasos;
  } catch (err) {
    console.error('Erro ao carregar resumo do dashboard:', err);
  }
}

carregarResumo();