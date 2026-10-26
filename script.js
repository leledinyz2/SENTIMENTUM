"use strict";

const sentimentos = [
  { nome: "Feliz", emoji: "😀" },
  { nome: "Triste", emoji: "😢" },
  { nome: "Bravo(a)", emoji: "😡" },
  { nome: "Com medo", emoji: "😨" },
  { nome: "Cansado(a)", emoji: "😴" },
  { nome: "Em paz", emoji: "😌" },
  { nome: "Ansioso(a)", emoji: "😰" },
  { nome: "Confuso(a)", emoji: "😕" },
  { nome: "Animado(a)", emoji: "🤩" },
  { nome: "Preocupado(a)", emoji: "😟" },
  { nome: "Com carinho", emoji: "😍" },
  { nome: "Sobrecarregado(a)", emoji: "😵‍💫" },
  { nome: "Pensando em me machucar", emoji: "🆘", cuidado: true },
];

const motivos = [
  { nome: "Escola ou estudos", emoji: "🏫" },
  { nome: "Trabalho", emoji: "💼" },
  { nome: "Família", emoji: "🏠" },
  { nome: "Amizades ou relacionamentos", emoji: "🧑‍🤝‍🧑" },
  { nome: "Saúde", emoji: "🩺" },
  { nome: "Descanso ou sono", emoji: "🌙" },
  { nome: "Algo que aconteceu", emoji: "💭" },
  { nome: "Não sei", emoji: "❓" },
];

const necessidades = [
  "Conversar com alguém",
  "Um tempo em silêncio",
  "Ajuda para resolver algo",
  "Descansar um pouco",
  "Me distrair",
  "Ainda não sei",
];
const intensidades = ["Um pouco", "Leve", "Moderado", "Bastante", "Muito"];
const etapas = [
  { nome: "Sentimentos", opcional: false },
  { nome: "Intensidade", opcional: false },
  { nome: "Motivo", opcional: true },
  { nome: "Pausa", opcional: true },
  { nome: "O que preciso", opcional: false },
  { nome: "Resultado", opcional: false },
];
const frasesAcolhedoras = [
  "O que você sente merece espaço, sem pressa e sem julgamento.",
  "Você não precisa resolver tudo agora. Um pequeno passo já conta.",
  "Seus sentimentos são válidos. Seja gentil consigo neste momento.",
  "Tudo bem sentir isso. Você pode seguir no seu próprio ritmo.",
];

const conteudo = document.getElementById("app-content");
const anuncios = document.getElementById("anuncios");
const botaoTema = document.getElementById("theme-toggle");
const botaoVoz = document.getElementById("voice-toggle");

// As respostas existem somente neste objeto enquanto a página está aberta.
// Nenhum campo do formulário é enviado, armazenado ou registrado.
const estado = {
  tela: "inicio",
  sentimentos: [],
  intensidade: null,
  motivo: null,
  necessidades: [],
  temaEscuro: false,
  vozAtivada: false,
  intervaloPausa: null,
  segundosPausa: 30,
};

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caractere]);
}

function mapaEtapas(etapaAtual = 0) {
  return `
    <nav class="mapa" aria-label="Mapa das etapas">
      <p class="mapa-titulo">Seu percurso</p>
      <ol class="etapas">
        ${etapas.map((etapa, indice) => {
          const classes = ["etapa"];
          if (indice + 1 === etapaAtual) classes.push("atual");
          if (indice + 1 < etapaAtual) classes.push("concluida");
          if (etapa.opcional) classes.push("opcional");
          const corrente = indice + 1 === etapaAtual ? ' aria-current="step"' : "";
          return `<li class="${classes.join(" ")}"${corrente}><span class="numero">${indice + 1}</span><span>${etapa.nome}</span></li>`;
        }).join("")}
      </ol>
    </nav>`;
}

function iniciarRenderizacao(marcacao, etapaAtual = 0, falarTitulo = true) {
  pararPausa();
  conteudo.innerHTML = `${mapaEtapas(etapaAtual)}${marcacao}`;
  const titulo = conteudo.querySelector("h2");
  if (titulo) {
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
    if (falarTitulo && estado.vozAtivada) {
      setTimeout(() => falar(`${titulo.textContent.trim()}. ${textoOrientacao()}`), 80);
    }
  }
  atualizarControles();
}

function textoOrientacao() {
  const orientacao = conteudo.querySelector(".orientacao");
  return orientacao ? orientacao.textContent.trim() : "";
}

function anunciar(texto) {
  anuncios.textContent = "";
  window.setTimeout(() => { anuncios.textContent = texto; }, 20);
}

function falar(texto) {
  if (!estado.vozAtivada || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 0.92;
  fala.volume = 1;
  window.speechSynthesis.speak(fala);
}

function atualizarControles() {
  document.documentElement.dataset.theme = estado.temaEscuro ? "dark" : "light";
  botaoTema.setAttribute("aria-pressed", String(estado.temaEscuro));
  botaoTema.setAttribute("aria-label", estado.temaEscuro ? "Ativar tema claro" : "Ativar tema escuro");
  botaoTema.querySelector(".texto-controle").textContent = estado.temaEscuro ? "Tema claro" : "Tema escuro";
  botaoTema.querySelector("[aria-hidden]").textContent = estado.temaEscuro ? "☀️" : "🌙";

  botaoVoz.setAttribute("aria-pressed", String(estado.vozAtivada));
  botaoVoz.setAttribute("aria-label", estado.vozAtivada ? "Desativar leitura em voz alta" : "Ativar leitura em voz alta");
  botaoVoz.querySelector(".texto-controle").textContent = estado.vozAtivada ? "Leitura ligada" : "Leitura desligada";
  botaoVoz.querySelector("[aria-hidden]").textContent = estado.vozAtivada ? "🔈" : "🔊";
}

function telaInicio() {
  estado.tela = "inicio";
  iniciarRenderizacao(`
    <section class="intro" aria-labelledby="titulo-inicio">
      <div class="icone-grande" aria-hidden="true">🌈</div>
      <h2 id="titulo-inicio">Como você está se sentindo hoje?</h2>
      <p>Este é um momento para perceber o que está acontecendo com você. Não existe resposta certa ou errada; você pode pular as perguntas opcionais.</p>
      <div class="aviso-privacidade"><strong>Sua privacidade importa.</strong> O que você selecionar fica somente nesta página. Nada é enviado ou salvo.</div>
      <div class="acoes"><button class="btn-principal" type="button" data-action="comecar">Começar</button></div>
    </section>`, 0);
}

function telaSentimentos() {
  estado.tela = "sentimentos";
  const itens = sentimentos.map((item, indice) => `
    <button class="cartao-opcao" type="button" data-sentimento="${indice}" aria-pressed="${estado.sentimentos.includes(indice)}">
      <span class="emoji" aria-hidden="true">${item.emoji}</span><span class="nome">${escaparHTML(item.nome)}</span>
    </button>`).join("");
  const naoSeiSelecionado = estado.sentimentos.includes("nao-sei");
  iniciarRenderizacao(`
    <section aria-labelledby="titulo-sentimentos">
      <header class="passo-cabecalho"><h2 id="titulo-sentimentos">Como você está se sentindo?</h2>
        <p class="orientacao">Escolha um ou mais sentimentos. Selecione “Não sei o que estou sentindo” para usar somente essa opção.</p>
      </header>
      <div class="grade" aria-label="Opções de sentimentos">
        ${itens}
        <button class="cartao-opcao opcao-nao-sei" type="button" data-nao-sei aria-pressed="${naoSeiSelecionado}">
          <span class="emoji" aria-hidden="true">❔</span><span class="nome">Não sei o que estou sentindo</span>
        </button>
      </div>
      <div class="acoes"><button class="btn-secundario" type="button" data-action="voltar-inicio">Voltar</button>
        <button class="btn-principal" type="button" data-action="ir-intensidade" ${estado.sentimentos.length ? "" : "disabled"}>Continuar</button></div>
    </section>`, 1, false);
}

function telaIntensidade() {
  estado.tela = "intensidade";
  iniciarRenderizacao(`
    <section aria-labelledby="titulo-intensidade">
      <header class="passo-cabecalho"><h2 id="titulo-intensidade">Quanta intensidade você sente?</h2>
        <p class="orientacao">Não há uma medida certa. Escolha o número que mais combina com este momento.</p></header>
      <div class="intensidade" role="group" aria-label="Intensidade, de 1 a 5">
        <div class="intensidade-legenda"><span>Um pouco</span><span>Muito</span></div>
        <div class="escala">${intensidades.map((nome, indice) => `<button class="nivel" type="button" data-intensidade="${indice + 1}" aria-pressed="${estado.intensidade === indice + 1}" aria-label="${indice + 1} de 5, ${nome}">${indice + 1}</button>`).join("")}</div>
        <p class="leitura-nivel" id="leitura-nivel" aria-live="polite">${estado.intensidade ? `Nível selecionado: ${estado.intensidade} de 5 — ${intensidades[estado.intensidade - 1]}.` : "Escolha um nível de 1 a 5."}</p>
      </div>
      <div class="acoes"><button class="btn-secundario" type="button" data-action="voltar-sentimentos">Voltar</button>
        <button class="btn-principal" type="button" data-action="ir-motivo" ${estado.intensidade ? "" : "disabled"}>Continuar</button></div>
    </section>`, 2, false);
}

function telaMotivos() {
  estado.tela = "motivos";
  const opcoes = motivos.map((item, indice) => `
    <button class="motivo" type="button" data-motivo="${indice}" aria-pressed="${estado.motivo === indice}">
      <span aria-hidden="true">${item.emoji}</span> ${escaparHTML(item.nome)}
    </button>`).join("");
  iniciarRenderizacao(`
    <section aria-labelledby="titulo-motivo">
      <header class="passo-cabecalho"><h2 id="titulo-motivo">Quer relacionar isso a algum motivo?</h2>
        <p class="orientacao"><strong>Esta etapa é opcional.</strong> Você pode escolher uma opção ou seguir sem responder.</p></header>
      <div class="lista-motivos" aria-label="Motivos opcionais">${opcoes}</div>
      <div class="acoes"><button class="btn-secundario" type="button" data-action="voltar-intensidade">Voltar</button>
        <button class="btn-principal" type="button" data-action="ir-pausa">${estado.motivo === null ? "Pular e continuar" : "Continuar"}</button></div>
    </section>`, 3, false);
}

function telaPausa() {
  estado.tela = "pausa";
  estado.segundosPausa = 30;
  iniciarRenderizacao(`
    <section aria-labelledby="titulo-pausa">
      <header class="passo-cabecalho"><h2 id="titulo-pausa">Quer fazer uma pausa breve?</h2>
        <p class="orientacao"><strong>A pausa é opcional.</strong> Você pode ficar aqui por alguns instantes ou continuar agora. Não precisa mudar sua respiração nem fazer nada de um jeito específico.</p></header>
      <div class="pausa-card">
        <span class="pausa-icone" aria-hidden="true">🍃</span>
        <h3>Um momento no seu ritmo</h3>
        <p>Se for confortável, perceba onde você está e descanse por alguns segundos.</p>
        <p class="contador" id="contador-pausa" aria-live="off">00:30</p>
        <button class="btn-secundario" type="button" data-action="iniciar-pausa">Começar pausa de 30 segundos</button>
      </div>
      <div class="acoes"><button class="btn-secundario" type="button" data-action="voltar-motivo">Voltar</button>
        <button class="btn-principal" type="button" data-action="ir-necessidades">Continuar agora</button></div>
    </section>`, 4, false);
}

function telaNecessidades() {
  estado.tela = "necessidades";
  const opcoes = necessidades.map((nome, indice) => `
    <button class="necessidade" type="button" data-necessidade="${indice}" aria-pressed="${estado.necessidades.includes(indice)}">${escaparHTML(nome)}</button>`).join("");
  iniciarRenderizacao(`
    <section aria-labelledby="titulo-necessidades">
      <header class="passo-cabecalho"><h2 id="titulo-necessidades">O que você precisa agora?</h2>
        <p class="orientacao">Escolha o que parece útil neste momento. Você pode marcar mais de uma opção ou não escolher nenhuma.</p></header>
      <div class="lista-necessidades" aria-label="O que pode ajudar agora">${opcoes}</div>
      <div class="acoes"><button class="btn-secundario" type="button" data-action="voltar-pausa">Voltar</button>
        <button class="btn-principal" type="button" data-action="ver-resultado">Ver meu resultado</button></div>
    </section>`, 5, false);
}

function obterResumoSentimentos() {
  if (estado.sentimentos.includes("nao-sei")) return "Ainda não sei o que estou sentindo";
  return estado.sentimentos.map((indice) => `${sentimentos[indice].emoji} ${sentimentos[indice].nome}`).join(", ");
}

function escolherFrase() {
  if (estado.sentimentos.includes("nao-sei")) return "Tudo bem ainda não ter certeza. Você pode se dar tempo para perceber.";
  if (estado.sentimentos.some((indice) => sentimentos[indice].cuidado)) return "Você merece apoio e não precisa passar por isso sem companhia.";
  if (estado.intensidade >= 4) return "Quando algo parece intenso, vale buscar apoio e ir um passo de cada vez.";
  return frasesAcolhedoras[(estado.sentimentos[0] || 0) % frasesAcolhedoras.length];
}

function telaResultado() {
  estado.tela = "resultado";
  const frase = escolherFrase();
  const motivo = estado.motivo === null ? "Não informado" : `${motivos[estado.motivo].emoji} ${motivos[estado.motivo].nome}`;
  const listaNecessidades = estado.necessidades.length
    ? estado.necessidades.map((indice) => necessidades[indice]).join(", ")
    : "Nenhuma opção selecionada";
  const haSinalCuidado = estado.sentimentos.some((indice) => sentimentos[indice].cuidado);
  const notaCuidado = haSinalCuidado ? `
    <aside class="nota-seguranca"><strong>Você não precisa lidar com isso sozinho(a).</strong> Se houver risco de se machucar agora, procure imediatamente uma pessoa de confiança e os serviços de emergência da sua região.</aside>` : "";
  const mensagemGenerica = "Olá, gostaria de conversar com alguém da equipe. Você pode me ajudar?";
  const linkWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagemGenerica)}`;
  iniciarRenderizacao(`
    <section class="resultado" aria-labelledby="titulo-resultado">
      <div class="emoji-resultado" aria-hidden="true">💜</div>
      <h2 id="titulo-resultado">Obrigado por fazer essa pausa</h2>
      <p class="orientacao">Perceber como você está já é um jeito de cuidar de si.</p>
      <div class="card-resultado">
        <p class="frase-acolhedora">“${escaparHTML(frase)}”</p>
        <p><strong>Sentimento(s):</strong> ${escaparHTML(obterResumoSentimentos())}</p>
        <p><strong>Intensidade:</strong> ${estado.intensidade} de 5 — ${intensidades[estado.intensidade - 1]}</p>
        <p><strong>Motivo:</strong> ${escaparHTML(motivo)}</p>
        <p><strong>O que pode ajudar agora:</strong> ${escaparHTML(listaNecessidades)}</p>
      </div>
      ${notaCuidado}
      <div class="acoes">
        <button class="btn-principal" type="button" data-action="ouvir-resultado">Ouvir resultado</button>
        <button class="btn-secundario" type="button" data-action="recomecar">Começar de novo</button>
        <a class="btn-link whatsapp" href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp com mensagem genérica</a>
      </div>
      <p class="orientacao">O WhatsApp abre sem incluir suas respostas. Revise a mensagem e envie por conta própria, se quiser.</p>
    </section>`, 6, false);
  anunciar("Resultado pronto. Suas respostas continuam somente nesta página.");
}

function limparSelecoes() {
  estado.sentimentos = [];
  estado.intensidade = null;
  estado.motivo = null;
  estado.necessidades = [];
}

function pararPausa() {
  if (estado.intervaloPausa !== null) {
    window.clearInterval(estado.intervaloPausa);
    estado.intervaloPausa = null;
  }
}

function iniciarPausa() {
  pararPausa();
  estado.segundosPausa = 30;
  atualizarContador();
  const botao = conteudo.querySelector('[data-action="iniciar-pausa"]');
  if (botao) botao.disabled = true;
  estado.intervaloPausa = window.setInterval(() => {
    estado.segundosPausa -= 1;
    atualizarContador();
    if (estado.segundosPausa <= 0) {
      pararPausa();
      if (botao) {
        botao.disabled = false;
        botao.textContent = "Fazer outra pausa de 30 segundos";
      }
      anunciar("A pausa de 30 segundos terminou. Continue quando se sentir pronto(a).");
    }
  }, 1000);
}

function atualizarContador() {
  const contador = document.getElementById("contador-pausa");
  if (!contador) return;
  const minutos = String(Math.floor(estado.segundosPausa / 60)).padStart(2, "0");
  const segundos = String(estado.segundosPausa % 60).padStart(2, "0");
  contador.textContent = `${minutos}:${segundos}`;
}

conteudo.addEventListener("click", (evento) => {
  const sentimentoBotao = evento.target.closest("[data-sentimento]");
  if (sentimentoBotao) {
    const indice = Number(sentimentoBotao.dataset.sentimento);
    const existente = estado.sentimentos.indexOf(indice);
    if (existente >= 0) estado.sentimentos.splice(existente, 1);
    else {
      estado.sentimentos = estado.sentimentos.filter((valor) => valor !== "nao-sei");
      estado.sentimentos.push(indice);
    }
    atualizarSelecaoSentimentos();
    anunciar(estado.sentimentos.includes(indice) ? `${sentimentos[indice].nome} selecionado.` : `${sentimentos[indice].nome} removido.`);
    return;
  }

  if (evento.target.closest("[data-nao-sei]")) {
    const jaSelecionado = estado.sentimentos.includes("nao-sei");
    estado.sentimentos = jaSelecionado ? [] : ["nao-sei"];
    atualizarSelecaoSentimentos();
    anunciar(jaSelecionado ? "Não sei o que estou sentindo desmarcado." : "Não sei o que estou sentindo selecionado. Essa opção é exclusiva.");
    return;
  }

  const intensidadeBotao = evento.target.closest("[data-intensidade]");
  if (intensidadeBotao) {
    estado.intensidade = Number(intensidadeBotao.dataset.intensidade);
    conteudo.querySelectorAll("[data-intensidade]").forEach((botao) => botao.setAttribute("aria-pressed", String(Number(botao.dataset.intensidade) === estado.intensidade)));
    const leitura = document.getElementById("leitura-nivel");
    leitura.textContent = `Nível selecionado: ${estado.intensidade} de 5 — ${intensidades[estado.intensidade - 1]}.`;
    conteudo.querySelector('[data-action="ir-motivo"]').disabled = false;
    anunciar(leitura.textContent);
    return;
  }

  const motivoBotao = evento.target.closest("[data-motivo]");
  if (motivoBotao) {
    const indice = Number(motivoBotao.dataset.motivo);
    estado.motivo = estado.motivo === indice ? null : indice;
    conteudo.querySelectorAll("[data-motivo]").forEach((botao) => botao.setAttribute("aria-pressed", String(Number(botao.dataset.motivo) === estado.motivo)));
    const continuar = conteudo.querySelector('[data-action="ir-pausa"]');
    continuar.textContent = estado.motivo === null ? "Pular e continuar" : "Continuar";
    anunciar(estado.motivo === null ? "Motivo desmarcado." : `${motivos[indice].nome} selecionado.`);
    return;
  }

  const necessidadeBotao = evento.target.closest("[data-necessidade]");
  if (necessidadeBotao) {
    const indice = Number(necessidadeBotao.dataset.necessidade);
    if (estado.necessidades.includes(indice)) estado.necessidades = estado.necessidades.filter((item) => item !== indice);
    else {
      if (necessidades[indice] === "Ainda não sei") estado.necessidades = [indice];
      else {
        estado.necessidades = estado.necessidades.filter((item) => necessidades[item] !== "Ainda não sei");
        estado.necessidades.push(indice);
      }
    }
    conteudo.querySelectorAll("[data-necessidade]").forEach((botao) => botao.setAttribute("aria-pressed", String(estado.necessidades.includes(Number(botao.dataset.necessidade)))));
    anunciar(estado.necessidades.includes(indice) ? `${necessidades[indice]} selecionado.` : `${necessidades[indice]} desmarcado.`);
    return;
  }

  const acao = evento.target.closest("[data-action]")?.dataset.action;
  switch (acao) {
    case "comecar": telaSentimentos(); break;
    case "voltar-inicio": telaInicio(); break;
    case "ir-intensidade": if (estado.sentimentos.length) telaIntensidade(); break;
    case "voltar-sentimentos": telaSentimentos(); break;
    case "ir-motivo": if (estado.intensidade) telaMotivos(); break;
    case "voltar-intensidade": telaIntensidade(); break;
    case "ir-pausa": telaPausa(); break;
    case "voltar-motivo": telaMotivos(); break;
    case "iniciar-pausa": iniciarPausa(); break;
    case "ir-necessidades": telaNecessidades(); break;
    case "voltar-pausa": telaPausa(); break;
    case "ver-resultado": telaResultado(); break;
    case "recomecar": limparSelecoes(); telaInicio(); anunciar("Percurso reiniciado. As escolhas anteriores foram apagadas da página."); break;
    case "ouvir-resultado": falar(conteudo.innerText); break;
    default: break;
  }
});

function atualizarSelecaoSentimentos() {
  conteudo.querySelectorAll("[data-sentimento]").forEach((botao) => botao.setAttribute("aria-pressed", String(estado.sentimentos.includes(Number(botao.dataset.sentimento)))));
  const naoSei = conteudo.querySelector("[data-nao-sei]");
  naoSei.setAttribute("aria-pressed", String(estado.sentimentos.includes("nao-sei")));
  conteudo.querySelector('[data-action="ir-intensidade"]').disabled = estado.sentimentos.length === 0;
}

botaoTema.addEventListener("click", () => {
  estado.temaEscuro = !estado.temaEscuro;
  atualizarControles();
  anunciar(estado.temaEscuro ? "Tema escuro ativado para esta página." : "Tema claro ativado para esta página.");
});

botaoVoz.addEventListener("click", () => {
  estado.vozAtivada = !estado.vozAtivada;
  if (!estado.vozAtivada && "speechSynthesis" in window) window.speechSynthesis.cancel();
  atualizarControles();
  anunciar(estado.vozAtivada ? "Leitura em voz alta ativada. Use o botão Ouvir resultado ou navegue pelas etapas." : "Leitura em voz alta desativada.");
  if (estado.vozAtivada) {
    const titulo = conteudo.querySelector("h2");
    if (titulo) falar(`${titulo.textContent.trim()}. ${textoOrientacao()}`);
  }
});

window.addEventListener("pagehide", () => {
  pararPausa();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});

telaInicio();
