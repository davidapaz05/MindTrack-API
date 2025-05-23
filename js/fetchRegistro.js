document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const verificationForm = document.getElementById("verificationForm");
    const verificationCodeInput = document.getElementById("verificationCode");
    let userEmail = '';

    // Função para mostrar/esconder formulários
    function toggleForms() {
        form.classList.toggle("hidden");
        verificationForm.classList.toggle("hidden");
    }

    // Função para mostrar mensagem de erro
    function showError(message) {
        const errorDiv = document.getElementById("errorMessage");
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove("hidden");
        } else {
            alert(message);
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const nome = form.nome.value.trim();
        const email = form.email.value.trim();
        const senha = form.senha.value.trim();
        const confirmarSenha = form["confirmar-senha"].value.trim();
        const dataNascimento = form["data-nascimento"].value;

        // Validação do Nome Completo
        if (!/^[A-Za-zÀ-ÿ ]+$/.test(nome)) {
            showError("Por favor, insira um nome válido (apenas letras e espaços).");
            return;
        }

        // ✅ Validação do e-mail (permitir apenas domínios públicos)
        if (!validarEmailPublico(email)) {
            showError("Por favor, use um e-mail público válido (gmail, outlook, hotmail, etc).");
            return;
        }

        // Validação da data de nascimento
        if (!validarDataNascimento(dataNascimento)) {
            showError("Você deve ter entre 12 a 90 anos para se cadastrar.");
            return;
        }

        // Validação da senha
        if (!validarSenha(senha)) {
            showError("A senha deve conter:\n- Pelo menos 1 letra maiúscula\n- Pelo menos 1 caractere especial (@$!%*?&#._-)\n- Mínimo de 6 caracteres");
            return;
        }

        if (senha !== confirmarSenha) {
            showError("As senhas não coincidem!");
            return;
        }

        const dados = { 
            nome, 
            email, 
            senha, 
            confirmarSenha, 
            data_nascimento: dataNascimento 
        };

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados) 
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                userEmail = email;
                // Atualiza a mensagem de verificação com o email do usuário
                const verificationMessage = document.getElementById("verificationEmail");
                if (verificationMessage) {
                    verificationMessage.textContent = `Digite o código de verificação enviado para ${email}`;
                }
                toggleForms();
            } else {
                showError(data.message || "Erro ao registrar usuário");
            }
        } catch (error) {
            showError("Erro ao se conectar ao servidor.");
            console.error("Erro:", error);
        }
    });

    // Adiciona o evento de submit para o formulário de verificação
    if (verificationForm) {
        verificationForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            const codigo = verificationCodeInput.value.trim();
            
            if (!codigo) {
                showError("Por favor, insira o código de verificação");
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: userEmail,
                        codigo: codigo
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    sessionStorage.setItem("token", data.token);
                    sessionStorage.setItem("user", JSON.stringify(data.user));
                    sessionStorage.setItem('__redirectCheck', 'true');

                    setTimeout(() => {
                        window.location.href = "questionarioInicial.html";
                    }, 50);
                } else {
                    showError(data.message || "Código de verificação inválido");
                }
            } catch (error) {
                showError("Erro ao se conectar ao servidor.");
                console.error("Erro:", error);
            }
        });
    }

    function validarSenha(senha) {
        const regex = /^(?=.*[A-Z])(?=.*[@$!%*?&#._-]).+$/;
        return regex.test(senha) && senha.length >= 6;
    }

    function validarDataNascimento(dataNascimento) {
        if (!dataNascimento) return false;
        const dataNasc = new Date(dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();

        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        if (mesAtual < dataNasc.getMonth() || 
           (mesAtual === dataNasc.getMonth() && diaAtual < dataNasc.getDate())) {
            idade--;
        }
        return idade >= 12 && idade <= 90;
    }

    function validarEmailPublico(email) {
        const dominiosPublicos = [
            'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
            'icloud.com', 'aol.com', 'live.com', 'bol.com.br',
            'uol.com.br', 'zipmail.com.br', 'terra.com.br'
        ];

        const regexEmail = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
        const match = email.match(regexEmail);
        if (!match) return false;

        const dominio = match[1].toLowerCase();
        return dominiosPublicos.includes(dominio);
    }
});
