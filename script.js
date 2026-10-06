const $=id=>document.getElementById(id);
let condominios=JSON.parse(localStorage.getItem("condominios")||"[]");
let unidades=JSON.parse(localStorage.getItem("unidades")||"[]");
let moradores=JSON.parse(localStorage.getItem("moradores")||"[]");

const titles={inicio:"Visão geral",condominio:"Cadastro do condomínio",unidades:"Cadastro de unidades",moradores:"Cadastro de moradores"};

function save(){localStorage.setItem("condominios",JSON.stringify(condominios));localStorage.setItem("unidades",JSON.stringify(unidades));localStorage.setItem("moradores",JSON.stringify(moradores));}
function showSection(id){
 document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
 $("pageTitle").textContent=titles[id];
 if(id==="inicio")renderAll();
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));

function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2500)}
function esc(v){return String(v||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$("condominioForm").addEventListener("submit",e=>{
 e.preventDefault();
 condominios.push({id:Date.now(),nome:$("nomeCondominio").value,cnpj:$("cnpj").value,telefone:$("telefone").value,endereco:$("endereco").value,bairro:$("bairro").value,cidade:$("cidade").value,estado:$("estado").value,blocos:$("blocos").value,unidades:$("unidades").value,sindico:$("sindico").value});
 save();e.target.reset();toast("Condomínio cadastrado com sucesso!");showSection("inicio");
});
$("unidadeForm").addEventListener("submit",e=>{
 e.preventDefault();unidades.push({id:Date.now(),bloco:$("blocoUnidade").value,numero:$("numeroUnidade").value,tipo:$("tipoUnidade").value,proprietario:$("proprietario").value});save();e.target.reset();renderUnidades();toast("Unidade adicionada!");
});
$("moradorForm").addEventListener("submit",e=>{
 e.preventDefault();moradores.push({id:Date.now(),nome:$("nomeMorador").value,cpf:$("cpfMorador").value,telefone:$("telMorador").value,unidade:$("unidadeMorador").value,perfil:$("perfilMorador").value});save();e.target.reset();renderMoradores();toast("Morador adicionado!");
});

function renderCondominios(){
 if(!condominios.length){$("condominiosLista").innerHTML='<div class="empty">Nenhum condomínio cadastrado ainda.</div>';return}
 $("condominiosLista").innerHTML=condominios.map(c=>`<div style="padding:15px 0;border-bottom:1px solid #edf0f4;display:flex;justify-content:space-between;gap:15px"><div><strong>${esc(c.nome)}</strong><div style="font-size:12px;color:#7b8796;margin-top:4px">${esc(c.endereco)}${c.cidade?` · ${esc(c.cidade)}`:""}${c.estado?`/${esc(c.estado)}`:""}</div></div><button class="delete" onclick="removeCondominio(${c.id})">Excluir</button></div>`).join("");
}
function renderUnidades(){
 $("unidadesLista").innerHTML=unidades.length?`<table class="data-table"><thead><tr><th>Bloco</th><th>Número</th><th>Tipo</th><th>Proprietário</th><th></th></tr></thead><tbody>${unidades.map(u=>`<tr><td>${esc(u.bloco)||"—"}</td><td>${esc(u.numero)}</td><td>${esc(u.tipo)}</td><td>${esc(u.proprietario)||"—"}</td><td><button class="delete" onclick="removeUnidade(${u.id})">Excluir</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Nenhuma unidade cadastrada.</div>';
}
function renderMoradores(){
 $("moradoresLista").innerHTML=moradores.length?`<table class="data-table"><thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>Unidade</th><th>Perfil</th><th></th></tr></thead><tbody>${moradores.map(m=>`<tr><td>${esc(m.nome)}</td><td>${esc(m.cpf)||"—"}</td><td>${esc(m.telefone)||"—"}</td><td>${esc(m.unidade)||"—"}</td><td>${esc(m.perfil)}</td><td><button class="delete" onclick="removeMorador(${m.id})">Excluir</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Nenhum morador cadastrado.</div>';
}
function removeCondominio(id){if(confirm("Excluir este condomínio?")){condominios=condominios.filter(x=>x.id!==id);save();renderAll()}}
function removeUnidade(id){if(confirm("Excluir esta unidade?")){unidades=unidades.filter(x=>x.id!==id);save();renderUnidades();renderAll()}}
function removeMorador(id){if(confirm("Excluir este morador?")){moradores=moradores.filter(x=>x.id!==id);save();renderMoradores();renderAll()}}
function renderAll(){
 $("totalCondominios").textContent=condominios.length;
 $("totalUnidades").textContent=unidades.length;
 $("totalMoradores").textContent=moradores.length;
 renderCondominios();renderUnidades();renderMoradores();
}
$("currentDate").textContent=new Intl.DateTimeFormat("pt-BR",{dateStyle:"full"}).format(new Date());
renderAll();