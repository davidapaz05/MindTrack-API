// Importa a configuração do banco de dados
import banco from '../config/database.js';

// Função para obter a pontuação total de um usuário com base em suas respostas
export async function getPontuacaoUsuario(req, res) {
    // Extrai o ID do usuário dos parâmetros da requisição
    const { usuario_id } = req.params;

    try {
        // Consulta a pontuação total do usuário somando as pontuações das alternativas escolhidas
        const resultado = await banco.query(`
            SELECT COALESCE(SUM(a.pontuacao), 0) AS pontuacao_total
            FROM respostas r
            JOIN alternativas a ON r.alternativa_id = a.id
            WHERE r.usuario_id = $1
        `, [usuario_id]);

        // Obtém a pontuação total do resultado da consulta
        const pontuacao = resultado.rows[0].pontuacao_total;
        let nivel;

        // Define o nível do usuário com base na pontuação
        if (pontuacao <= 19) {
            nivel = "Ruim";
        } else if (pontuacao <= 29) {
            nivel = "Neutro";
        } else {
            nivel = "Bom";
        }

        // Retorna a pontuação total e o nível do usuário
        res.status(200).json({
            success: true,
            pontuacao_total: pontuacao,
            nivel: nivel
        });

    } catch (error) {
        // Loga o erro no console e retorna uma resposta de erro
        console.error("Erro ao calcular pontuação:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao calcular pontuação",
            error: error.message
        });
    }
}

// Função para obter todas as perguntas e suas alternativas
export async function getPerguntas(req, res) {
    console.log("Recebida requisição para /perguntas"); // Loga a requisição recebida
    try {
        // Verifica se é o questionário inicial (usando o parâmetro da query)
        const isQuestionarioInicial = req.query.questionario_inicial === 'true';
        
        // Consulta as perguntas e suas alternativas no banco de dados
        const perguntas = await banco.query(`
            SELECT p.id, p.texto, 
                   json_agg(json_build_object(
                       'id', a.id, 
                       'texto', a.texto, 
                       'pontuacao', a.pontuacao
                   )) as alternativas
            FROM perguntas p
            JOIN alternativas a ON p.id = a.pergunta_id
            WHERE $1 = false OR p.id <= 10
            GROUP BY p.id
            ORDER BY p.id
        `, [isQuestionarioInicial]);
        
        console.log("Perguntas encontradas:", perguntas.rows.length); // Loga a quantidade de perguntas encontradas
        
        // Retorna as perguntas e suas alternativas
        res.status(200).json({
            success: true,
            perguntas: perguntas.rows
        });
    } catch (error) {
        // Loga o erro no console e retorna uma resposta de erro
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor',
            error: error.message 
        });
    }
}

// Função para salvar as respostas de um usuário
export async function salvarRespostas(req, res) {
    // Extrai o ID do usuário e as respostas do corpo da requisição
    const { usuario_id, respostas } = req.body;

    try {
        // Cria um novo questionário para o usuário no banco de dados
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id) VALUES ($1) RETURNING id',
            [usuario_id]
        );
        const questionario_id = questionario.rows[0].id;

        // Insere cada resposta do usuário no banco de dados
        for (const resposta of respostas) {
            await banco.query(
                `INSERT INTO respostas 
                (usuario_id, pergunta_id, alternativa_id, questionario_id) 
                VALUES ($1, $2, $3, $4)`,
                [usuario_id, resposta.pergunta_id, resposta.alternativa_id, questionario_id]
            );
        }

        // Atualiza o status do questionário inicial do usuário para concluído
        await banco.query(
            'UPDATE usuarios SET questionario_inicial = TRUE WHERE id = $1',
            [usuario_id]
        );

        // Retorna uma resposta de sucesso
        res.status(200).json({
            success: true,
            message: 'Questionário respondido com sucesso'
        });

    } catch (error) {
        // Loga o erro no console e retorna uma resposta de erro
        console.error('Erro ao salvar respostas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao salvar respostas',
            error: error.message
        });
    }
}