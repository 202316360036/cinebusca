// BUSCA DE FILMES c/  API OMDb
var API_KEY = "e532329f";
var API_URL = "https://www.omdbapi.com/";

// seeleção de elementos html
var inputBusca = document.getElementById("busca");
var selectCategoria = document.getElementById("categoria");
var botaoBuscar = document.getElementById("btn-buscar");
var divResultados = document.getElementById("resultados");
var mensagem = document.getElementById("mensagem");

// botão da função de buscar
botaoBuscar.addEventListener("click", function () {
    buscarFilmes();
});

inputBusca.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        buscarFilmes();
    }
});

// função de busca para filmes e as séries
function buscarFilmes() {
    var termo = inputBusca.value;
    var tipo = selectCategoria.value;
    divResultados.innerHTML = "";
    if (termo === "") {
        mensagem.textContent = "Digite um título para buscar.";
        return;
    }
    mensagem.textContent = "Buscando...";
    // chamada de API
    var url = API_URL + "?apikey=" + API_KEY + "&type=" + tipo + "&s=" + termo;

    
    fetch(url)
        .then(function (resposta) {
            return resposta.json();
        })
        .then(function (dados) {
            if (dados.Response === "False") {
                mensagem.textContent = "Nenhum resultado encontrado.";
            } else {
                mensagem.textContent = "";
                mostrarResultados(dados.Search);
            }
        })
        .catch(function (erro) {
            mensagem.textContent = "Erro ao buscar. Tente novamente.";
            console.log(erro);
        });
}

function mostrarResultados(listaDeFilmes) {

    for (var i = 0; i < listaDeFilmes.length; i++) {
        var filme = listaDeFilmes[i];

        var imagemPoster = filme.Poster;
        if (imagemPoster === "N/A") {
            imagemPoster = "https://via.placeholder.com/200x300?text=Sem+Imagem";
        }

        var card = document.createElement("div");
        card.className = "card-filme";

        card.innerHTML =
            "<img src='" + imagemPoster + "' alt='" + filme.Title + "'>" +
            "<h3>" + filme.Title + "</h3>" +
            "<p>" + filme.Year + "</p>";

        // botão de favoritar (parte do Elder)
        card.appendChild(criarBotaoFavorito(filme));

        divResultados.appendChild(card);
    }
}

// ============================================================
// FAVORITOS + LOCALSTORAGE (parte do Elder)
// ============================================================

var CHAVE_FAVORITOS = "cinebusca_favoritos";
var listaFavoritos = document.getElementById("lista-favoritos");
var linkFavoritos = document.getElementById("link-favoritos");
var botaoLimparFavoritos = document.getElementById("btn-limpar-favoritos");

// clique no "Limpar todos" — pede confirmação antes de apagar
botaoLimparFavoritos.addEventListener("click", function () {
    var confirmou = confirm("Remover todos os favoritos? Essa ação não pode ser desfeita.");
    if (!confirmou) {
        return;
    }
    // removeItem apaga a chave inteira do localStorage; carregarFavoritos passa a devolver []
    localStorage.removeItem(CHAVE_FAVORITOS);
    renderizarFavoritos();
    // atualiza também as estrelas dos cards de busca que estejam na tela (todas voltam pra ☆)
    var todosBotoes = document.querySelectorAll(".btn-favorito");
    for (var i = 0; i < todosBotoes.length; i++) {
        todosBotoes[i].textContent = "☆";
    }
});

// lê os favoritos salvos no navegador e devolve como array
function carregarFavoritos() {
    var dadosSalvos = localStorage.getItem(CHAVE_FAVORITOS);
    // se o usuário nunca favoritou nada, getItem devolve null
    if (dadosSalvos === null) {
        return [];
    }
    // localStorage só guarda string; JSON.parse converte a string de volta em array
    return JSON.parse(dadosSalvos);
}

// grava o array de favoritos no navegador
function salvarFavoritos(favoritos) {
    // JSON.stringify converte o array em string, que é o único tipo aceito pelo localStorage
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

// verifica se um filme (pelo id da OMDb) já está nos favoritos
function estaFavoritado(imdbID) {
    var favoritos = carregarFavoritos();
    for (var i = 0; i < favoritos.length; i++) {
        if (favoritos[i].imdbID === imdbID) {
            return true;
        }
    }
    return false;
}

// adiciona se não tem, remove se já tem
function alternarFavorito(filme) {
    var favoritos = carregarFavoritos();
    if (estaFavoritado(filme.imdbID)) {
        // remove: monta um array novo pulando o filme com esse id
        var novoArray = [];
        for (var i = 0; i < favoritos.length; i++) {
            if (favoritos[i].imdbID !== filme.imdbID) {
                novoArray.push(favoritos[i]);
            }
        }
        salvarFavoritos(novoArray);
    } else {
        favoritos.push(filme);
        salvarFavoritos(favoritos);
    }
    // sincroniza todas as estrelas desse filme (pode aparecer nos resultados E nos favoritos ao mesmo tempo)
    sincronizarBotoesFavorito(filme.imdbID);
    // redesenha a seção "Meus Favoritos" pra refletir a mudança
    renderizarFavoritos();
}

// atualiza a aparência de todos os botões-estrela que apontam pro mesmo filme na página
function sincronizarBotoesFavorito(imdbID) {
    var botoes = document.querySelectorAll(".btn-favorito[data-imdbid='" + imdbID + "']");
    var favoritado = estaFavoritado(imdbID);
    for (var i = 0; i < botoes.length; i++) {
        botoes[i].textContent = favoritado ? "★" : "☆";
    }
}

// desenha a seção "Meus Favoritos" na tela
function renderizarFavoritos() {
    var favoritos = carregarFavoritos();
    listaFavoritos.innerHTML = "";

    // atualiza o contador no link do menu ("Favoritos (3)") e mostra/esconde o botão "Limpar todos"
    linkFavoritos.textContent = "Favoritos (" + favoritos.length + ")";
    botaoLimparFavoritos.hidden = favoritos.length === 0;

    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = "<p>Você ainda não favoritou nenhum filme.</p>";
        return;
    }

    for (var i = 0; i < favoritos.length; i++) {
        var filme = favoritos[i];

        var imagemPoster = filme.Poster;
        if (imagemPoster === "N/A") {
            imagemPoster = "https://via.placeholder.com/200x300?text=Sem+Imagem";
        }

        var card = document.createElement("div");
        card.className = "card-filme";
        card.innerHTML =
            "<img src='" + imagemPoster + "' alt='" + filme.Title + "'>" +
            "<h3>" + filme.Title + "</h3>" +
            "<p>" + filme.Year + "</p>";

        card.appendChild(criarBotaoFavorito(filme));
        listaFavoritos.appendChild(card);
    }
}

// cria o botão-estrela do card
// é uma função separada porque cada chamada cria seu próprio escopo com "filme" como parâmetro;
// assim o event listener sempre pega o filme certo, sem confusão de closure no loop
function criarBotaoFavorito(filme) {
    var botao = document.createElement("button");
    botao.className = "btn-favorito";
    // guarda o id da OMDb no próprio botão pra sincronizar todos os botões desse filme depois
    botao.dataset.imdbid = filme.imdbID;
    botao.textContent = estaFavoritado(filme.imdbID) ? "★" : "☆";
    botao.setAttribute("aria-label", "Favoritar " + filme.Title);

    botao.addEventListener("click", function () {
        // alternarFavorito já cuida de atualizar TODAS as estrelas desse filme (nos resultados e nos favoritos)
        alternarFavorito(filme);
    });

    return botao;
}

// desenha a seção de favoritos assim que a página carrega
renderizarFavoritos();