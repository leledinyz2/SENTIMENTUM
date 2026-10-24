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

// ==========================================
// CONTROLE DE VOZ
// ==========================================

let vozAtivada = true;

const conteudo = document.getElementById("app-content");

// Falar texto
function falar(texto) {
  if (!vozAtivada) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.log("O navegador não oferece recurso de voz.");
    return;
  }

  speechSynthesis.cancel();

  const voz = new SpeechSynthesisUtterance(texto);

  voz.lang = "pt-BR";
  voz.rate = 0.9;
  voz.pitch = 1.1;
  voz.volume = 1.3;

  speechSynthesis.speak(voz);
}

// Parar imediatamente a voz
function pararVoz() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}

// Alternar entre voz e mudo
function alternarVoz() {
  vozAtivada = !vozAtivada;

  if (!vozAtivada) {
    pararVoz();
  }

  atualizarBotaoVoz();
}

// Atualizar botão de voz
function atualizarBotaoVoz() {
  const botao = document.getElementById("botao-voz");

  if (!botao) {
    return;
  }

  if (vozAtivada) {
    botao.innerHTML = "🔊 Voz ativada";
    botao.setAttribute("aria-label", "Desativar voz");
  } else {
    botao.innerHTML = "🔇 Mudo";
    botao.setAttribute("aria-label", "Ativar voz");
  }
}

// ==========================================
// BOTÃO DE VOZ
// ==========================================

function criarControleVoz() {
  return `
    <button
      id="botao-voz"
      class="botao-voz"
      onclick="alternarVoz()"
      aria-label="Desativar voz">
      🔊 Voz ativada
    </button>
  `;
}

// ==========================================
// TRANSCRIÇÃO AO PASSAR O MOUSE
// ==========================================

function falarAoPassar(elemento, texto) {
  // Não fala se estiver no modo mudo
  if (!vozAtivada) {
    return;
  }

  // Evita repetir a mesma opção continuamente
  if (elemento.dataset.lendo === "true") {
    return;
  }

  elemento.dataset.lendo = "true";

  falar(texto);

  // Libera novamente depois da fala
  setTimeout(() => {
    elemento.dataset.lendo = "false";
  }, 1200);
}

// ==========================================
// TELA INICIAL
// ==========================================

function inicio() {
  pararVoz();

  sentimentoEscolhido = null;
  motivoEscolhido = null;

  conteudo.innerHTML = `

    <div class="topo-voz">
      ${criarControleVoz()}
    </div>

    <div class="intro">

      <div class="icone-grande" aria-hidden="true">
        🌈
      </div>

      <h2>
        Vamos descobrir<br>
        como você está?
      </h2>

      <p class="subtitulo">
        Não existe resposta certa ou errada.
        Escolha o que combina com você.
      </p>

      <button
        class="btn-principal"
        onclick="telaSentimentos()">

        COMEÇAR

      </button>

    </div>
  `;

  atualizarBotaoVoz();
}

// ==========================================
// TELA DE SENTIMENTOS
// ==========================================

function telaSentimentos() {
  pararVoz();

  conteudo.innerHTML = `

    <div class="topo-voz">
      ${criarControleVoz()}
    </div>

    <div>

      <div class="progresso">
        PASSO 1 DE 2
      </div>

      <h2>
        Como você está?
      </h2>

      <p class="subtitulo">
        Passe o mouse sobre uma opção para ouvir.
        Depois toque ou clique para escolher.
      </p>

      <div class="grade">

        ${sentimentos
          .map(
            (item, index) => `

          <button
            class="opcao"
            onclick="selecionarSentimento(${index})"

            onmouseenter="falarAoPassar(
              this,
              '${item.nome}'
            )"

            onfocus="falarAoPassar(
              this,
              '${item.nome}'
            )"

            aria-label="${item.nome}.
            Passe o mouse ou use o teclado para ouvir.">

            <span
              class="emoji"
              aria-hidden="true">
              ${item.emoji}
            </span>

            <span class="nome">
              ${item.nome}
            </span>

          </button>

        `,
          )
          .join("")}

      </div>

    </div>
  `;

  atualizarBotaoVoz();
}

// ==========================================
// ESCOLHER SENTIMENTO
// ==========================================

function selecionarSentimento(index) {
  sentimentoEscolhido = sentimentos[index];

  pararVoz();

  falar(`Você escolheu ${sentimentoEscolhido.nome}.`);

  setTimeout(() => {
    telaMotivos();
  }, 900);
}

// ==========================================
// TELA DE MOTIVOS
// ==========================================

function telaMotivos() {
  pararVoz();

  conteudo.innerHTML = `

    <div class="topo-voz">
      ${criarControleVoz()}
    </div>

    <div>

      <div class="progresso">
        PASSO 2 DE 2
      </div>

      <h2>
        Por que você está
        ${sentimentoEscolhido.nome.toLowerCase()}?
      </h2>

      <p class="subtitulo">
        Passe o mouse sobre uma opção para ouvir.
        Se quiser, você também pode pular esta pergunta.
      </p>


      <div class="lista-motivos">

        ${motivos
          .map(
            (item, index) => `

          <button
            class="motivo"

            onclick="selecionarMotivo(${index})"

            onmouseenter="falarAoPassar(
              this,
              '${item.nome}'
            )"

            onfocus="falarAoPassar(
              this,
              '${item.nome}'
            )"

            aria-label="${item.nome}.
            Passe o mouse ou use o teclado para ouvir.">

            <span aria-hidden="true">
              ${item.emoji}
            </span>

            ${item.nome}

          </button>

        `,
          )
          .join("")}

      </div>


      <button
        class="btn-secundario"
        style="margin-top:14px"
        onclick="mostrarResultado(null)">

        PULAR ESTA PERGUNTA

      </button>

    </div>
  `;

  atualizarBotaoVoz();
}

// ==========================================
// ESCOLHER MOTIVO
// ==========================================

function selecionarMotivo(index) {
  motivoEscolhido = motivos[index];

  pararVoz();

  mostrarIA(motivoEscolhido);
}

// ==========================================
// CHAT IA
// ==========================================

conteudo.innerHTML = ``

function mostrarIA(motivo) {
  const sentimento = sentimentoEscolhido;

  let texto = `Você está ${sentimento.nome.toLowerCase()}.`;

  if (motivo && motivo.nome !== "Prefiro não responder") {
    texto += ` Motivo escolhido: ${motivo.nome}.`;
  }

  conteudo.innerHTML = `

    <main class="app-ai" aria-live="polite">
    <div class="chat-container">
        <!-- Cabeçalho da Aba -->
        <div class="chat-header">
          <div class="bot-avatar">🌿</div>
          <div>
            <h2>Espaço de Acolhimento</h2>
            <p>Como você está se sentindo hoje?</p>
          </div>
        </div>
      </div>

      <!-- Área onde as mensagens aparecem -->
        <div id="chat-text">
        <div id="chat-messages" class="chat-messages">
          <div class="message bot-message">
            Olá! Este é um espaço seguro para você desabafar, organizar seus
            pensamentos ou apenas conversar sobre o que está sentindo. Como
            posso te ouvir agora?
          </div>
        </div>

        <!-- Caixa de Digitação -->
        <div class="chat-input-area">
          <input
            type="text"
            id="user-input"
            placeholder="Digite o que está sentindo..."
            autocomplete="off"
          />
          <button id="send-btn" onclick="sendMessage()">Enviar</button>
        </div>
        </div>
      </main>

      <button
          class="btn-secundario"
          onclick="mostrarResultado(null)">

          RESULTADO

        </button>
  `;

  atualizarBotaoVoz();

  // Só fala automaticamente se a voz estiver ativada
  if (vozAtivada) {
    setTimeout(() => {
      falar(texto);
    }, 400);
  }
}

// ==========================================
// RESULTADO
// ==========================================

conteudo.innerHTML = ``

function mostrarResultado(motivo) {
  const sentimento = sentimentoEscolhido;

  let texto = `Você está ${sentimento.nome.toLowerCase()}.`;

  if (motivo && motivo.nome !== "Prefiro não responder") {
    texto += ` Motivo escolhido: ${motivo.nome}.`;
  }

  conteudo.innerHTML = `

    <div class="topo-voz">
      ${criarControleVoz()}
    </div>

    <div class="resultado">

      <div class="emoji">
        ${sentimento.emoji}
      </div>

      <h2>
        Você está<br>
        ${sentimento.nome}!
      </h2>


      <div class="card-resultado">

        <strong>
          Você escolheu:
        </strong>

        <p>
          ${sentimento.emoji}
          ${sentimento.nome}
        </p>

        ${
          motivo
            ? `
              <p>
                ${motivo.emoji}
                ${motivo.nome}
              </p>
            `
            : ""
        }

      </div>


      <div class="acoes">

        <button
          class="btn-principal"
          onclick="falarResultado()">

          🔊 OUVIR

        </button>


        <button
          class="btn-secundario"
          onclick="inicio()">

          ↩️ COMEÇAR DE NOVO

        </button>


        <a
          class="btn-whatsapp"
          href="#"
          onclick="enviarWhatsApp(); return false;">

          💬 Falar com coordenação pedagógica

        </a>

      </div>

    </div>

    <main class="app-ai" aria-live="polite">
    <div class="chat-container">
        <!-- Cabeçalho da Aba -->
        <div class="chat-header">
          <div class="bot-avatar">🌿</div>
          <div>
            <h2>Espaço de Acolhimento</h2>
            <p>Como você está se sentindo hoje?</p>
          </div>
        </div>
      </div>

      <!-- Área onde as mensagens aparecem -->
        <div id="chat-text">
        <div id="chat-messages" class="chat-messages">
          <div class="message bot-message">
            Olá! Este é um espaço seguro para você desabafar, organizar seus
            pensamentos ou apenas conversar sobre o que está sentindo. Como
            posso te ouvir agora?
          </div>
        </div>

        <!-- Caixa de Digitação -->
        <div class="chat-input-area">
          <input
            type="text"
            id="user-input"
            placeholder="Digite o que está sentindo..."
            autocomplete="off"
          />
          <button id="send-btn" onclick="sendMessage()">Enviar</button>
        </div>
        </div>
      </main>
  `;

  atualizarBotaoVoz();

  // Só fala automaticamente se a voz estiver ativada
  if (vozAtivada) {
    setTimeout(() => {
      falar(texto);
    }, 400);
  }
}

// ==========================================
// OUVIR RESULTADO
// ==========================================

function falarResultado() {
  const sentimento = sentimentoEscolhido;

  let texto = `Você está ${sentimento.nome.toLowerCase()}.`;

  if (motivoEscolhido && motivoEscolhido.nome !== "Prefiro não responder") {
    texto += ` O motivo escolhido foi ${motivoEscolhido.nome}.`;
  }

  falar(texto);
}

// ==========================================
// WHATSAPP — ENVIAR SENTIMENTO + MOTIVO
// ==========================================

function enviarWhatsApp() {
  if (!sentimentoEscolhido) {
    alert("Escolha primeiro como você está se sentindo.");
    return;
  }

  const telefone = "5511953760110";

  const sentimento = `${sentimentoEscolhido.emoji} ${sentimentoEscolhido.nome}`;

  let motivo = "Prefiro não informar";

  if (motivoEscolhido && motivoEscolhido.nome !== "Prefiro não responder") {
    motivo = `${motivoEscolhido.emoji} ${motivoEscolhido.nome}`;
  }

  const mensagem =
    `Olá, preciso de ajuda!\n\n` +
    `Meu sentimento: ${sentimento}\n` +
    `Motivo: ${motivo}\n\n` +
    `Gostaria de conversar sobre isso.`;

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}


// ==========================================
// INICIAR
// ==========================================

inicio();

// ATENÇÃO DE SEGURANÇA: Em produção (aplicativos reais publicados), o ideal é que
// a chave da API fique em um backend seu, e não direto no código do app para evitar roubo.
const API_KEY = "AQ.Ab8RN6J8kv13cPi_c96LarU41BAgvYgLXtbjvuGZZ6x6LmxoZg";

// Instrução de sistema para moldar a personalidade da IA (empática e acolhedora)
const systemInstruction =
  "Você é um assistente virtual empático, acolhedor e sensível. Seu objetivo é ouvir o usuário com atenção, validar os sentimentos dele, oferecer palavras de conforto e ajudá-lo a refletir de forma gentil sobre o que ele está sentindo. Nunca dê diagnósticos médicos ou psicológicos, e sugira ajuda profissional se notar um sofrimento extremo.";

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const messagesContainer = document.getElementById("chat-messages");
  const userText = inputField.value.trim();

  if (!userText) return;

  // 1. Mostra a mensagem do usuário na tela
  const userMsgDiv = document.createElement("div");
  userMsgDiv.className = "message user-message";
  userMsgDiv.textContent = userText;
  messagesContainer.appendChild(userMsgDiv);

  inputField.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // 2. Cria indicador de "digitando..."
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message bot-message";
  loadingDiv.textContent = "Pensando...";
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    // 3. Chamada para a API do Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${systemInstruction}\n\nUsuário disse: ${userText}` },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    // Remove a mensagem de "Pensando..."
    messagesContainer.removeChild(loadingDiv);

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;

      // Mostra a resposta da IA na tela
      const botMsgDiv = document.createElement("div");
      botMsgDiv.className = "message bot-message";
      botMsgDiv.textContent = aiReply;
      messagesContainer.appendChild(botMsgDiv);
    } else {
      throw new Error("Resposta inválida da API");
    }
  } catch (error) {
    messagesContainer.removeChild(loadingDiv);

    const errorDiv = document.createElement("div");
    errorDiv.className = "message bot-message";
    errorDiv.textContent =
      "Desculpe, tive um pequeno problema técnico para me conectar agora. Tente novamente em instantes.";
    messagesContainer.appendChild(errorDiv);
    console.error("Erro na IA:", error);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Permite enviar a mensagem apertando a tecla "Enter"
document
  .getElementById("user-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
