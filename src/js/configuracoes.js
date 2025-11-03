document.addEventListener("DOMContentLoaded", () => {
  const modoEscuro = document.getElementById("modoEscuro");
  const modoDaltonico = document.getElementById("modoDaltonico");
  const tamanhoFonte = document.getElementById("tamanhoFonte");
  const ativarAlertas = document.getElementById("ativarAlertas");

  //Carregar configurações
  const dark = localStorage.getItem("modoEscuro") === "true";
  const daltonico = localStorage.getItem("modoDaltonico") === "true";
  const fonte = parseFloat(localStorage.getItem("tamanhoFonte")) || 1;
  const alertas = localStorage.getItem("ativarAlertas") === "true";

  modoEscuro.checked = dark;
  modoDaltonico.checked = daltonico;
  tamanhoFonte.value = fonte;
  ativarAlertas.checked = alertas;

  document.body.classList.toggle("dark", dark);
  document.body.classList.toggle("daltonico", daltonico);
  document.body.style.fontSize = `${fonte}em`;

 //modo escuro
modoEscuro.addEventListener("change", () => {
  localStorage.setItem("modoEscuro", modoEscuro.checked);
  document.body.classList.toggle("dark", modoEscuro.checked);
});

// modo daltônico 
modoDaltonico.addEventListener("change", () => {
  localStorage.setItem("modoDaltonico", modoDaltonico.checked);
  document.body.classList.toggle("daltonico", modoDaltonico.checked);
});

  // Fonte
  tamanhoFonte.addEventListener("input", () => {
    document.body.style.fontSize = `${tamanhoFonte.value}em`;
    localStorage.setItem("tamanhoFonte", tamanhoFonte.value);
  });


//Alertas
ativarAlertas.addEventListener("change", () => {
  localStorage.setItem("ativarAlertas", ativarAlertas.checked);
  if (ativarAlertas.checked) {
    Swal.fire({
      icon: 'success',
      title: 'Alertas ativados!',
      text: 'Você receberá notificações do sistema.',
      timer: 2500,
      timerProgressBar: true,
      confirmButtonColor: '#111D4A',
      confirmButtonText: 'Ok'
    });
  } else {
    Swal.fire({
      title: "Alertas desativados!",
      text: "Você não receberá notificações até reativar os alertas.",
      icon: "warning",
      confirmButtonColor: "#111D4A",
      confirmButtonText: "Entendido",
      timer: 2500,
      timerProgressBar: true,
  }
    );
  } 
}
);
});
