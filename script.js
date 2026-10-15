
let condominios = JSON.parse(localStorage.getItem("condominios")) || [];
let unidades = JSON.parse(localStorage.getItem("unidades")) || [];
let moradores = JSON.parse(localStorage.getItem("moradores")) || [];

// TROCAR DE PÁGINA

let botoes = document.querySelectorAll("[data-pagina]");

botoes.forEach(function(botao) {
    botao.addEventListener("click", function() {
        document.querySelectorAll(".pagina").forEach(function(pagina) {
            pagina.classList.remove("ativa");
        });

        document.getElementById(botao.dataset.pagina).classList.add("ativa");

        botoes.forEach(function(b) {
            b.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        document.getElementById("tituloPagina").innerText =
            botao.innerText.trim();
    });
});

// ATALHOS DO DASHBOARD

document.querySelectorAll("[data-ir]").forEach(function(botao) {
    botao.addEventListener("click", function() {
        let pagina = botao.dataset.ir;

        document.querySelectorAll(".pagina").forEach(function(p) {
            p.classList.remove("ativa");
        });

        document.getElementById(pagina).classList.add("ativa");

        botoes.forEach(function(b) {
            b.classList.remove("ativo");

            if (b.dataset.pagina == pagina) {
                b.classList.add("ativo");
            }
        });

        document.getElementById("tituloPagina").innerText =
            document.querySelector('[data-pagina="' + pagina + '"]').innerText.trim();
    });
});

// MENU DO CELULAR

document.getElementById("menuMobile").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("aberto");
});

// ABRIR CADASTRO DE CONDOMÍNIO

document.getElementById("atalhoCondominio").addEventListener("click", function() {
    document.querySelector('[data-ir="condominios"]').click();
});

// SALVAR CONDOMÍNIO

document.getElementById("formCondominio").addEventListener("submit", function(evento) {
    evento.preventDefault();

    let condominio = {
        id: Date.now(),
        nome: document.getElementById("nome").value,
        cnpj: document.getElementById("cnpj").value,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        blocos: document.getElementById("blocos").value,
        quantidadeUnidades: document.getElementById("quantidadeUnidades").value,
        sindico: document.getElementById("sindico").value
    };

    condominios.push(condominio);

    localStorage.setItem("condominios", JSON.stringify(condominios));

    this.reset();

    document.getElementById("blocos").value = 0;
    document.getElementById("quantidadeUnidades").value = 0;

    atualizar();
    alert("Condomínio cadastrado!");
});

// SALVAR UNIDADE

document.getElementById("formUnidade").addEventListener("submit", function(evento) {
    evento.preventDefault();

    let unidade = {
        id: Date.now(),
        condominioId: document.getElementById("condominioUnidade").value,
        bloco: document.getElementById("blocoUnidade").value,
        numero: document.getElementById("numeroUnidade").value,
        tipo: document.getElementById("tipoUnidade").value,
        proprietario: document.getElementById("proprietario").value
    };

    if (unidade.condominioId == "") {
        alert("Cadastre um condomínio primeiro!");
        return;
    }

    unidades.push(unidade);

    localStorage.setItem("unidades", JSON.stringify(unidades));

    this.reset();

    atualizar();
    alert("Unidade cadastrada!");
});

// SALVAR MORADOR

document.getElementById("formMorador").addEventListener("submit", function(evento) {
    evento.preventDefault();

    let morador = {
        id: Date.now(),
        nome: document.getElementById("nomeMorador").value,
        unidadeId: document.getElementById("unidadeMorador").value,
        cpf: document.getElementById("cpfMorador").value,
        telefone: document.getElementById("telefoneMorador").value,
        perfil: document.getElementById("perfilMorador").value
    };

    moradores.push(morador);

    localStorage.setItem("moradores", JSON.stringify(moradores));

    this.reset();

    atualizar();
    alert("Morador cadastrado!");
});

// ATUALIZAR O DASHBOARD

function atualizar() {
    document.getElementById("totalCondominios").innerText = condominios.length;
    document.getElementById("totalUnidades").innerText = unidades.length;
    document.getElementById("totalMoradores").innerText = moradores.length;

    // LISTA DE CONDOMÍNIOS NO DASHBOARD

    let lista = document.getElementById("listaCondominios");

    if (condominios.length == 0) {
        lista.innerHTML = '<tr><td colspan="5">Nenhum condomínio cadastrado.</td></tr>';
    } else {
        lista.innerHTML = "";

        condominios.forEach(function(c) {
            lista.innerHTML += `
                <tr>
                    <td>${c.nome}</td>
                    <td>${c.cidade}</td>
                    <td>${c.blocos}</td>
                    <td>${c.quantidadeUnidades}</td>
                    <td>
                        <button class="acao excluir" onclick="excluirCondominio(${c.id})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // LISTA DE CONDOMÍNIOS NO CADASTRO

    let listaCondominios = document.getElementById("registrosCondominios");
    listaCondominios.innerHTML = "";

    condominios.forEach(function(c) {
        listaCondominios.innerHTML += `
            <div class="registro">
                <div class="registro-info">
                    <strong>${c.nome}</strong>
                    <small>${c.endereco} - ${c.cidade}</small>
                </div>
                <button class="acao excluir" onclick="excluirCondominio(${c.id})">
                    Excluir
                </button>
            </div>
        `;
    });

    // ATUALIZAR OPÇÕES DE CONDOMÍNIO

    let opcaoCondominio = document.getElementById("condominioUnidade");

    opcaoCondominio.innerHTML = '<option value="">Selecione um condomínio</option>';

    condominios.forEach(function(c) {
        opcaoCondominio.innerHTML += `
            <option value="${c.id}">${c.nome}</option>
        `;
    });

    // LISTA DE UNIDADES

    let listaUnidades = document.getElementById("listaUnidades");
    listaUnidades.innerHTML = "";

    unidades.forEach(function(u) {
        let condominio = condominios.find(function(c) {
            return c.id == u.condominioId;
        });

        listaUnidades.innerHTML += `
            <div class="registro">
                <div class="registro-info">
                    <strong>${u.tipo} ${u.numero}</strong>
                    <small>Condomínio: ${condominio ? condominio.nome : "Não encontrado"}</small>
                    <small>Bloco: ${u.bloco || "Não informado"}</small>
                </div>
                <button class="acao excluir" onclick="excluirUnidade(${u.id})">
                    Excluir
                </button>
            </div>
        `;
    });

    // ATUALIZAR OPÇÕES DE UNIDADE

    let opcaoUnidade = document.getElementById("unidadeMorador");

    opcaoUnidade.innerHTML = '<option value="">Sem unidade vinculada</option>';

    unidades.forEach(function(u) {
        opcaoUnidade.innerHTML += `
            <option value="${u.id}">${u.tipo} ${u.numero}</option>
        `;
    });

    // LISTA DE MORADORES

    let listaMoradores = document.getElementById("listaMoradores");
    listaMoradores.innerHTML = "";

    moradores.forEach(function(m) {
        listaMoradores.innerHTML += `
            <div class="registro">
                <div class="registro-info">
                    <strong>${m.nome}</strong>
                    <small>Perfil: ${m.perfil}</small>
                    <small>Telefone: ${m.telefone || "Não informado"}</small>
                </div>
                <button class="acao excluir" onclick="excluirMorador(${m.id})">
                    Excluir
                </button>
            </div>
        `;
    });

    // ATUALIZAR CONTADORES

    document.getElementById("contagemCondominios").innerText =
        condominios.length + " registro(s)";

    document.getElementById("contagemUnidades").innerText =
        unidades.length + " registro(s)";

    document.getElementById("contagemMoradores").innerText =
        moradores.length + " registro(s)";
}

// EXCLUIR CONDOMÍNIO

function excluirCondominio(id) {
    let possuiUnidades = unidades.some(function(u) {
        return u.condominioId == id;
    });

    if (possuiUnidades) {
        alert("Exclua as unidades desse condomínio primeiro.");
        return;
    }

    if (confirm("Deseja excluir este condomínio?")) {
        condominios = condominios.filter(function(c) {
            return c.id != id;
        });

        localStorage.setItem("condominios", JSON.stringify(condominios));
        atualizar();
    }
}

// EXCLUIR UNIDADE

function excluirUnidade(id) {
    let possuiMoradores = moradores.some(function(m) {
        return m.unidadeId == id;
    });

    if (possuiMoradores) {
        alert("Desvincule os moradores desta unidade primeiro.");
        return;
    }

    if (confirm("Deseja excluir esta unidade?")) {
        unidades = unidades.filter(function(u) {
            return u.id != id;
        });

        localStorage.setItem("unidades", JSON.stringify(unidades));
        atualizar();
    }
}

// EXCLUIR MORADOR

function excluirMorador(id) {
    if (confirm("Deseja excluir este morador?")) {
        moradores = moradores.filter(function(m) {
            return m.id != id;
        });

        localStorage.setItem("moradores", JSON.stringify(moradores));
        atualizar();
    }
}

// DATA

document.getElementById("dataAtual").innerText =
    new Date().toLocaleDateString("pt-BR");

// INICIAR O SISTEMA

atualizar();