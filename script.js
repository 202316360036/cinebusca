// BUSCA DE FILMES c/  API TMDB
var API_KEY = "020281b3264f33dc85a35c83106d624f";
var API_URL = "https://api.themoviedb.org/3/search/";


// SEÇÃO API - Julianna

// seeleção de elementos html
var inputBusca = document.getElementById("busca");
var selectCategoria = document.getElementById("categoria");
var botaoBuscar = document.getElementById("btn-buscar");
var divResultados = document.getElementById("resultados");
var mensagem = document.getElementById("mensagem");

// SEÇÃO MODAL - Diego
var modal = document.getElementById("modal");
var textoModal = document.getElementById("texto-modal");
var tituloModal = document.getElementById("titulo-modal");
var fecharModalBtn = document.getElementById("fechar-modal");

function abrirModal(texto, titulo) {
    tituloModal.textContent = titulo || "Atenção";
    textoModal.textContent = texto;
    modal.style.display = "flex";
}

function fecharModal() {
    modal.style.display = "none";
}

fecharModalBtn.addEventListener("click", fecharModal);

// clicar fora do conteúdo (no fundo escuro) também fecha o modal
modal.addEventListener("click", function (evento) {
    if (evento.target === modal) {
        fecharModal();
    }
});

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
    // trim tira espaços em branco do começo e do fim
    var termo = inputBusca.value.trim();
    var tipo = selectCategoria.value;
    divResultados.innerHTML = "";
    if (termo === "") {
        mensagem.textContent = "Digite um título para buscar.";
        abrirModal("Você precisa escrever o nome de um filme ou série antes de procurar.", "Campo vazio");
        return;
    }
    mensagem.textContent = "Buscando...";
    // chamada de API
    var endpoint = (tipo === "series") ? "tv" : "movie";
    var url = API_URL + endpoint + "?api_key=" + API_KEY + "&language=pt-BR&query=" + termo;


    fetch(url)
        .then(function (resposta) {
            // resposta.ok é false quando o status HTTP é 4xx/5xx (ex.: 401, 500)
            if (!resposta.ok) {
                throw new Error("Erro na API");
            }
            return resposta.json();
        })
        .then(function (dados) {
            if (!dados.results || dados.results.length === 0) {
                mensagem.textContent = "Nenhum resultado encontrado.";
                abrirModal("Não encontrei nada com esse nome. Tenta outra busca.", "Sem resultado");
            } else {
                mensagem.textContent = "";
                mostrarResultados(converterResultados(dados.results, endpoint));
            }
        })
        .catch(function (erro) {
            mensagem.textContent = "Erro ao buscar. Tente novamente.";
            abrirModal("Não foi possível conectar com o serviço de busca. Verifica sua internet e tenta de novo.", "Erro");
            console.log(erro);
        });
}

function converterResultados(resultados, tipo) {
    var lista = [];
    for (var i = 0; i < resultados.length; i++) {
        var item = resultados[i];
        var titulo = (tipo === "tv") ? item.name : item.title;
        var data = (tipo === "tv") ? item.first_air_date : item.release_date;
        var ano = data ? data.substring(0, 4) : "";
        var poster = item.poster_path ? ("https://image.tmdb.org/t/p/w300" + item.poster_path) : "N/A";

        lista.push({
            imdbID: item.id,
            Poster: poster,
            Title: titulo,
            Year: ano
        });
    }
    return lista;
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

// verifica se um filme (pelo id) já está nos favoritos
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
    // guarda o id do filme no próprio botão pra sincronizar todos os botões desse filme depois
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
