// Escudo Digital — simulador de golpes, tamanho da letra e checklist.

const cases = [
  {
    name: "Número desconhecido", sub: "+55 11 9xxxx-4821", avatar: "?",
    msg: "Oi pai, troquei de número, salva esse aqui 😊\nO outro celular caiu na água.\nPai, tô com um problema, preciso pagar um boleto hoje e o app do banco ainda não tá funcionando no celular novo. Consegue fazer um Pix de R$ 1.850 pra mim? Amanhã te devolvo.",
    scam: true,
    why: [
      "Número novo + pedido de dinheiro é o golpe mais comum do WhatsApp.",
      "Tem pressa (\"hoje\") e uma desculpa pronta para não poder pagar sozinho.",
      "O que fazer: ligue para o número antigo do seu filho ou pergunte algo que só ele saberia."
    ]
  },
  {
    name: "CORREIOS", sub: "Mensagem SMS", avatar: "📦",
    msg: "CORREIOS: Sua encomenda BR8823410 está retida por falta de pagamento da taxa de R$ 9,90. Regularize em até 24h para evitar a devolução:\n<span class=\"link\">correios-rastreio-taxa.com/pg</span>",
    scam: true,
    why: [
      "O endereço do link não é o site oficial dos Correios.",
      "Prazo curto para pressionar você.",
      "O que fazer: confira a encomenda você mesmo, no aplicativo oficial dos Correios."
    ]
  },
  {
    name: "Neide (vizinha)", sub: "Contato salvo há anos", avatar: "N",
    msg: "Bom dia! Amanhã vou na feira às 8h, quer que eu traga alguma coisa? Se quiser me fala até hoje à noite 🍅",
    scam: false,
    why: [
      "Contato conhecido, sem link, sem pedido de dinheiro e sem código.",
      "Nem toda mensagem é golpe. Fique alerta quando aparecer: dinheiro, link, código ou pressa."
    ]
  },
  {
    name: "Central de Segurança", sub: "Ligação recebida · 0800 xxx xxxx", avatar: "☎️", call: true,
    msg: "📞 Ligação:\n\"Aqui é da central de segurança do seu banco. Identificamos uma compra de R$ 3.200 no seu cartão. Para cancelar, vou enviar um código por SMS e o senhor me fala o número, tudo bem?\"",
    scam: true,
    why: [
      "Banco nunca pede código, senha ou token por telefone.",
      "O golpista assusta com uma compra falsa para você agir rápido.",
      "O que fazer: desligue e ligue você para o número que está atrás do cartão."
    ]
  },
  {
    name: "WhatsApp", sub: "Mensagem SMS", avatar: "💬",
    msg: "Seu código do WhatsApp: 482-913\nNão compartilhe esse código com ninguém.",
    question: "Logo depois, um desconhecido escreve: \"Te mandei um código por engano, pode me passar?\". O que você faz?",
    scamLabel: "🚫 Não passo",
    safeLabel: "Passo o código",
    scam: true,
    why: [
      "Esse código serve para ligar o SEU WhatsApp em outro celular.",
      "Quem tem o código rouba sua conta e pede dinheiro para seus contatos.",
      "O que fazer: nunca passe o código. Ative a confirmação em duas etapas (Etapa 3)."
    ]
  },
  {
    name: "Clínica São Lucas", sub: "Contato salvo · você marcou consulta", avatar: "🩺",
    msg: "Olá! Confirmamos sua consulta com o Dr. Paulo na quinta, às 14h. Responda SIM para confirmar ou NÃO para remarcar. Não é necessário pagamento antecipado.",
    scam: false,
    why: [
      "Você mesmo marcou a consulta e o contato já está salvo.",
      "Não pede dinheiro, link, código nem dados pessoais."
    ]
  },
  {
    name: "Promoção Magazine", sub: "+55 21 9xxxx-0073", avatar: "🎁",
    msg: "PARABÉNS!!! 🎉 Você foi sorteado e ganhou uma Air Fryer. Só pague o frete de R$ 19,90 no link:\n<span class=\"link\">promo-sorteio-premios.shop/airfryer</span>",
    scam: true,
    why: [
      "Você não participou de nenhum sorteio.",
      "\"Só paga o frete\" é a isca para roubar seu dinheiro e os dados do cartão.",
      "O site tem nome estranho e não é o site oficial da loja."
    ]
  }
];

const sim = document.getElementById("sim");
let current = 0;
let results = [];

function stripTags(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

function header() {
  const pct = Math.round((current / cases.length) * 100);
  return `
    <p class="count">Mensagem ${Math.min(current + 1, cases.length)} de ${cases.length}</p>
    <div class="bar" aria-hidden="true"><div class="bar-fill" style="width:${pct}%"></div></div>`;
}

function render() {
  if (current >= cases.length) return renderResult();
  const c = cases[current];
  sim.innerHTML = `
    ${header()}
    <div class="phone">
      <div class="screen">
        <div class="chat-head">
          <span class="avatar" aria-hidden="true">${c.avatar}</span>
          <span><b>${c.name}</b><small>${c.sub}</small></span>
        </div>
        <div class="chat-body">
          <div class="bubble ${c.call ? "call" : ""}">${c.msg}</div>
          ${"speechSynthesis" in window ? '<button type="button" class="listen" id="listen">🔊 Ouvir a mensagem</button>' : ""}
        </div>
      </div>
    </div>
    <p class="question">${c.question || "Essa mensagem é golpe?"}</p>
    <div class="choices">
      <button type="button" class="choice choice-scam" data-scam="1">${c.scamLabel || "🚨 É golpe"}</button>
      <button type="button" class="choice choice-safe" data-scam="0">${c.safeLabel || "✅ É seguro"}</button>
    </div>
    <div id="feedback"></div>`;

  const listen = document.getElementById("listen");
  if (listen) listen.addEventListener("click", () => speak(stripTags(c.msg)));
  sim.querySelectorAll(".choice").forEach(btn => btn.addEventListener("click", () => answer(btn)));
}

function answer(btn) {
  const c = cases[current];
  const saidScam = btn.dataset.scam === "1";
  const right = saidScam === c.scam;
  results[current] = right;

  sim.querySelectorAll(".choice").forEach(b => { b.disabled = true; });
  btn.classList.add("picked");

  const verdict = (right ? "👏 Acertou! " : "⚠️ Cuidado! ") + (c.scam ? "Isto é golpe." : "Esta mensagem é segura.");
  document.getElementById("feedback").innerHTML = `
    <div class="feedback ${right ? "right" : "wrong"}">
      <p class="verdict">${verdict}</p>
      <ul>${c.why.map(w => `<li>${w}</li>`).join("")}</ul>
    </div>
    <button type="button" class="btn btn-big" id="next" style="margin-top:16px">
      ${current + 1 < cases.length ? "Próxima mensagem ➜" : "Ver meu resultado ➜"}
    </button>`;

  const next = document.getElementById("next");
  next.addEventListener("click", () => {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    current++;
    render();
    sim.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("feedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderResult() {
  const hits = results.filter(Boolean).length;
  const total = cases.length;
  const starCount = hits === total ? 3 : hits >= total - 2 ? 2 : 1;
  const message = hits === total
    ? "Perfeito! Você reconheceu todos os golpes."
    : hits >= total - 2
      ? "Muito bem! Releia a explicação das mensagens que errou."
      : "Vale a pena fazer de novo, com calma. Releia as regras de ouro.";

  sim.innerHTML = `
    ${header()}
    <div class="result">
      <div class="stars" aria-label="${starCount} de 3 estrelas">${"⭐".repeat(starCount)}${"☆".repeat(3 - starCount)}</div>
      <p class="score">${hits} de ${total}</p>
      <p class="question">${message}</p>
      <div class="btns">
        <button type="button" class="btn btn-light" id="again">↺ Fazer de novo</button>
        <a class="btn" href="#protecao">Ir para a Etapa 3 ➜</a>
      </div>
    </div>`;
  document.getElementById("again").addEventListener("click", () => {
    current = 0;
    results = [];
    render();
  });
}

render();

/* Tamanho da letra */
const sizes = [18, 21, 24, 27, 30];
let sizeIndex = 1;
try {
  const saved = Number(localStorage.getItem("escudo-font"));
  if (sizes.includes(saved)) sizeIndex = sizes.indexOf(saved);
} catch (e) {}

function applySize() {
  document.documentElement.style.setProperty("--base", sizes[sizeIndex] + "px");
  try { localStorage.setItem("escudo-font", sizes[sizeIndex]); } catch (e) {}
}
document.getElementById("font-up").addEventListener("click", () => {
  sizeIndex = Math.min(sizes.length - 1, sizeIndex + 1);
  applySize();
});
document.getElementById("font-down").addEventListener("click", () => {
  sizeIndex = Math.max(0, sizeIndex - 1);
  applySize();
});
applySize();

/* Checklist */
const boxes = document.querySelectorAll("#check input");
function updateMeter() {
  const done = [...boxes].filter(b => b.checked).length;
  document.getElementById("meter-fill").style.width = (done / boxes.length) * 100 + "%";
  document.getElementById("meter-text").textContent = `${done} de ${boxes.length} feitos`;
  document.getElementById("done").hidden = done !== boxes.length;
}
boxes.forEach(box => {
  try { box.checked = localStorage.getItem("escudo-" + box.id) === "1"; } catch (e) {}
  box.addEventListener("change", () => {
    try { localStorage.setItem("escudo-" + box.id, box.checked ? "1" : "0"); } catch (e) {}
    updateMeter();
  });
});
updateMeter();
