import banco from '../config/database.js';

// Verifica se o usuário já respondeu o questionário hoje
export async function verificarQuestionarioDiario(req, res) {
    const { usuario_id } = req.params;

    try {
        const resultado = await banco.query(`
            SELECT id FROM questionarios 
            WHERE usuario_id = $1 AND data = CURRENT_DATE
        `, [usuario_id]);

        res.status(200).json({
            success: true,
            ja_respondido: resultado.rows.length > 0
        });
    } catch (error) {
        console.error('Erro ao verificar questionario diario:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar questionario diario',
            error: error.message
        });
    }
}

// Obtém as perguntas do questionário diário (ID >= 11)
export async function getPerguntasDiarias(req, res) {
    try {
        const perguntas = await banco.query(`
            SELECT p.id, p.texto, 
                   json_agg(json_build_object(
                       'id', a.id, 
                       'texto', a.texto, 
                       'pontuacao', a.pontuacao
                   )) as alternativas
            FROM perguntas p
            JOIN alternativas a ON p.id = a.pergunta_id
            WHERE p.id >= 11
            GROUP BY p.id
            ORDER BY p.id
        `);
        
        res.status(200).json({
            success: true,
            perguntas: perguntas.rows
        });
    } catch (error) {
        console.error('Erro ao buscar perguntas diarias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar perguntas diarias',
            error: error.message
        });
    }
}

// Salva as respostas do questionário diário
export async function salvarRespostasDiarias(req, res) {
    const { usuario_id, respostas } = req.body;

    try {
        // Verifica se o usuário já respondeu hoje
        const verificar = await banco.query(`
            SELECT id FROM questionarios
            WHERE usuario_id = $1 AND data = CURRENT_DATE
        `, [usuario_id]);

        if (verificar.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Voce ja respondeu o questionario hoje'
            });
        }

        // Cria um novo questionário diário
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id, data, tipo) VALUES ($1, CURRENT_DATE, $2) RETURNING id',
            [usuario_id, 'diario']
        );
        const questionario_id = questionario.rows[0].id;

        // Insere cada resposta
        for (const resposta of respostas) {
            await banco.query(
                `INSERT INTO respostas 
                (usuario_id, pergunta_id, alternativa_id, questionario_id) 
                VALUES ($1, $2, $3, $4)`,
                [usuario_id, resposta.pergunta_id, resposta.alternativa_id, questionario_id]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Questionario diario respondido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao salvar respostas diarias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar respostas diarias',
            error: error.message
        });
    }
} 