const sentimentos = [
  { nome: "Feliz", emoji: "😀" },
  { nome: "Triste", emoji: "😢" },
  { nome: "Bravo(a)", emoji: "😡" },
  { nome: "Com medo", emoji: "😨" },
  { nome: "Cansado(a)", emoji: "😴" },
  { nome: "Normal", emoji: "😐" },
  { nome: "Ansiedade", emoji: "😰" },
  { nome: "Suicídio", emoji: "🆘" },
  { nome: "Surpreso(a)", emoji: "😮" },
  { nome: "Confuso(a)", emoji: "😕" },
  { nome: "Animado(a)", emoji: "🤩" },
  { nome: "Preocupado(a)", emoji: "😟" },
  { nome: "Paixão", emoji: "😍" },
];

const motivos = [
  { nome: "Escola", emoji: "🏫" },
  { nome: "Trabalho", emoji: "💼" },
  { nome: "Família", emoji: "👨‍👩‍👧" },
  { nome: "Amigos", emoji: "🧑‍🤝‍🧑" },
  { nome: "Brincadeira", emoji: "🧸" },
  { nome: "Comida", emoji: "🍎" },
  { nome: "Sono", emoji: "🛌" },
  { nome: "Não sei", emoji: "❓" },
  { nome: "Prefiro não responder", emoji: "🙅" },
];

let sentimentoEscolhido = null;
let motivoEscolhido = null;
let vozAtivada = true;
let historicoChat = [];
const conteudo = document.getElementById("app-content");

function falar(texto) {
  if (!vozAtivada || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "pt-BR";
  voz.rate = 0.9;
  voz.pitch = 1.1;
  voz.volume = 1;
  window.speechSynthesis.speak(voz);
}

function pararVoz() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function alternarVoz() {
  vozAtivada = !vozAtivada;
  if (!vozAtivada) pararVoz();
  atualizarBotaoVoz();
}

function atualizarBotaoVoz() {
  const botao = document.getElementById("botao-voz");
  if (!botao) return;
  botao.textContent = vozAtivada ? "🔊 Voz ativada" : "🔇 Mudo";
  botao.setAttribute("aria-label", vozAtivada ? "Desativar voz" : "Ativar voz");
}

function criarControleVoz() {
  return `<div class="topo-voz"><button id="botao-voz" class="botao-voz" type="button" onclick="alternarVoz()">🔊 Voz ativada</button></div>`;
}

function falarAoPassar(elemento, texto) {
  if (!vozAtivada || elemento.dataset.lendo === "true") return;
  elemento.dataset.lendo = "true";
  falar(texto);
  setTimeout(() => { elemento.dataset.lendo = "false"; }, 1200);
}

function inicio() {
  pararVoz();
  sentimentoEscolhido = null;
  motivoEscolhido = null;
  historicoChat = [];
  conteudo.innerHTML = `
    ${criarControleVoz()}
    <div class="intro">
      <div class="icone-grande" aria-hidden="true">🌈</div>
      <h2>Vamos descobrir<br>como você está?</h2>
      <p class="subtitulo">Não existe resposta certa ou errada. Escolha o que combina com você.</p>
      <button class="btn-principal" type="button" onclick="telaSentimentos()">COMEÇAR</button>
    </div>`;
  atualizarBotaoVoz();
}

function telaSentimentos() {
  pararVoz();
  conteudo.innerHTML = `
    ${criarControleVoz()}
    <div>
      <div class="progresso">PASSO 1 DE 2</div>
      <h2>Como você está?</h2>
      <p class="subtitulo">Passe o mouse sobre uma opção para ouvir. Depois toque ou clique para escolher.</p>
      <div class="grade">
        ${sentimentos.map((item, index) => `
          <button class="opcao" type="button" onclick="selecionarSentimento(${index})"
            onmouseenter="falarAoPassar(this, '${item.nome}')" onfocus="falarAoPassar(this, '${item.nome}')"
            aria-label="${item.nome}. Passe o mouse ou use o teclado para ouvir.">
            <span class="emoji" aria-hidden="true">${item.emoji}</span><span class="nome">${item.nome}</span>
          </button>`).join("")}
      </div>
    </div>`;
  atualizarBotaoVoz();
}

function selecionarSentimento(index) {
  sentimentoEscolhido = sentimentos[index];
  pararVoz();
  falar(`Você escolheu ${sentimentoEscolhido.nome}.`);
  setTimeout(telaMotivos, 600);
}

function telaMotivos() {
  pararVoz();
  if (!sentimentoEscolhido) return telaSentimentos();
  conteudo.innerHTML = `
    ${criarControleVoz()}
    <div>
      <div class="progresso">PASSO 2 DE 2</div>
      <h2>Por que você está ${sentimentoEscolhido.nome.toLowerCase()}?</h2>
      <p class="subtitulo">Se quiser, conte o que pode estar relacionado ao seu sentimento. Você também pode pular.</p>
      <div class="lista-motivos">
        ${motivos.map((item, index) => `
          <button class="motivo" type="button" onclick="selecionarMotivo(${index})"
            onmouseenter="falarAoPassar(this, '${item.nome}')" onfocus="falarAoPassar(this, '${item.nome}')"
            aria-label="${item.nome}. Passe o mouse ou use o teclado para ouvir.">
            <span aria-hidden="true">${item.emoji}</span> ${item.nome}
          </button>`).join("")}
      </div>
      <button class="btn-secundario" style="margin-top:14px" type="button" onclick="abrirChat(null)">PULAR ESTA PERGUNTA</button>
    </div>`;
  atualizarBotaoVoz();
}

function selecionarMotivo(index) {
  motivoEscolhido = motivos[index];
  abrirChat(motivoEscolhido);
}

function abrirChat(motivo) {
  pararVoz();
  motivoEscolhido = motivo;
  historicoChat = [];
  const sentimento = sentimentoEscolhido;
  if (!sentimento) return inicio();

  const acolhimentoInicial = sentimento.nome === "Suicídio"
    ? "Obrigado por me contar. Sinto muito que esteja passando por isso. Você merece apoio de uma pessoa de confiança agora. Quer me contar o que está acontecendo? Se você estiver em perigo imediato ou já tiver se machucado, procure agora um adulto de confiança e os serviços de emergência da sua região."
    : "Olá! Este é um espaço para conversar sobre o que você está sentindo. Não existe resposta certa. Como posso te ouvir agora?";

  conteudo.innerHTML = `
    <div class="chat-page">
      ${criarControleVoz()}
      <div class="progresso">CONVERSA DE ACOLHIMENTO</div>
      <section class="chat-card" aria-label="Conversa com assistente de IA">
        <header class="chat-header">
          <div class="bot-avatar" aria-hidden="true">🌿</div>
          <div><h2>Espaço de Acolhimento</h2><p>Uma conversa gentil sobre seus sentimentos</p></div>
        </header>
        <div id="chat-messages" class="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
          <div class="message bot-message">${acolhimentoInicial}</div>
        </div>
        <form id="chat-form" class="chat-input-area">
          <input type="text" id="user-input" maxlength="2000" placeholder="Digite o que está sentindo..." autocomplete="off" aria-label="Sua mensagem" />
          <button id="send-btn" type="submit">Enviar</button>
        </form>
      </section>
      <p class="chat-notice">Conversa com IA: não substitui o apoio de um adulto ou profissional. Evite informar nome completo, endereço ou outros dados pessoais.</p>
      <div class="chat-actions">
        <button class="btn-secundario" type="button" onclick="telaMotivos()">← Voltar</button>
        <button class="btn-principal" type="button" onclick="mostrarResultado(motivoEscolhido)">Ver resultado</button>
      </div>
    </div>`;
  atualizarBotaoVoz();

  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });
  document.getElementById("user-input").focus();
}

function adicionarMensagem(texto, classe) {
  const messagesContainer = document.getElementById("chat-messages");
  const mensagem = document.createElement("div");
  mensagem.className = `message ${classe}`;
  mensagem.textContent = texto;
  messagesContainer.appendChild(mensagem);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return mensagem;
}

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const sendButton = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("chat-messages");
  if (!inputField || !sendButton || !messagesContainer || sendButton.disabled) return;

  const userText = inputField.value.trim();
  if (!userText) return;

  adicionarMensagem(userText, "user-message");
  historicoChat.push({ role: "user", text: userText });
  inputField.value = "";
  inputField.disabled = true;
  sendButton.disabled = true;
  const loadingMessage = adicionarMensagem("Pensando...", "bot-message");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sentimento: sentimentoEscolhido?.nome || "Não informado",
        motivo: motivoEscolhido?.nome || "Não informado",
        messages: historicoChat,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Erro do servidor (${response.status})`);
    if (!data.reply || typeof data.reply !== "string") throw new Error("A resposta da IA veio vazia.");

    historicoChat.push({ role: "model", text: data.reply });
    loadingMessage.remove();
    adicionarMensagem(data.reply, "bot-message");
  } catch (error) {
    loadingMessage.remove();
    adicionarMensagem(
      "Não consegui me conectar à IA agora. Confira se o servidor está iniciado e tente novamente. Você ainda pode ver seu resultado.",
      "bot-message",
    );
    console.error("Erro no chat:", error);
  } finally {
    const currentInput = document.getElementById("user-input");
    const currentButton = document.getElementById("send-btn");
    if (currentInput) { currentInput.disabled = false; currentInput.focus(); }
    if (currentButton) currentButton.disabled = false;
    if (messagesContainer.isConnected) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function mostrarResultado(motivo = motivoEscolhido) {
  pararVoz();
  if (!sentimentoEscolhido) return inicio();
  motivoEscolhido = motivo || null;
  const sentimento = sentimentoEscolhido;
  conteudo.innerHTML = `
    ${criarControleVoz()}
    <div class="resultado">
      <div class="emoji" aria-hidden="true">${sentimento.emoji}</div>
      <h2>Você está<br>${sentimento.nome}!</h2>
      <div class="card-resultado">
        <strong>Você escolheu:</strong>
        <p>${sentimento.emoji} ${sentimento.nome}</p>
        ${motivoEscolhido ? `<p>${motivoEscolhido.emoji} ${motivoEscolhido.nome}</p>` : ""}
      </div>
      <div class="acoes">
        <button class="btn-principal" type="button" onclick="falarResultado()">🔊 OUVIR</button>
        <button class="btn-secundario" type="button" onclick="abrirChat(motivoEscolhido)">← VOLTAR À CONVERSA</button>
        <button class="btn-secundario" type="button" onclick="inicio()">↩️ COMEÇAR DE NOVO</button>
        <a class="btn-whatsapp" href="#" onclick="enviarWhatsApp(); return false;">💬 Falar com coordenação pedagógica</a>
      </div>
    </div>`;
  atualizarBotaoVoz();
  if (vozAtivada) setTimeout(falarResultado, 350);
}

function falarResultado() {
  if (!sentimentoEscolhido) return;
  let texto = `Você está ${sentimentoEscolhido.nome.toLowerCase()}.`;
  if (motivoEscolhido) texto += ` O motivo escolhido foi ${motivoEscolhido.nome}.`;
  falar(texto);
}

function enviarWhatsApp() {
  if (!sentimentoEscolhido) return;
  const telefone = "5511953760110"; // Troque pelo telefone correto da coordenação.
  const sentimento = `${sentimentoEscolhido.emoji} ${sentimentoEscolhido.nome}`;
  const motivo = motivoEscolhido ? `${motivoEscolhido.emoji} ${motivoEscolhido.nome}` : "Prefiro não informar";
  const mensagem = `Olá, preciso de ajuda!\n\nMeu sentimento: ${sentimento}\nMotivo: ${motivo}\n\nGostaria de conversar sobre isso.`;
  window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
}

inicio();
