import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import banco from '../config/database.js';

const SECRET_KEY = process.env.JWT_KEY;

export async function register(req, res) {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem' });
    }

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email já registrado' });
        }

        // Criptografar senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Inserir usuário no banco
        const novoUsuario = await banco.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, senhaCriptografada]
        );

        const user = novoUsuario.rows[0];

        // Gerar o token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            message: 'Registro bem-sucedido',
            user,
            token, // Retorna o token direto no registro
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao registrar o usuário', error: error.message });
    }
}

export async function login(req, res) {
    const { email, senha } = req.body;

    try {
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(400).json({ success: false, message: 'Email não encontrado' });

        const user = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) return res.status(400).json({ success: false, message: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        
        return res.status(200).json({success: true, message: 'Login bem-sucedido', user, token,});

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar o usuário', error: error.message });
    }
}