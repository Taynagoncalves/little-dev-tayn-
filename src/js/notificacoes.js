document.addEventListener("DOMContentLoaded", () => {
    const btnNotificacoes = document.getElementById("btnNotificacoes");
    const painel = document.getElementById("painelNotificacoes");
    const lista = document.getElementById("listaNotificacoes");
    const contador = document.getElementById("contadorNotificacoes");

    // Criar botão Limpar notificações
    const btnLimpar = document.createElement("button");
    btnLimpar.textContent = "Limpar notificações";
    btnLimpar.style.marginTop = "10px";
    btnLimpar.style.cursor = "pointer";
    painel.appendChild(btnLimpar);
    

    btnNotificacoes.addEventListener("click", () => {
        painel.classList.toggle("oculto");
        if (!painel.classList.contains("oculto")) {
            contador.classList.add("contador-oculto");
        }
    });

    // Evento do botão limpar
    btnLimpar.addEventListener("click", async () => {
        const ids = [...lista.querySelectorAll("li")].map(li => li.dataset.id);
        await fetch("/notificacoes/limpar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
        });
    
        lista.innerHTML = "<li>Nenhuma notificação no momento.</li>";
        contador.textContent = "";
        contador.classList.add("contador-oculto");
    });
    
    

    async function carregarNotificacoes() {
        const alertasAtivos = localStorage.getItem("ativarAlertas") === "true";
        if (!alertasAtivos) {
            lista.innerHTML = "<li>🔕 Notificações desativadas.</li>";
            contador.classList.add("contador-oculto");
            return;
        }

        try {
            const [resEmp, resRes] = await Promise.all([
                fetch("/emprestimos/ativos"),
                fetch("/api/reservas")
            ]);

            const emprestimos = await resEmp.json();
            const reservas = await resRes.json();

            lista.innerHTML = "";

            const hoje = new Date();
            const atrasos = emprestimos.filter(e => {
                const [d, m, y] = e.data_prevista_devolucao.split("/");
                const data = new Date(y, m - 1, d);
                return data < hoje && e.status !== "Devolvido";
            });

            const novasReservas = reservas.filter(r => {
                const [d, m, y] = r.data_reserva.split("/");
                const data = new Date(y, m - 1, d);
                const diff = (hoje - data) / (1000 * 60 * 60 * 24);
                return diff <= 2 && r.status === "Ativo";
            });

            atrasos.forEach(a => {
                const li = document.createElement("li");
                li.textContent = `⚠️ Atraso: ${a.nome_pessoa} - ${a.nome_equipamento}`;
                li.classList.add("notificacao-atraso");
                li.addEventListener("click", () => {
                    painel.classList.add("oculto");
                    window.location.href = "/emprestimos";
                });
                lista.appendChild(li);
            });

            novasReservas.forEach(r => {
                const li = document.createElement("li");
                li.textContent = `📅 Nova reserva: ${r.nome_pessoa} - ${r.nome_equipamento}`;
                li.classList.add("notificacao-reserva");
                li.addEventListener("click", () => {
                    painel.classList.add("oculto");
                    window.location.href = "/reservas";
                });
                lista.appendChild(li);
            });

            const totalNotificacoes = atrasos.length + novasReservas.length;
            if (totalNotificacoes > 0) {
                contador.textContent = totalNotificacoes;
                contador.classList.remove("contador-oculto");
            } else {
                contador.classList.add("contador-oculto");
                lista.innerHTML = "<li>✅ Nenhuma notificação no momento.</li>";
            }

            if (totalNotificacoes > 0 && alertasAtivos) {
                Toastify({
                    text: `Você tem ${totalNotificacoes} nova(s) notificação(ões)`,
                    duration: 1000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#111D4A" }
                }).showToast();
            }

        } catch (err) {
            console.error("Erro ao carregar notificações:", err);
            lista.innerHTML = "<li>Erro ao carregar notificações.</li>";
        }
    }

    carregarNotificacoes();
    setInterval(carregarNotificacoes, 60000);
});
