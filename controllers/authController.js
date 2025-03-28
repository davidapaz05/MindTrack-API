import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import banco from '../config/database.js';

const SECRET_KEY = process.env.JWT_KEY;

export async function register(req, res) {
    const { nome, email, senha, confirmarSenha, data_nascimento } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'os senhas não coincidem' });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email já registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = await banco.query(
            'INSERT INTO usuarios (nome, email, senha, data_nascimento, questionario_inicial) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, data_nascimento, questionario_inicial',
            [nome, email, senhaCriptografada, data_nascimento, false]
        );

        const user = novoUsuario.rows[0];

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(201).json({
            success: true,
            message: 'Registro bem-sucedido',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                data_nascimento: user.data_nascimento,
                questionario_inicial: user.questionario_inicial
            },
            token,
            redirect: ('/pages/questionarioInicial.html')
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

export async function login(req, res) {
    const { email, senha } = req.body;

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Email não encontrado' });
        }

        const user = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ success: false, message: 'Senha incorreta' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

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
            redirect: user.questionario_inicial ? '/index.html' : '/questionarioInicial.html'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao realizar login',
            error: error.message 
        });
    }
}