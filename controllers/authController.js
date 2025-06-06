// Importa o pacote bcrypt para criptografar senhas
import bcrypt from 'bcrypt';
// Importa o pacote jsonwebtoken para gerar e verificar tokens JWT
import jwt from 'jsonwebtoken';
// Importa a configuração do banco de dados
import banco from '../config/database.js';
import transporter from '../config/emailConfig.js';
import dotenv from 'dotenv';
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

    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem' });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email já registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const codigoVerificacao = gerarCodigoVerificacao();

        await transporter.sendMail({
            from: `"MindTrack" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de Verificação - MindTrack',
            text: `Seu código de verificação é: ${codigoVerificacao} use-o para verificar seu e-mail.
            Se você não solicitou este código, ignore este e-mail.
            Atenciosamente, Equipe MindTrack.`,
        });

        const novoUsuario = await banco.query(
            'INSERT INTO usuarios (nome, email, senha, data_nascimento, questionario_inicial, email_verificado, codigo_verificacao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nome, email, data_nascimento, questionario_inicial',
            [nome, email, senhaCriptografada, data_nascimento, false, false, codigoVerificacao]
        );

        const user = novoUsuario.rows[0];

        return res.status(201).json({
            success: true,
            message: 'Código de verificação enviado para o e-mail. Verifique para concluir o registro.',
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
        return res.status(500).json({
            success: false,
            message: 'Erro ao registrar o usuário',
            error: error.message
        });
    }
}

// Função para verificar o código de e-mail
export async function verifyEmail(req, res) {
    const { email, codigo } = req.body;

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        const user = rows[0];
        if (user.email_verificado) {
            return res.status(400).json({ success: false, message: 'E-mail já verificado' });
        }

        if (user.codigo_verificacao !== codigo) {
            return res.status(400).json({ success: false, message: 'Código de verificação inválido' });
        }

        await banco.query(
            'UPDATE usuarios SET email_verificado = true, codigo_verificacao = null WHERE email = $1',
            [email]
        );

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'E-mail verificado com sucesso!',
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
            message: 'Erro ao verificar e-mail',
            error: error.message
        });
    }
}

// Função para realizar o login de um usuário
export async function login(req, res) {
    // Extrai os dados do corpo da requisição
    const { email, senha } = req.body;

    try {
        // Verifica se o email existe no banco de dados
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Email não encontrado' });
        }

        // Obtém os dados do usuário
        const user = rows[0];
        // Verifica se a senha fornecida está correta
        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ success: false, message: 'Senha incorreta' });
        }

        // Gera um token JWT para o usuário
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        // Retorna uma resposta de sucesso com os dados do usuário e o token
        return res.status(200).json({
            success: true,
            message: 'Login bem-sucedido',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                questionario_inicial: user.questionario_inicial
            },
            token,
        });

    } catch (error) {
        // Loga o erro no console e retorna uma resposta de erro
        console.error('Erro no login:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao realizar login',
            error: error.message 
        });
    }
}

export async function enviarCodigoRecuperacao(req, res) {
    const { email } = req.body;
    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'E-mail não encontrado' });
        }
        const codigo = gerarCodigoVerificacao();
        await banco.query('UPDATE usuarios SET codigo_recuperacao = $1 WHERE email = $2', [codigo, email]);
        await transporter.sendMail({
            from: `"MindTrack" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de Recuperação de Senha - MindTrack',
            text: `Seu código de recuperação é: ${codigo}`,
        });
        return res.status(200).json({ success: true, message: 'Código enviado para o e-mail' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao enviar código', error: error.message });
    }
}

export async function verificarCodigoRecuperacao(req, res) {
    const { email, codigo } = req.body;
    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'E-mail não encontrado' });
        }
        if (rows[0].codigo_recuperacao !== codigo) {
            return res.status(400).json({ success: false, message: 'Código inválido' });
        }
        return res.status(200).json({ success: true, message: 'Código válido' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao verificar código', error: error.message });
    }
}

export async function redefinirSenha(req, res) {
    const { email, senha, confirmarSenha } = req.body;
    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);
        await banco.query('UPDATE usuarios SET senha = $1, codigo_recuperacao = null WHERE email = $2', [senhaCriptografada, email]);
        return res.status(200).json({ success: true, message: 'Senha redefinida com sucesso' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao redefinir senha', error: error.message });
    }
}