// tema.js — aplica o modo escuro/daltônico globalmente
document.addEventListener("DOMContentLoaded", () => {
  const dark = localStorage.getItem("modoEscuro") === "true";
  const daltonico = localStorage.getItem("modoDaltonico") === "true";
  const fonte = parseFloat(localStorage.getItem("tamanhoFonte")) || 1;

  // Aplica tema global
  document.body.classList.toggle("dark", dark);
  document.body.classList.toggle("daltonico", daltonico);
  document.body.style.fontSize = `${fonte}em`;
});
