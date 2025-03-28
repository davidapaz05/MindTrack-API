import banco from '../config/database.js';

// Obter perguntas e alternativas
export async function getPerguntas(req, res) {
    console.log("Recebida requisição para /perguntas"); // Log de depuração
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
            GROUP BY p.id
            ORDER BY p.id
        `);
        
        console.log("Perguntas encontradas:", perguntas.rows.length); // Log de depuração
        
        res.status(200).json({
            success: true,
            perguntas: perguntas.rows
        });
    } catch (error) {
        console.error('Erro detalhado:', error); // Log mais detalhado
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor',
            error: error.message // Envia detalhes do erro
        });
    }
}

// Salvar respostas do question

export async function salvarRespostas(req, res) {
    const { usuario_id, respostas } = req.body;

    try {
        // 1. Criar registro do questionário
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id) VALUES ($1) RETURNING id',
            [usuario_id]
        );
        const questionario_id = questionario.rows[0].id;

        // 2. Inserir cada resposta
        for (const resposta of respostas) {
            await banco.query(
                `INSERT INTO respostas 
                (usuario_id, pergunta_id, alternativa_id, questionario_id) 
                VALUES ($1, $2, $3, $4)`,
                [usuario_id, resposta.pergunta_id, resposta.alternativa_id, questionario_id]
            );
        }

        // 3. Atualizar o status do questionário inicial
        await banco.query(
            'UPDATE usuarios SET questionario_inicial = TRUE WHERE id = $1',
            [usuario_id]
        );

        res.status(200).json({
            success: true,
            message: 'Questionário respondido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao salvar respostas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao salvar respostas',
            error: error.message
        });
    }
}