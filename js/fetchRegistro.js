document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const nome = form.nome.value.trim();
        const email = form.email.value.trim();
        const senha = form.senha.value.trim();
        const confirmarSenha = form["confirmar-senha"].value.trim();
        const dataNascimento = form["data-nascimento"].value;

        const dados = { nome, email, senha, confirmarSenha, data_nascimento: dataNascimento };

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados) 
            });
            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "questionarioInicial.html";
            } else {
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            alert("Erro ao se conectar ao servidor.");
            console.error("Erro:", error);
        }
    });
});