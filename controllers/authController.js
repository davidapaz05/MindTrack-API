// Importa o pacote bcrypt para criptografar senhas
import bcrypt from 'bcrypt';
// Importa o pacote jsonwebtoken para gerar e verificar tokens JWT
import jwt from 'jsonwebtoken';
// Importa a configuração do banco de dados
import banco from '../config/database.js';

// Chave secreta usada para assinar os tokens JWT
const SECRET_KEY = process.env.JWT_KEY;

// Função para registrar um novo usuário
export async function register(req, res) {
    // Extrai os dados do corpo da requisição
    const { nome, email, senha, confirmarSenha, data_nascimento } = req.body;

    // Verifica se as senhas coincidem
    if (senha !== confirmarSenha) {
        return res.status(400).json({ success: false, message: 'as senhas não coincidem' });
    }

    try {
        // Verifica se o email já está registrado no banco de dados
        const { rows } = await banco.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email já registrado' });
        }

        // Gera um salt para a criptografia da senha
        const salt = await bcrypt.genSalt(10);
        // Criptografa a senha do usuário
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // Insere o novo usuário no banco de dados
        const novoUsuario = await banco.query(
            'INSERT INTO usuarios (nome, email, senha, data_nascimento, questionario_inicial) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, data_nascimento, questionario_inicial',
            [nome, email, senhaCriptografada, data_nascimento, false]
        );

        // Obtém os dados do usuário recém-criado
        const user = novoUsuario.rows[0];

        // Gera um token JWT para o usuário
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        // Retorna uma resposta de sucesso com os dados do usuário e o token
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
        });

    } catch (error) {
        // Loga o erro no console e retorna uma resposta de erro
        console.error('Erro no registro:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao registrar o usuário', 
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