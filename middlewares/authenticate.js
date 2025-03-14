import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_KEY;

export function authenticate(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // O token geralmente é enviado como "Bearer <token>"

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token não fornecido' });
    }

    // Verificar o token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }

        req.user = decoded; // Armazenar as informações do usuário decodificadas no request
        next(); // Passar o controle para a próxima função
    });
}