document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const nome = form.nome.value.trim();
        const email = form.email.value.trim();
        const senha = form.senha.value.trim();
        const confirmarSenha = form["confirmar-senha"].value.trim();
        const dataNascimento = form["data-nascimento"].value;

        // Validação do Nome Completo (NOVO)
        if (!/^[A-Za-zÀ-ÿ ]+$/.test(nome)) {
            alert("Por favor, insira um nome válido (apenas letras e espaços).");
            return;
        }

        // Validação da data de nascimento (12 anos ou mais)
        if (!validarDataNascimento(dataNascimento)) {
            alert("Você deve ter entre 12 a 90 anos para se cadastrar.");
            return;
        }

        // Validação da senha
        if (!validarSenha(senha)) {
            alert("A senha deve conter:\n- Pelo menos 1 letra maiúscula\n- Pelo menos 1 caractere especial (@$!%*?&#._-)\n- Mínimo de 6 caracteres");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
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
            
            if (response.ok) {
                // Armazena os dados
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                
                // Força a escrita no sessionStorage antes de redirecionar
                sessionStorage.setItem('__redirectCheck', 'true');
                
                // Redireciona após garantir o armazenamento
                setTimeout(() => {
                    window.location.href = "questionarioInicial.html";
                }, 50); 
            } else {
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            alert("Erro ao se conectar ao servidor.");
            console.error("Erro:", error);
        }
    });

    // Função de validação de senha
    function validarSenha(senha) {
        // Verifica se tem pelo menos 1 letra maiúscula e 1 caractere especial
        const regex = /^(?=.*[A-Z])(?=.*[@$!%*?&#._-]).+$/;
        // Tamanho mínimo de 6 caracteres
        const tamanhoMinimo = senha.length >= 6;
        
        return regex.test(senha) && tamanhoMinimo;
    }

    // Função de validação de data de nascimento (12 anos ou mais)
    function validarDataNascimento(dataNascimento) {
        // Se não houver data selecionada, retorna falso
        if (!dataNascimento) return false;
        
        // Cria objeto Date com a data de nascimento informada
        const dataNasc = new Date(dataNascimento);
        // Obtém a data atual
        const hoje = new Date();
        
        // Calcula a idade subtraindo os anos
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        
        // Obtém o mês e dia atual (0-11 para meses)
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        
        // Verifica se o aniversário já ocorreu este ano:
        // Compara o mês atual com o mês de nascimento OU
        // Se for o mesmo mês, compara o dia atual com o dia de nascimento
        if (mesAtual < dataNasc.getMonth() || 
           (mesAtual === dataNasc.getMonth() && diaAtual < dataNasc.getDate())) {
            // Se o aniversário ainda não ocorreu, subtrai 1 da idade
            idade--;
        }
        
        // Retorna true se a idade for 12 ou mais
        return idade >= 12 && idade <= 90;
    }
});