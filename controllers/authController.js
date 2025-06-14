// Importa o pacote bcrypt para criptografar senhas
import bcrypt from 'bcrypt';
// Importa o pacote jsonwebtoken para gerar e verificar tokens JWT
import jwt from 'jsonwebtoken';
// Importa a configuração do banco de dados
import banco from '../config/database.js';
import transporter from '../config/emailConfig.js';
import dotenv from 'dotenv';
import { emailTemplates } from '../templates/emailTemplates.js';
dotenv.config();
// Chave secreta usada para assinar os tokens JWT
const SECRET_KEY = process.env.JWT_KEY;

// Função para registrar um novo usuário
// Gera um código de verificação de 4 dígitos
function gerarCodigoVerificacao() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Função para registrar um novo usuário
export async function register(req, res) {
    const { nome, email, senha, confirmarSenha, data_nascimento } = req.body;

    if (!nome || !email || !senha || !confirmarSenha || !data_nascimento) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios para o registro' 
        });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({ 
            success: false, 
            message: 'As senhas não coincidem. Por favor, verifique e tente novamente.' 
        });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Este e-mail já está cadastrado em nossa plataforma. Por favor, utilize outro e-mail ou faça login.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const codigoVerificacao = gerarCodigoVerificacao();

        try {
            await transporter.sendMail({
                from: `"MindTracking" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Código de Verificação - MindTracking',
                html: emailTemplates.verificationCode(codigoVerificacao),
                text: `Seu código de verificação é: ${codigoVerificacao} use-o para verificar seu e-mail. Se você não solicitou este código, ignore este e-mail. Atenciosamente, Equipe MindTracking.`
            });
        } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Não foi possível enviar o e-mail de verificação. Por favor, tente novamente mais tarde.'
            });
        }

        const novoUsuario = await banco.query(
            'INSERT INTO usuarios (nome, email, senha, data_nascimento, questionario_inicial, email_verificado, codigo_verificacao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nome, email, data_nascimento, questionario_inicial',
            [nome, email, senhaCriptografada, data_nascimento, false, false, codigoVerificacao]
        );

        const user = novoUsuario.rows[0];

        return res.status(201).json({
            success: true,
            message: 'Código de verificação enviado para o e-mail. Verifique sua caixa de entrada para concluir o registro.',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                data_nascimento: user.data_nascimento,
                questionario_inicial: user.questionario_inicial
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        if (error.code === '23505') { // Código de erro de violação de chave única
            return res.status(400).json({
                success: false,
                message: 'Este e-mail já está cadastrado em nossa plataforma.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Função para verificar o código de e-mail
export async function verifyEmail(req, res) {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({
            success: false,
            message: 'E-mail e código de verificação são obrigatórios'
        });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado. Verifique se o e-mail está correto.' 
            });
        }

        const user = rows[0];
        if (user.email_verificado) {
            return res.status(400).json({ 
                success: false, 
                message: 'Este e-mail já foi verificado anteriormente. Você pode prosseguir com o login.' 
            });
        }

        if (user.codigo_verificacao !== codigo) {
            return res.status(400).json({ 
                success: false, 
                message: 'Código de verificação inválido. Por favor, verifique o código recebido no seu e-mail.' 
            });
        }

        await banco.query(
            'UPDATE usuarios SET email_verificado = true, codigo_verificacao = null WHERE email = $1',
            [email]
        );

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'E-mail verificado com sucesso! Você já pode acessar sua conta.',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                questionario_inicial: user.questionario_inicial
            }
        });

    } catch (error) {
        console.error('Erro ao verificar e-mail:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocorreu um erro ao verificar seu e-mail. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Função para realizar o login de um usuário
export async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'E-mail e senha são obrigatórios para realizar o login'
        });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'E-mail não encontrado. Verifique se o e-mail está correto ou crie uma nova conta.' 
            });
        }

        const user = rows[0];
        
        if (!user.email_verificado) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, verifique seu e-mail antes de fazer login. Um código de verificação foi enviado para seu e-mail.'
            });
        }

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ 
                success: false, 
                message: 'Senha incorreta. Por favor, verifique sua senha e tente novamente.' 
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso! Bem-vindo(a) de volta.',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                questionario_inicial: user.questionario_inicial
            },
            token,
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Ocorreu um erro ao realizar o login. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function enviarCodigoRecuperacao(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'O e-mail é obrigatório para enviar o código de recuperação'
        });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'E-mail não encontrado. Verifique se o e-mail está correto.' 
            });
        }

        const codigo = gerarCodigoVerificacao();
        
        try {
            await banco.query('UPDATE usuarios SET codigo_recuperacao = $1, tentativas_recuperacao = 0 WHERE email = $2', [codigo, email]);
            
            await transporter.sendMail({
                from: `"MindTracking" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Código de Recuperação de Senha - MindTracking',
                html: emailTemplates.passwordRecovery(codigo),
                text: `Seu código de recuperação é: ${codigo}. Use este código para redefinir sua senha. Se você não solicitou esta recuperação, ignore este e-mail.`
            });

            return res.status(200).json({ 
                success: true, 
                message: 'Código de recuperação enviado com sucesso para seu e-mail.' 
            });
        } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Não foi possível enviar o e-mail de recuperação. Por favor, tente novamente mais tarde.'
            });
        }
    } catch (error) {
        console.error('Erro ao processar recuperação:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function verificarCodigoRecuperacao(req, res) {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({
            success: false,
            message: 'E-mail e código de recuperação são obrigatórios'
        });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'E-mail não encontrado. Verifique se o e-mail está correto.' 
            });
        }

        const user = rows[0];
        if (user.codigo_recuperacao !== codigo) {
            const tentativas = (user.tentativas_recuperacao || 0) + 1;
            await banco.query('UPDATE usuarios SET tentativas_recuperacao = $1 WHERE email = $2', [tentativas, email]);
            
            if (tentativas >= 3) {
                await banco.query('UPDATE usuarios SET codigo_recuperacao = null, tentativas_recuperacao = 0 WHERE email = $1', [email]);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Número máximo de tentativas excedido. Por favor, solicite um novo código de recuperação.' 
                });
            }
            
            return res.status(400).json({ 
                success: false, 
                message: `Código inválido. Você ainda tem ${3 - tentativas} tentativa(s) restante(s).` 
            });
        }

        await banco.query('UPDATE usuarios SET tentativas_recuperacao = 0 WHERE email = $1', [email]);
        return res.status(200).json({ 
            success: true, 
            message: 'Código válido. Você pode prosseguir com a redefinição de senha.' 
        });
    } catch (error) {
        console.error('Erro ao verificar código:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Ocorreu um erro ao verificar o código. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function redefinirSenha(req, res) {
    const { email, senha, confirmarSenha } = req.body;

    if (!email || !senha || !confirmarSenha) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios para redefinir a senha'
        });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({ 
            success: false, 
            message: 'As senhas não coincidem. Por favor, verifique e tente novamente.' 
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);
        
        await banco.query(
            'UPDATE usuarios SET senha = $1, codigo_recuperacao = null, tentativas_recuperacao = 0 WHERE email = $2',
            [senhaCriptografada, email]
        );

        return res.status(200).json({ 
            success: true, 
            message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' 
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Ocorreu um erro ao redefinir sua senha. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}