// Importa a configuração do banco de dados
import banco from '../config/database.js';

// Função para obter a pontuação total de um usuário com base em suas respostas
export async function getPontuacaoUsuario(req, res) {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            message: 'ID do usuário não fornecido. Por favor, forneça um ID válido.'
        });
    }

    try {
        // Verifica se o usuário existe
        const usuarioExiste = await banco.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado. Verifique se o ID está correto.'
            });
        }

        // Consulta a pontuação total do usuário somando as pontuações das alternativas escolhidas
        const resultado = await banco.query(`
            SELECT 
                COALESCE(SUM(a.pontuacao), 0) AS pontuacao_total,
                COUNT(DISTINCT r.questionario_id) as total_questionarios
            FROM respostas r
            JOIN alternativas a ON r.alternativa_id = a.id
            WHERE r.usuario_id = $1
        `, [usuario_id]);

        // Obtém a pontuação total e o número de questionários do resultado da consulta
        const pontuacao = resultado.rows[0].pontuacao_total;
        const totalQuestionarios = resultado.rows[0].total_questionarios;
        const pontuacaoMaxima = totalQuestionarios * 40; // Máximo possível baseado no número de questionários
        const nota_convertida = Math.min(Math.round((pontuacao / pontuacaoMaxima) * 10 * 100) / 100, 10);
        
        console.log('Pontuação bruta:', pontuacao);
        console.log('Total de questionários:', totalQuestionarios);
        console.log('Pontuação máxima possível:', pontuacaoMaxima);
        console.log('Nota convertida:', nota_convertida);
        
        let nivel;

        // Define o nível do usuário com base na nota convertida
        if (nota_convertida <= 4.9) {
            nivel = "Ruim";
        } else if (nota_convertida <= 7.4) {
            nivel = "Neutro";
        } else {
            nivel = "Bom";
        }

        // Retorna a nota convertida e o nível do usuário
        return res.status(200).json({
            success: true,
            nota: nota_convertida,
            nivel: nivel,
            message: 'Pontuação calculada com sucesso.'
        });

    } catch (error) {
        console.error("Erro ao calcular pontuação:", error);
        return res.status(500).json({
            success: false,
            message: 'Não foi possível calcular sua pontuação neste momento. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Função para obter todas as perguntas e suas alternativas
export async function getPerguntas(req, res) {
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
        
        if (perguntas.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhuma pergunta encontrada para este tipo de questionário.'
            });
        }
        
        // Retorna as perguntas e suas alternativas
        return res.status(200).json({
            success: true,
            perguntas: perguntas.rows,
            message: 'Perguntas carregadas com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Não foi possível carregar as perguntas neste momento. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Função para salvar as respostas de um usuário
export async function salvarRespostas(req, res) {
    const { usuario_id, respostas } = req.body;

    if (!usuario_id || !respostas || !Array.isArray(respostas) || respostas.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos. Por favor, forneça um ID de usuário válido e pelo menos uma resposta.'
        });
    }

    try {
        // Verifica se o usuário existe
        const usuarioExiste = await banco.query('SELECT id, questionario_inicial FROM usuarios WHERE id = $1', [usuario_id]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado. Verifique se o ID está correto.'
            });
        }

        // Verifica se o usuário já respondeu o questionário inicial
        if (usuarioExiste.rows[0].questionario_inicial) {
            return res.status(400).json({
                success: false,
                message: 'Você já respondeu o questionário inicial. Não é possível enviar novas respostas.'
            });
        }

        // Cria um novo questionário para o usuário no banco de dados
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id, tipo) VALUES ($1, $2) RETURNING id',
            [usuario_id, 'Inicial']
        );
        const questionario_id = questionario.rows[0].id;

        // Insere cada resposta do usuário no banco de dados
        for (const resposta of respostas) {
            if (!resposta.pergunta_id || !resposta.alternativa_id) {
                throw new Error('Dados de resposta incompletos');
            }

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
        return res.status(200).json({
            success: true,
            message: 'Questionário respondido com sucesso! Obrigado por sua participação.'
        });

    } catch (error) {
        console.error('Erro ao salvar respostas:', error);
        
        // Verifica se é um erro de violação de chave estrangeira
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos. Verifique se as perguntas e alternativas existem.'
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Não foi possível salvar suas respostas neste momento. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Função para obter o histórico de questionários do usuário (data e pontuação)
export async function getHistoricoQuestionarios(req, res) {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID do usuário não fornecido. Por favor, forneça um ID válido.' 
        });
    }

    try {
        // Verifica se o usuário existe
        const usuarioExiste = await banco.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado. Verifique se o ID está correto.'
            });
        }

        const resultado = await banco.query(`
            SELECT 
                q.id AS questionario_id,
                q.data,
                q.tipo,
                COALESCE(SUM(a.pontuacao), 0) AS pontuacao,
                ROUND((COALESCE(SUM(a.pontuacao), 0) / 40.0) * 10, 2) AS nota_convertida
            FROM 
                questionarios q
            LEFT JOIN respostas r ON r.questionario_id = q.id
            LEFT JOIN alternativas a ON r.alternativa_id = a.id
            WHERE 
                q.usuario_id = $1
            GROUP BY 
                q.id, q.data, q.tipo
            ORDER BY 
                q.data DESC;
        `, [usuario_id]);

        if (resultado.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Nenhum questionário encontrado para este usuário.',
                historico: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Histórico de questionários carregado com sucesso.',
            historico: resultado.rows
        });
    } catch (error) {
        console.error("Erro ao buscar histórico de questionários:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Não foi possível carregar seu histórico de questionários neste momento. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}