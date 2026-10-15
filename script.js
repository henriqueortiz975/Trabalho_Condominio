/* =====================================
   1. ELEMENTOS E MENSAGENS
===================================== */

const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto) {
    mensagem.textContent = texto;
    mensagem.classList.add("visivel");

    clearTimeout(mostrarMensagem.temporizador);
    mostrarMensagem.temporizador = setTimeout(() => {
        mensagem.classList.remove("visivel");
    }, 3500);
}

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        }
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível concluir a operação.");
    }

    return dados;
}

function escapar(valor = "") {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}


/* =====================================
   2. NAVEGAÇÃO ENTRE PÁGINAS
===================================== */

document.querySelectorAll("nav button[data-pagina]").forEach(botao => {
    botao.addEventListener("click", () => {
        const destino = botao.dataset.pagina;

        document.querySelectorAll(".pagina").forEach(pagina => {
            pagina.classList.toggle("ativa", pagina.id === destino);
        });

        document.querySelectorAll("nav button").forEach(item => {
            item.classList.toggle("ativo", item === botao);
        });
    });
});


/* =====================================
   3. CONDOMÍNIOS
===================================== */

async function carregarCondominios() {
    const condominios = await requisicao("api/condominios.php");

    document.getElementById("totalCondominios").textContent = condominios.length;

    const lista = document.getElementById("listaCondominios");
    if (!condominios.length) {
        lista.textContent = "Nenhum condomínio cadastrado.";
    } else {
        lista.innerHTML = condominios.map(condominio => `
            <div class="item-lista">
                <div>
                    <strong>${escapar(condominio.nome)}</strong>
                    <p>${escapar(condominio.endereco)}${condominio.cidade ? " · " + escapar(condominio.cidade) : ""}</p>
                </div>
                <button class="excluir" data-excluir-condominio="${condominio.id}">Excluir</button>
            </div>
        `).join("");
    }

    const select = document.getElementById("condominioUnidade");
    const selecionado = select.value;
    select.innerHTML = '<option value="">Selecione</option>' + condominios.map(condominio =>
        `<option value="${condominio.id}">${escapar(condominio.nome)}</option>`
    ).join("");

    if (condominios.some(c => String(c.id) === selecionado)) select.value = selecionado;
}

document.getElementById("formCondominio").addEventListener("submit", async evento => {
    evento.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value.trim(),
        cnpj: document.getElementById("cnpj").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        estado: document.getElementById("estado").value.trim(),
        blocos: document.getElementById("blocos").value,
        quantidadeUnidades: document.getElementById("quantidadeUnidades").value,
        sindico: document.getElementById("sindico").value.trim()
    };

    try {
        const resultado = await requisicao("api/condominios.php", {
            method: "POST",
            body: JSON.stringify(dados)
        });
        evento.target.reset();
        await atualizarTudo();
        mostrarMensagem(resultado.mensagem);
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
});


/* =====================================
   4. UNIDADES
===================================== */

async function carregarUnidades() {
    const unidades = await requisicao("api/unidades.php");
    document.getElementById("totalUnidades").textContent = unidades.length;

    const lista = document.getElementById("listaUnidades");
    lista.innerHTML = unidades.length ? unidades.map(unidade => `
        <div class="item-lista">
            <div>
                <strong>${escapar(unidade.tipo)} ${escapar(unidade.numero)}</strong>
                <p>${escapar(unidade.nome_condominio)}${unidade.bloco ? " · Bloco " + escapar(unidade.bloco) : ""}${unidade.proprietario ? " · Proprietário: " + escapar(unidade.proprietario) : ""}</p>
            </div>
            <button class="excluir" data-excluir-unidade="${unidade.id}">Excluir</button>
        </div>
    `).join("") : "Nenhuma unidade cadastrada.";

    const select = document.getElementById("unidadeMorador");
    const selecionado = select.value;
    select.innerHTML = '<option value="">Sem unidade vinculada</option>' + unidades.map(unidade =>
        `<option value="${unidade.id}">${escapar(unidade.nome_condominio)} — ${escapar(unidade.numero)}${unidade.bloco ? " (Bloco " + escapar(unidade.bloco) + ")" : ""}</option>`
    ).join("");

    if (unidades.some(u => String(u.id) === selecionado)) select.value = selecionado;
}

document.getElementById("formUnidade").addEventListener("submit", async evento => {
    evento.preventDefault();

    const dados = {
        condominio_id: document.getElementById("condominioUnidade").value,
        bloco: document.getElementById("blocoUnidade").value.trim(),
        numero: document.getElementById("numeroUnidade").value.trim(),
        tipo: document.getElementById("tipoUnidade").value,
        proprietario: document.getElementById("proprietario").value.trim()
    };

    try {
        const resultado = await requisicao("api/unidades.php", {
            method: "POST",
            body: JSON.stringify(dados)
        });
        evento.target.reset();
        await atualizarTudo();
        mostrarMensagem(resultado.mensagem);
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
});


/* =====================================
   5. MORADORES
===================================== */

async function carregarMoradores() {
    const moradores = await requisicao("api/moradores.php");
    document.getElementById("totalMoradores").textContent = moradores.length;

    const lista = document.getElementById("listaMoradores");
    lista.innerHTML = moradores.length ? moradores.map(morador => {
        let unidade = "Sem unidade vinculada";
        if (morador.numero_unidade) {
            unidade = `${morador.nome_condominio} — Unidade ${morador.numero_unidade}`;
            if (morador.bloco_unidade) unidade += `, bloco ${morador.bloco_unidade}`;
        }

        return `
            <div class="item-lista">
                <div>
                    <strong>${escapar(morador.nome)}</strong>
                    <p>${escapar(morador.perfil)} · ${escapar(unidade)}${morador.telefone ? " · " + escapar(morador.telefone) : ""}</p>
                </div>
                <button class="excluir" data-excluir-morador="${morador.id}">Excluir</button>
            </div>
        `;
    }).join("") : "Nenhum morador cadastrado.";
}

document.getElementById("formMorador").addEventListener("submit", async evento => {
    evento.preventDefault();

    const dados = {
        nome: document.getElementById("nomeMorador").value.trim(),
        unidade_id: document.getElementById("unidadeMorador").value || null,
        cpf: document.getElementById("cpfMorador").value.trim(),
        telefone: document.getElementById("telefoneMorador").value.trim(),
        perfil: document.getElementById("perfilMorador").value
    };

    try {
        const resultado = await requisicao("api/moradores.php", {
            method: "POST",
            body: JSON.stringify(dados)
        });
        evento.target.reset();
        await atualizarTudo();
        mostrarMensagem(resultado.mensagem);
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
});


/* =====================================
   6. EXCLUSÃO DE REGISTROS
===================================== */

document.addEventListener("click", async evento => {
    const botao = evento.target.closest("[data-excluir-condominio], [data-excluir-unidade], [data-excluir-morador]");
    if (!botao) return;

    let tipo;
    let id;

    if (botao.dataset.excluirCondominio) {
        tipo = "condominios";
        id = botao.dataset.excluirCondominio;
    } else if (botao.dataset.excluirUnidade) {
        tipo = "unidades";
        id = botao.dataset.excluirUnidade;
    } else {
        tipo = "moradores";
        id = botao.dataset.excluirMorador;
    }

    const confirmar = window.confirm("Deseja realmente excluir este registro?");
    if (!confirmar) return;

    try {
        const resultado = await requisicao(`api/${tipo}.php?id=${encodeURIComponent(id)}`, {
            method: "DELETE"
        });
        await atualizarTudo();
        mostrarMensagem(resultado.mensagem);
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
});


/* =====================================
   7. ATUALIZAÇÃO E INICIALIZAÇÃO
===================================== */

async function atualizarTudo() {
    await carregarCondominios();
    await carregarUnidades();
    await carregarMoradores();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await atualizarTudo();
    } catch (erro) {
        mostrarMensagem(erro.message);
        console.error("Erro ao carregar dados:", erro);
    }
});
