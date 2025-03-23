-- Sugestão de integração: transformar em variáveis os values

-- Consultas relacionadas a filmes

-- Listar todos os filmes assistidos por um usuário
SELECT f.NOME 
FROM Filme f 
INNER JOIN Assistiu a ON a.ID_FILME = f.ID_FILME 
WHERE a.USERNAME = %s;

-- Listar todos os filmes que um usuário quer assistir
SELECT f.NOME 
FROM Filme f 
INNER JOIN Assistira a ON a.ID_FILME = f.ID_FILME 
WHERE a.USERNAME = %s;

-- Listar todos os filmes de um gênero específico
SELECT f.NOME 
FROM Filme f 
WHERE f.GENERO = %s;

-- Listar todos os filmes com uma tag específica
SELECT f.NOME 
FROM Filme f 
JOIN Tags t ON f.ID_FILME = t.ID_FILME 
WHERE t.TAG = %s;

-- Listar todos os filmes com um ator específico
SELECT f.NOME 
FROM Filme f 
JOIN Participou p ON f.ID_FILME = p.ID_FILME 
WHERE p.NOME = %s;

-- Listar todos os filmes de um diretor específico
SELECT NOME 
FROM Filme 
WHERE DIRETOR = %s;

-- Listar todos os filmes falados em um idioma específico
SELECT NOME 
FROM Filme 
WHERE IDIOMA = %s;

-- Listar filmes em comum assistidos por dois usuários
SELECT f.NOME 
FROM Filme f 
JOIN Assistiu a1 ON f.ID_FILME = a1.ID_FILME 
JOIN Assistiu a2 ON f.ID_FILME = a2.ID_FILME 
WHERE a1.USERNAME = %s AND a2.USERNAME = %s;

-- Listar filmes assistidos e avaliados por um usuário
SELECT DISTINCT f.NOME 
FROM Filme f 
JOIN Assistiu a ON f.ID_FILME = a.ID_FILME 
JOIN Avaliacao av ON f.ID_FILME = av.ID_FILME 
WHERE a.USERNAME = %s;

-- Listar todos os filmes favoritados por um usuário
SELECT f.NOME 
FROM Filme f 
JOIN Favoritou fav ON f.ID_FILME = fav.ID_FILME 
WHERE fav.USERNAME = %s;

-- Listar os 10 filmes mais bem avaliados
SELECT NOME, NOTA_AGREGADA 
FROM Filme 
ORDER BY NOTA_AGREGADA DESC 
LIMIT 10;

-- Listar os 10 filmes com a menor nota agregada
SELECT NOME, NOTA_AGREGADA 
FROM Filme 
ORDER BY NOTA_AGREGADA ASC 
LIMIT 10;

-- Listar todos os filmes lançados em um ano específico
SELECT NOME 
FROM Filme 
WHERE ANO = %s;

-- Listar todos os filmes lançados entre dois anos específicos
SELECT NOME 
FROM Filme 
WHERE ANO BETWEEN %s AND %s;

-- Listar os filmes mais avaliados (com maior número de avaliações)
SELECT f.NOME, COUNT(a.ID_FILME) AS NUM_AVALIACOES 
FROM Filme f 
JOIN Avaliacao a ON f.ID_FILME = a.ID_FILME 
GROUP BY f.NOME 
ORDER BY NUM_AVALIACOES DESC 
LIMIT 10;

-- Listar os filmes mais favoritados
SELECT f.NOME, COUNT(fav.USERNAME) AS NUM_FAVORITOS 
FROM Filme f 
JOIN Favoritou fav ON f.ID_FILME = fav.ID_FILME 
GROUP BY f.NOME 
ORDER BY NUM_FAVORITOS DESC 
LIMIT 10;

-- Consultas relacionadas a avaliações:

-- Listar todas as avaliações feitas por um usuário
SELECT ID_FILME, NOTA, DESCRICAO 
FROM Avaliacao 
WHERE USERNAME = %s;

-- Listar todas as avaliações de um filme específico
SELECT USERNAME, NOTA, DESCRICAO 
FROM Avaliacao 
WHERE ID_FILME = %s;

-- Listar todas as avaliações feitas em uma data específica
SELECT * 
FROM Avaliacao 
WHERE DATA_REVIEW = %s;

-- Listar avaliações com notas acima de um valor
SELECT * 
FROM Avaliacao 
WHERE NOTA > %s;

-- Listar avaliações com notas abaixo de um valor
SELECT * 
FROM Avaliacao 
WHERE NOTA < %s;

-- Listar a média das notas de um filme específico
SELECT AVG(NOTA) AS MEDIA_NOTA 
FROM Avaliacao 
WHERE ID_FILME = %s;

-- Listar a média das notas de avaliação de todos os filmes
SELECT ID_FILME, AVG(NOTA) AS MEDIA_NOTA 
FROM Avaliacao 
GROUP BY ID_FILME;

-- Listar os usuários que mais fizeram avaliações
SELECT USERNAME, COUNT(*) AS NUM_AVALIACOES 
FROM Avaliacao 
GROUP BY USERNAME 
ORDER BY NUM_AVALIACOES DESC 
LIMIT 10;

-- Listar os filmes que possuem apenas uma avaliação
SELECT f.NOME 
FROM Filme f 
JOIN Avaliacao a ON f.ID_FILME = a.ID_FILME 
GROUP BY f.NOME 
HAVING COUNT(a.USERNAME) = 1;

-- Listar a média das notas dadas por um usuário em suas avaliações
SELECT USERNAME, AVG(NOTA) AS MEDIA_NOTA 
FROM Avaliacao 
GROUP BY USERNAME;

-- Consultas relacionadas a solicitações:

-- Listar todas as solicitações de filmes pendentes de aprovação
SELECT s.ID_SOLICITACAO, s.NOME 
FROM Solicitacao_Filme s 
LEFT JOIN Aprova a ON a.ID_FILME = s.ID_SOLICITACAO 
WHERE a.ID_FILME IS NULL;

-- Listar todas as solicitações aprovadas por um administrador específico
SELECT s.ID_SOLICITACAO, s.NOME 
FROM Solicitacao_Filme s 
JOIN Aprova a ON s.ID_SOLICITACAO = a.ID_FILME 
WHERE a.USERNAME = %s;

-- Listar todas as solicitações feitas por um usuário específico
SELECT s.ID_SOLICITACAO, s.NOME 
FROM Solicitacao_Filme s 
JOIN Solicita so ON s.ID_SOLICITACAO = so.ID_FILME 
WHERE so.USERNAME = %s;

-- Listar os filmes mais solicitados para adição ao sistema
SELECT s.NOME, COUNT(so.ID_FILME) AS NUM_SOLICITACOES 
FROM Solicitacao_Filme s 
JOIN Solicita so ON s.ID_SOLICITACAO = so.ID_FILME 
GROUP BY s.NOME 
ORDER BY NUM_SOLICITACOES DESC 
LIMIT 10;

-- Consultas relacionadas a usuários:

-- Listar todos os usuários registrados na plataforma
SELECT USERNAME FROM Pessoa;

-- Listar usuários que assistiram a um filme específico
SELECT USERNAME 
FROM Assistiu 
WHERE ID_FILME = %s;

-- Listar usuários que favoritaram um filme específico
SELECT USERNAME 
FROM Favoritou 
WHERE ID_FILME = %s;

-- Listar usuários que querem assistir a um filme específico
SELECT USERNAME 
FROM Assistira 
WHERE ID_FILME = %s;

-- Listar os usuários que avaliaram um filme específico
SELECT USERNAME 
FROM Avaliacao 
WHERE ID_FILME = %s;

-- Listar os usuários com mais filmes favoritados
SELECT USERNAME, COUNT(ID_FILME) AS NUM_FAVORITOS 
FROM Favoritou 
GROUP BY USERNAME 
ORDER BY NUM_FAVORITOS DESC 
LIMIT 10;

-- Listar os usuários com mais filmes assistidos
SELECT USERNAME, COUNT(ID_FILME) AS NUM_ASSISTIDOS 
FROM Assistiu 
GROUP BY USERNAME 
ORDER BY NUM_ASSISTIDOS DESC 
LIMIT 10;

-- Listar usuários que assistiram a mais de N filmes
SELECT USERNAME 
FROM Assistiu 
GROUP BY USERNAME 
HAVING COUNT(ID_FILME) > %s;

-- Listar usuários que nunca avaliaram um filme
SELECT USERNAME 
FROM U_Publico 
LEFT JOIN Avaliacao a ON U_Publico.USERNAME = a.USERNAME 
WHERE a.USERNAME IS NULL;
