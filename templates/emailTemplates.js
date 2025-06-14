export const emailTemplates = {
    verificationCode: (codigo) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .code {
                    background-color: #e9ecef;
                    padding: 15px;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #2c3e50;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Bem-vindo(a) ao MindTracking!</h2>
                </div>
                <p>Olá!</p>
                <p>Obrigado por se cadastrar no MindTracking. Para verificar seu e-mail e começar a usar nossa plataforma, use o código abaixo:</p>
                <div class="code">${codigo}</div>
                <p>Se você não solicitou este código, por favor, ignore este e-mail.</p>
                <div class="footer">
                    <p>Atenciosamente,<br>Equipe MindTrack</p>
                </div>
            </div>
        </body>
        </html>
    `,

    passwordRecovery: (codigo) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .code {
                    background-color: #e9ecef;
                    padding: 15px;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #2c3e50;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeeba;
                    color: #856404;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Recuperação de Senha - MindTracking</h2>
                </div>
                <p>Olá!</p>
                <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para prosseguir com a recuperação:</p>
                <div class="code">${codigo}</div>
                <div class="warning">
                    <p>Se você não solicitou a recuperação de senha, por favor, ignore este e-mail e mantenha sua senha atual.</p>
                </div>
                <div class="footer">
                    <p>Atenciosamente,<br>Equipe MindTracking</p>
                </div>
            </div>
        </body>
        </html>
    `
}; 