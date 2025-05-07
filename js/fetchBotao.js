import { verificarQuestionarioDiario } from './verificarQuestionarioDiario.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!token || !user) {
        document.getElementById('questionarioBtn').disabled = true;
        document.getElementById('mensagemQuestionario').textContent = 'Faça login para responder o questionário diário.';
        return;
    }
    const jaRespondido = await verificarQuestionarioDiario(user.id, token);
    const btn = document.getElementById('questionarioBtn');
    const msg = document.getElementById('mensagemQuestionario');
    if (jaRespondido) {
        btn.disabled = true;
        msg.textContent = 'Você já respondeu o questionário diário hoje.';
    } else {
        btn.disabled = false;
        btn.onclick = () => window.location.href = '/public/questionarioDiario.html';
    }
}); 