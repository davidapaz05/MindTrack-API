document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault(); 

        const nome = document.getElementById('nome').value;
        const senha = document.getElementById('senha').value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, senha }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('nome', nome);
                window.location.href = data.redirectUrl;
            } else {
                alert('Erro: ' + (data.message || 'Falha no login'));
            }
        })
        .catch(error => console.error('Erro:', error));
    });
});