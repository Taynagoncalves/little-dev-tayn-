document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const idEmprestimo = params.get('id');

  const form = document.getElementById('formDevolucao');
  const voltarBtn = document.getElementById('voltarBtn');

  if (!idEmprestimo) {
    Swal.fire({
      title: 'Atenção!',
      text: 'Você precisa selecionar um empréstimo para devolver.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ir para Empréstimos', 
      cancelButtonText: 'Sair',                 
      confirmButtonColor: '#111D4A',
      cancelButtonColor: '#888',
      allowOutsideClick: false                 
    }).then((result) => {
      if (result.isConfirmed) {
       
        window.location.href = '/emprestimos';
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        
        window.location.href = '/dashboard';
      }
    });
  
    return;
  }
  

  try {
    // Buscar dados do empréstimo
    const res = await fetch(`/emprestimos/ativos`);
    const emprestimos = await res.json();
    const emprestimo = emprestimos.find(e => e.id_emprestimo == idEmprestimo);

    if (!emprestimo) {
      Toastify({
        text: 'Empréstimo não encontrado ou já devolvido.',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#E25A14',
        stopOnFocus: true,
        style: {
          borderRadius: '8px',
          fontSize: '14px'
      }
      }).showToast();

      setTimeout(() => {
        window.location.href = '/emprestimos';
      } , 3000);
      
      return;
    }

    document.getElementById('nomePessoa').value = emprestimo.nome_pessoa;
    document.getElementById('itemDevolvido').value = emprestimo.nome_equipamento;
    document.getElementById('codigo').value = emprestimo.codigo_equipamento;
    document.getElementById('dataDevolucao').value = new Date().toISOString().split('T')[0];

  } catch (err) {
     Toastify({
      text: ' Erro ao carregar dados do empréstimo.',
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#E25A14',
      stopOnFocus: true,
      style: {
        borderRadius: '8px',
        fontSize: '14px'
    }
    }).showToast();
      
    setTimeout(() => {
      window.location.href = '/emprestimos';
    });
  }

  // Enviar devolução
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const devolucaoData = {
      nome_pessoa: document.getElementById('nomePessoa').value,
      item_devolvido: document.getElementById('itemDevolvido').value,
      codigo: document.getElementById('codigo').value,
      data_devolucao: document.getElementById('dataDevolucao').value,
      estado_fisico: document.getElementById('estadoFisico').value,
      funcionalidade: document.getElementById('funcionalidade').value,
      condicoes: document.getElementById('condicoes').value,
      observacoes: document.getElementById('observacoes').value
    };

    try {
      const res = await fetch(`/emprestimos/${idEmprestimo}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devolucaoData)
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Devolução registrada com sucesso!',
          icon: 'success',
          confirmButtonColor: '#111D4A',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = '/emprestimos';
        });
      } else {
        Swal.fire({
          title: 'Erro!',
          text: 'Erro ao registrar devolução: ' + (result.error || 'Erro desconhecido'),
          icon: 'error',
          confirmButtonColor: '#111D4A',
          confirmButtonText: 'Tentar novamente'
        });
      }
    } catch (err) {
      console.error('Erro ao enviar devolução:', err);
      alert('Erro ao registrar devolução. Verifique os dados e tente novamente.');
    }
  });

  voltarBtn.addEventListener('click', () => {
    window.location.href = '/emprestimos';
  });
});
