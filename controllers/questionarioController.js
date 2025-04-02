import banco from '../config/database.js';

export async function getPontuacaoUsuario(req, res) {
    const { usuario_id } = req.params;

    try {
        const resultado = await banco.query(`
            SELECT COALESCE(SUM(a.pontuacao), 0) AS pontuacao_total
            FROM respostas r
            JOIN alternativas a ON r.alternativa_id = a.id
            WHERE r.usuario_id = $1
        `, [usuario_id]);

        const pontuacao = resultado.rows[0].pontuacao_total;
        let nivel;

        if (pontuacao <= 19) {
            nivel = "Ruim";
        } else if (pontuacao <= 29) {
            nivel = "Neutro";
        } else {
            nivel = "Bom";
        }

        res.status(200).json({
            success: true,
            pontuacao_total: pontuacao,
            nivel: nivel
        });

    } catch (error) {
        console.error("Erro ao calcular pontuação:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao calcular pontuação",
            error: error.message
        });
    }
}
export async function getPerguntas(req, res) {
    console.log("Recebida requisição para /perguntas"); 
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
        
        console.log("Perguntas encontradas:", perguntas.rows.length); 
        
        res.status(200).json({
            success: true,
            perguntas: perguntas.rows
        });
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor',
            error: error.message 
        });
    }
}

export async function salvarRespostas(req, res) {
    const { usuario_id, respostas } = req.body;

    try {
        
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id) VALUES ($1) RETURNING id',
            [usuario_id]
        );
        const questionario_id = questionario.rows[0].id;

        for (const resposta of respostas) {
            await banco.query(
                `INSERT INTO respostas 
                (usuario_id, pergunta_id, alternativa_id, questionario_id) 
                VALUES ($1, $2, $3, $4)`,
                [usuario_id, resposta.pergunta_id, resposta.alternativa_id, questionario_id]
            );
        }

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