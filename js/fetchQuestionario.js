document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));
    const container = document.getElementById("questionario-container");
    const form = document.getElementById("questionario-form");
    const btnAvancar = document.createElement("button");
    const btnVoltar = document.createElement("button");
    const btnEnviar = document.createElement("button");
    let perguntas = [];
    let indiceAtual = 0;
    let respostas = {};

    if (!token || !user) {
        window.location.href = "/login.html";
        return;
    }

    async function carregarPerguntas() {
        try {
            container.innerHTML = '<div class="loading">Carregando perguntas...</div>';
            const response = await fetch("http://localhost:3000/questionario/perguntas", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Erro desconhecido no servidor");

            perguntas = data.perguntas;
            exibirPergunta(indiceAtual);
        } catch (error) {
            console.error("Erro detalhado:", error);
            container.innerHTML = `
                <div class="error">
                    <p>Erro ao carregar perguntas</p>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Tentar novamente</button>
                </div>
            `;
        }
    }

    function exibirPergunta(indice) {
        container.innerHTML = '';
        const pergunta = perguntas[indice];
        const perguntaDiv = document.createElement("div");
        perguntaDiv.className = "pergunta";
        perguntaDiv.innerHTML = `
            <h3>${indice + 1}. ${pergunta.texto}</h3>
            <div class="alternativas">
                ${pergunta.alternativas.map(alt => `
                    <div class="alternativa">
                        <input type="radio" id="p${pergunta.id}a${alt.id}" name="pergunta_${pergunta.id}" value="${alt.id}" 
                        ${respostas[pergunta.id] === alt.id ? "checked" : ""} required>
                        <label for="p${pergunta.id}a${alt.id}">${alt.texto}</label>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(perguntaDiv);
    }

    function salvarRespostaAtual() {
        const selecionado = document.querySelector(`input[name="pergunta_${perguntas[indiceAtual].id}"]:checked`);
        if (selecionado) {
            respostas[perguntas[indiceAtual].id] = parseInt(selecionado.value);
        }
    }

    btnAvancar.textContent = "Avançar";
    btnAvancar.addEventListener("click", function () {
        salvarRespostaAtual();
        if (indiceAtual < perguntas.length - 1) {
            indiceAtual++;
            exibirPergunta(indiceAtual);
        }
    });

    btnVoltar.textContent = "Voltar";
    btnVoltar.addEventListener("click", function () {
        salvarRespostaAtual();
        if (indiceAtual > 0) {
            indiceAtual--;
            exibirPergunta(indiceAtual);
        }
    });

    btnEnviar.textContent = "Enviar Respostas";
    btnEnviar.type = "submit";

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        salvarRespostaAtual();
    
        const respostasArray = perguntas.map(pergunta => ({
            pergunta_id: pergunta.id,
            alternativa_id: respostas[pergunta.id] || null
        }));
    
        if (respostasArray.some(r => r.alternativa_id === null)) {
            alert("Por favor, responda todas as perguntas!");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3000/questionario/responder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ usuario_id: user.id, respostas: respostasArray })
            });
    
            const data = await response.json();
            if (data.success) {
                user.questionario_inicial = true;
                sessionStorage.setItem("user", JSON.stringify(user));
    
                // Espera 1 segundo antes de buscar a pontuação
                setTimeout(async () => {
                    try {
                        const pontuacaoRes = await fetch(`http://localhost:3000/questionario/pontuacao/${user.id}`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
    
                        const pontuacaoData = await pontuacaoRes.json();
    
                        if (pontuacaoData.success) {
                            console.log("Pontuação:", pontuacaoData.pontuacao_total);
                            console.log("Nível:", pontuacaoData.nivel);
                            // alert(`Sua pontuação: ${pontuacaoData.pontuacao_total} - Nível: ${pontuacaoData.nivel}`);
                        } else {
                            console.warn("Pontuação não encontrada ou erro:", pontuacaoData.message);
                        }
    
                        // Redireciona após tentar buscar pontuação
                        window.location.href = "http://localhost:3000/index.html";
    
                    } catch (erroPontuacao) {
                        console.error("Erro ao buscar pontuação:", erroPontuacao);
                        window.location.href = "http://localhost:3000/index.html";
                    }
                }, 1000);
    
            } else {
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao enviar respostas");
        }
    });
    

    form.appendChild(btnVoltar);
    form.appendChild(btnAvancar);
    form.appendChild(btnEnviar);
    carregarPerguntas();
});
