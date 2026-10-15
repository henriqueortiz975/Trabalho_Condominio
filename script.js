
let condominios = [];
let unidades = [];
let moradores = [];

// FUNÇÕES AUXILIARES
async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...opcoes.headers
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || "Ocorreu um erro.");
    }

    return dados;
}

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function(letra) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[letra];
    });
}

function mostrarErro(erro) {
    alert(erro.message || "Não foi possível concluir a operação.");
}

function obterElemento(id) {
    return document.getElementById(id);
}

// TROCAR DE PÁGINA
let botoes = document.querySelectorAll("[data-pagina]");

botoes.forEach(function(botao) {
    botao.addEventListener("click", function() {
        document.querySelectorAll(".pagina").forEach(function(pagina) {
            pagina.classList.remove("ativa");
        });

        const pagina = obterElemento(botao.dataset.pagina);

        if (pagina) {
            pagina.classList.add("ativa");
        }

        botoes.forEach(function(b) {
            b.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        if (obterElemento("tituloPagina")) {
            obterElemento("tituloPagina").innerText = botao.innerText.trim();
        }

        if (document.querySelector(".sidebar")) {
            document.querySelector(".sidebar").classList.remove("aberto");
        }
    });
});

// ATALHOS DO DASHBOARD
document.querySelectorAll("[data-ir]").forEach(function(botao) {
    botao.addEventListener("click", function() {
        const pagina = botao.dataset.ir;
        const botaoMenu = document.querySelector(
            '[data-pagina="' + pagina + '"]'
        );

        if (botaoMenu) {
            botaoMenu.click();
        }
    });
});

// MENU DO CELULAR
if (obterElemento("menuMobile")) {
    obterElemento("menuMobile").addEventListener("click", function() {
        document.querySelector(".sidebar")?.classList.toggle("aberto");
    });
}

// ABRIR CADASTRO DE CONDOMÍNIO
if (obterElemento("atalhoCondominio")) {
    obterElemento("atalhoCondominio").addEventListener("click", function() {
        document.querySelector('[data-ir="condominios"]')?.click();
    });
}

// SALVAR CONDOMÍNIO
obterElemento("formCondominio").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const condominio = {
        nome: obterElemento("nome").value.trim(),
        cnpj: obterElemento("cnpj").value.trim(),
        telefone: obterElemento("telefone").value.trim(),
        endereco: obterElemento("endereco").value.trim(),
        bairro: obterElemento("bairro").value.trim(),
        cidade: obterElemento("cidade").value.trim(),
        estado: obterElemento("estado").value.trim(),
        blocos: obterElemento("blocos").value,
        quantidadeUnidades: obterElemento("quantidadeUnidades").value,
        sindico: obterElemento("sindico").value.trim()
    };

    try {
        await requisicao("/api/condominios", {
            method: "POST",
            body: JSON.stringify(condominio)
        });

        this.reset();

        obterElemento("blocos").value = 0;
        obterElemento("quantidadeUnidades").value = 0;

        await atualizar();
        alert("Condomínio cadastrado!");
    } catch (erro) {
        mostrarErro(erro);
    }
});

// SALVAR UNIDADE
obterElemento("formUnidade").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const unidade = {
        condominioId: obterElemento("condominioUnidade").value,
        bloco: obterElemento("blocoUnidade").value.trim(),
        numero: obterElemento("numeroUnidade").value.trim(),
        tipo: obterElemento("tipoUnidade").value,
        proprietario: obterElemento("proprietario").value.trim()
    };

    if (!unidade.condominioId) {
        alert("Cadastre e selecione um condomínio primeiro!");
        return;
    }

    try {
        await requisicao("/api/unidades", {
            method: "POST",
            body: JSON.stringify(unidade)
        });

        this.reset();
        await atualizar();
        alert("Unidade cadastrada!");
    } catch (erro) {
        mostrarErro(erro);
    }
});

// SALVAR MORADOR
obterElemento("formMorador").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const morador = {
        nome: obterElemento("nomeMorador").value.trim(),
        unidadeId: obterElemento("unidadeMorador").value || null,
        cpf: obterElemento("cpfMorador").value.trim(),
        telefone: obterElemento("telefoneMorador").value.trim(),
        perfil: obterElemento("perfilMorador").value
    };

    try {
        await requisicao("/api/moradores", {
            method: "POST",
            body: JSON.stringify(morador)
        });

        this.reset();
        await atualizar();
        alert("Morador cadastrado!");
    } catch (erro) {
        mostrarErro(erro);
    }
});

// ATUALIZAR O DASHBOARD E AS LISTAS
async function atualizar() {
    try {
        const resultados = await Promise.all([
            requisicao("/api/condominios"),
            requisicao("/api/unidades"),
            requisicao("/api/moradores")
        ]);

        // Converter os nomes das colunas do MySQL para os usados no HTML.

        condominios = resultados[0].map(function(c) {
            return {
                ...c,
                quantidadeUnidades: c.quantidadeUnidades ?? c.quantidade_unidades ?? 0
            };
        });

        unidades = resultados[1].map(function(u) {
            return {
                ...u,
                condominioId: u.condominio_id
            };
        });

        moradores = resultados[2].map(function(m) {
            return {
                ...m,
                unidadeId: m.unidade_id
            };
        });

        renderizar();
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
        alert("Não foi possível carregar os dados. Verifique o MySQL e o servidor Node.js.");
    }
}

function renderizar() {
    // CONTADORES DO DASHBOARD
    obterElemento("totalCondominios").innerText = condominios.length;
    obterElemento("totalUnidades").innerText = unidades.length;
    obterElemento("totalMoradores").innerText = moradores.length;

    // LISTA DE CONDOMÍNIOS NO DASHBOARD
    const lista = obterElemento("listaCondominios");

    if (condominios.length === 0) {
        lista.innerHTML = '<tr><td colspan="5">Nenhum condomínio cadastrado.</td></tr>';
    } else {
        lista.innerHTML = condominios.map(function(c) {
            return `
                <tr>
                    <td>${escapar(c.nome)}</td>
                    <td>${escapar(c.cidade)}</td>
                    <td>${escapar(c.blocos)}</td>
                    <td>${escapar(c.quantidadeUnidades)}</td>
                    <td>
                        <button class="acao excluir"
                            onclick="excluirCondominio(${Number(c.id)})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // LISTA DE CONDOMÍNIOS NO CADASTRO
    const listaCondominios = obterElemento("registrosCondominios");

    listaCondominios.innerHTML = condominios.map(function(c) {
        return `
            <div class="registro">
                <div class="registro-info">
                    <strong>${escapar(c.nome)}</strong>
                    <small>${escapar(c.endereco)} - ${escapar(c.cidade)}</small>
                </div>
                <button class="acao excluir"
                    onclick="excluirCondominio(${Number(c.id)})">
                    Excluir
                </button>
            </div>
        `;
    }).join("");

    // OPÇÕES DE CONDOMÍNIO
    const opcaoCondominio = obterElemento("condominioUnidade");

    opcaoCondominio.innerHTML =
        '<option value="">Selecione um condomínio</option>' +
        condominios.map(function(c) {
            return `<option value="${Number(c.id)}">${escapar(c.nome)}</option>`;
        }).join("");

    // LISTA DE UNIDADES
    const listaUnidades = obterElemento("listaUnidades");

    listaUnidades.innerHTML = unidades.map(function(u) {
        const condominio = condominios.find(function(c) {
            return Number(c.id) === Number(u.condominioId);
        });

        return `
            <div class="registro">
                <div class="registro-info">
                    <strong>${escapar(u.tipo)} ${escapar(u.numero)}</strong>
                    <small>Condomínio: ${escapar(condominio ? condominio.nome : "Não encontrado")}</small>
                    <small>Bloco: ${escapar(u.bloco || "Não informado")}</small>
                    <small>Proprietário: ${escapar(u.proprietario || "Não informado")}</small>
                </div>
                <button class="acao excluir"
                    onclick="excluirUnidade(${Number(u.id)})">
                    Excluir
                </button>
            </div>
        `;
    }).join("");

    // OPÇÕES DE UNIDADE
    const opcaoUnidade = obterElemento("unidadeMorador");

    opcaoUnidade.innerHTML =
        '<option value="">Sem unidade vinculada</option>' +
        unidades.map(function(u) {
            return `<option value="${Number(u.id)}">${escapar(u.tipo)} ${escapar(u.numero)}</option>`;
        }).join("");

    // LISTA DE MORADORES
    const listaMoradores = obterElemento("listaMoradores");

    listaMoradores.innerHTML = moradores.map(function(m) {
        const unidade = unidades.find(function(u) {
            return Number(u.id) === Number(m.unidadeId);
        });

        return `
            <div class="registro">
                <div class="registro-info">
                    <strong>${escapar(m.nome)}</strong>
                    <small>Perfil: ${escapar(m.perfil)}</small>
                    <small>Telefone: ${escapar(m.telefone || "Não informado")}</small>
                    <small>Unidade: ${escapar(unidade ? unidade.tipo + " " + unidade.numero : "Sem unidade")}</small>
                </div>
                <button class="acao excluir"
                    onclick="excluirMorador(${Number(m.id)})">
                    Excluir
                </button>
            </div>
        `;
    }).join("");

    // CONTADORES DAS LISTAS
    obterElemento("contagemCondominios").innerText =
        condominios.length + " registro(s)";

    obterElemento("contagemUnidades").innerText =
        unidades.length + " registro(s)";

    obterElemento("contagemMoradores").innerText =
        moradores.length + " registro(s)";
}

// EXCLUIR CONDOMÍNIO
async function excluirCondominio(id) {
    const possuiUnidades = unidades.some(function(u) {
        return Number(u.condominioId) === Number(id);
    });

    if (possuiUnidades) {
        alert("Exclua as unidades desse condomínio primeiro.");
        return;
    }

    if (!confirm("Deseja excluir este condomínio?")) {
        return;
    }

    try {
        await requisicao("/api/condominios/" + id, {
            method: "DELETE"
        });

        await atualizar();
        alert("Condomínio excluído!");
    } catch (erro) {
        mostrarErro(erro);
    }
}

// EXCLUIR UNIDADE
async function excluirUnidade(id) {
    const possuiMoradores = moradores.some(function(m) {
        return Number(m.unidadeId) === Number(id);
    });

    if (possuiMoradores) {
        alert("Desvincule os moradores desta unidade primeiro.");
        return;
    }

    if (!confirm("Deseja excluir esta unidade?")) {
        return;
    }

    try {
        await requisicao("/api/unidades/" + id, {
            method: "DELETE"
        });

        await atualizar();
        alert("Unidade excluída!");
    } catch (erro) {
        mostrarErro(erro);
    }
}

// EXCLUIR MORADOR
async function excluirMorador(id) {
    if (!confirm("Deseja excluir este morador?")) {
        return;
    }

    try {
        await requisicao("/api/moradores/" + id, {
            method: "DELETE"
        });

        await atualizar();
        alert("Morador excluído!");
    } catch (erro) {
        mostrarErro(erro);
    }
}

// DATA
if (obterElemento("dataAtual")) {
    obterElemento("dataAtual").innerText =
        new Date().toLocaleDateString("pt-BR");
}

// INICIAR O SISTEMA
atualizar();
