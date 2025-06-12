import banco from '../config/database.js';

// Verifica se o usuário já respondeu o questionário hoje
export async function verificarQuestionarioDiario(req, res) {
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
            SELECT id FROM questionarios 
            WHERE usuario_id = $1 AND data = CURRENT_DATE
        `, [usuario_id]);
        
        const ja_respondido = resultado.rows.length > 0;

        return res.status(200).json({
            success: true,
            ja_respondido: ja_respondido,
            message: ja_respondido 
                ? 'Você já respondeu o questionário hoje. Volte amanhã para responder novamente.' 
                : 'Você ainda não respondeu o questionário hoje.'
        });
    } catch (error) {
        console.error('Erro ao verificar questionário diário:', error);
        return res.status(500).json({
            success: false,
            message: 'Não foi possível verificar o status do seu questionário diário. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Obtém as perguntas do questionário diário (ID >= 11) de forma aleatória
export async function getPerguntasDiarias(req, res) {
    try {
        // Primeiro, obtém todas as perguntas disponíveis
        const todasPerguntas = await banco.query(`
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

        if (todasPerguntas.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhuma pergunta encontrada para o questionário diário.'
            });
        }

        // Embaralha as perguntas aleatoriamente
        const perguntasEmbaralhadas = todasPerguntas.rows.sort(() => Math.random() - 0.5);
        
        // Seleciona no máximo 10 perguntas
        const perguntasSelecionadas = perguntasEmbaralhadas.slice(0, 10);

        // Verifica se temos perguntas suficientes
        if (perguntasSelecionadas.length < 5) {
            return res.status(500).json({
                success: false,
                message: 'Não há perguntas suficientes disponíveis para o questionário diário.'
            });
        }
        
        return res.status(200).json({
            success: true,
            perguntas: perguntasSelecionadas,
            total_perguntas: perguntasSelecionadas.length,
            message: `Questionário diário gerado com ${perguntasSelecionadas.length} perguntas selecionadas aleatoriamente.`
        });
    } catch (error) {
        console.error('Erro ao buscar perguntas diárias:', error);
        return res.status(500).json({
            success: false,
            message: 'Não foi possível carregar as perguntas do questionário diário. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Salva as respostas do questionário diário
export async function salvarRespostasDiarias(req, res) {
    const { usuario_id, respostas } = req.body;

    if (!usuario_id || !respostas || !Array.isArray(respostas) || respostas.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos. Por favor, forneça um ID de usuário válido e pelo menos uma resposta.'
        });
    }

    // Verifica se o número de respostas está dentro do limite
    if (respostas.length > 10) {
        return res.status(400).json({
            success: false,
            message: 'Número de respostas excede o limite permitido. O questionário diário deve ter no máximo 10 perguntas.'
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

        // Verifica se o usuário já respondeu hoje
        const verificar = await banco.query(`
            SELECT id FROM questionarios
            WHERE usuario_id = $1 AND data = CURRENT_DATE
        `, [usuario_id]);

        if (verificar.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já respondeu o questionário hoje. Volte amanhã para responder novamente.'
            });
        }

        // Cria um novo questionário diário
        const questionario = await banco.query(
            'INSERT INTO questionarios (usuario_id, data, tipo) VALUES ($1, CURRENT_DATE, $2) RETURNING id',
            [usuario_id, 'Diario']
        );
        const questionario_id = questionario.rows[0].id;

        // Insere cada resposta
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

        return res.status(200).json({
            success: true,
            message: 'Questionário diário respondido com sucesso! Obrigado por sua participação.'
        });

    } catch (error) {
        console.error('Erro ao salvar respostas diárias:', error);
        
        // Verifica se é um erro de violação de chave estrangeira
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos. Verifique se as perguntas e alternativas existem.'
            });
        }

        // Verifica se é um erro de violação de constraint
        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Tipo de questionário inválido. Por favor, tente novamente.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Não foi possível salvar suas respostas do questionário diário. Por favor, tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 