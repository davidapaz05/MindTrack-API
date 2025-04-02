document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = form.email.value;
        const senha = form.senha.value;

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    // Fallback seguro
                    window.location.href = data.user.questionario_inicial ? '/public/index.html' : '/public/questionarioInicial.html';
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Erro ao conectar-se ao servidor. Verifique sua conexão.");
        }
    });
});