# CineBusca

Buscador de filmes e séries usando a API pública **TMDB**. Projeto final da disciplina **Web 1** — IFBA Campus Valença.

🌐 **Site ao vivo:** https://202316360036.github.io/cinebusca/

## Funcionalidades

- Busca de filmes e séries por título na API TMDB (resultados em português)
- Filtro por tipo (filme ou série)
- Favoritar filmes com persistência entre sessões (localStorage)
- Contador de favoritos e botão "Limpar todos"
- Modal de aviso para erros e buscas vazias

## Como rodar localmente

Basta abrir o arquivo `index.html` no navegador — não precisa de servidor.

Se preferir servir por HTTP (opcional):

```
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Integrantes e responsabilidades

| Integrante | Parte |
|---|---|
| Davison  | Visual e responsividade (CSS, mobile) |
| Diego    | Modal de detalhes e tratamento de erros |
| Elder    | Favoritos e localStorage |
| Juliana  | Busca e integração com a API OMDb |

## Tecnologias

- HTML5
- CSS3
- JavaScript (sem frameworks)
- API: [TMDB](https://www.themoviedb.org/)
- Hospedagem: GitHub Pages

## Estrutura dos arquivos

```
cinebusca/
├── index.html      Estrutura da página
├── style.css       Estilos e responsividade
├── script.js       Busca, favoritos e manipulação do DOM
└── README.md       Este arquivo
```
