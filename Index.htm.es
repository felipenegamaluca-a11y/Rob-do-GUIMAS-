<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Robô Roleta - Contagem visível</title>
<style>
  body {
    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
    color: #f0f0f0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 480px;
    margin: auto;
    padding: 20px 15px;
  }
  .panel {
    background: #222;
    border-radius: 20px;
    padding: 30px 20px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.7);
  }
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
  }
  label {
    font-weight: 700;
    font-size: 1.1rem;
    display: block;
    margin-bottom: 10px;
  }
  input[type=number] {
    width: 100%;
    font-size: 1.2rem;
    padding: 12px 15px;
    margin-bottom: 20px;
    border-radius: 12px;
    border: none;
    outline: none;
    background: #333;
    color: #eee;
    box-shadow: inset 5px 5px 8px #1a1a1a,
                inset -5px -5px 8px #4d4d4d;
    transition: box-shadow 0.3s ease;
  }
  input[type=number]:focus {
    box-shadow: 0 0 8px #faca2b,
                inset 5px 5px 8px #1a1a1a,
                inset -5px -5px 8px #4d4d4d;
  }
  button {
    width: 100%;
    padding: 14px 0;
    font-weight: 700;
    font-size: 1.3rem;
    border: none;
    border-radius: 15px;
    background: linear-gradient(145deg, #faca2b, #c19a17);
    color: #222;
    box-shadow: 6px 6px 15px #a17e00,
                -6px -6px 15px #ffd000;
    cursor: pointer;
    transition: box-shadow 0.3s ease, transform 0.25s ease;
  }
  button:hover {
    box-shadow: inset 6px 6px 15px #a17e00,
                inset -6px -6px 15px #ffd000;
    transform: scale(1.05);
  }
  #resultados, #status {
    margin-top: 25px;
    font-weight: 700;
    font-size: 1.1rem;
    text-align: center;
  }
  #efetividade {
    margin-top: 15px;
    font-size: 1.2rem;
    font-weight: 700;
    text-align: center;
  }
  #toast {
    min-width: 220px;
    background: linear-gradient(135deg, #4caf50, #087f23);
    box-shadow: 0 0 15px #4caf50, 0 0 35px #087f23;
    border-radius: 40px;
    font-weight: 900;
    font-size: 1.5rem;
    padding: 18px 24px;
    position: fixed;
    left: 50%;
    bottom: 30px;
    transform: translateX(-50%) translateZ(60px);
    color: white;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.6s ease, visibility 0s linear 0.6s;
    text-shadow: 0 0 12px #a8f5a2;
    z-index: 1000;
  }
  #toast.show {
    visibility: visible;
    opacity: 1;
    animation: glowPulse 1.5s infinite alternate ease-in-out;
  }
  @keyframes glowPulse {
    from {
      box-shadow: 0 0 15px #4caf50, 0 0 35px #087f23;
      text-shadow: 0 0 12px #a8f5a2;
    }
    to {
      box-shadow: 0 0 30px #4caf50, 0 0 70px #087f23;
      text-shadow: 0 0 28px #a8f5a2;
    }
  }
</style>
</head>
<body>

<div class="panel">
  <h1>Robô de Sinal Roleta</h1>

  <label for="numero">Número que saiu na roleta:</label>
  <input type="number" id="numero" min="0" max="36" />
  <button onclick="adicionarNumero()">Adicionar Número</button>

  <div id="resultados">Números sorteados: </div>
  <div id="status">Status: aguardando número...</div>
  <div id="efetividade">Efetividade da estratégia: 0.00% (Wins: 0, Losses: 0)</div>
</div>

<div id="toast">Green ✅</div>

<script>
const alvo = [30, 31, 32, 33, 34, 35, 36];
const greenEspecifico = new Set([
  8,11,30,14,9,31,32,0,5,
  33,16,1,34,6,17,35,12,
  3,36,13,27,26
]);
const numerosLossEspecificos = new Set([23, 10, 5, 24, 22, 18, 29, 7, 2, 8, 19, 4, 21, 25]);

let resultados = [];
let contagemEntrada = null;
let entradaConfirmada = false;

let totalEntradasConfirmadas = 0;
let totalGreensPosConfirmacao = 0;
let totalLosses = 0;
let rodadaConfirmaEntrada = null;
let perdaContabilizada = false;

let contagemForaAlvo = 0;
let contagemLossNumerosEspecificos = 0;

function showToast(text = 'Green ✅'){
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function atualizarEfetividade() {
  let porcentagem = 0;
  const totalDecisoes = totalGreensPosConfirmacao + totalLosses;
  if (totalDecisoes > 0){
    porcentagem = (totalGreensPosConfirmacao / totalDecisoes) * 100;
  }
  document.getElementById('efetividade').textContent = `Efetividade da estratégia: ${porcentagem.toFixed(2)}% (Wins: ${totalGreensPosConfirmacao}, Losses: ${totalLosses})`;
}

function adicionarNumero(){
  const input = document.getElementById('numero');
  const num = parseInt(input.value);

  if (isNaN(num) || num < 0 || num > 36) {
    alert('Digite um número válido entre 0 e 36.');
    input.value = '';
    input.focus();
    return;
  }

  resultados.push(num);
  input.value = '';
  input.focus();

  document.getElementById('resultados').textContent = 'Números sorteados: ' + resultados.join(', ');

  if (alvo.includes(num) && contagemEntrada === null){
    contagemEntrada = resultados.length;
    entradaConfirmada = false;
    perdaContabilizada = false;
    rodadaConfirmaEntrada = null;
    contagemForaAlvo = 0;
    contagemLossNumerosEspecificos = 0;
    document.getElementById('status').textContent = `Número alvo ${num} saiu. Começando contagem: 3 rodadas restantes.`;
    return;
  }

  if (contagemEntrada !== null) {
    let rodadasPassadas = resultados.length - contagemEntrada;
    let rodadasRestantes = 3 - rodadasPassadas;

    if (rodadasRestantes > 0) {
      document.getElementById('status').textContent = `Contagem em andamento: ${rodadasRestantes} rodada(s) restante(s).`;
    }

    if (rodadasPassadas > 0 && rodadasPassadas <= 3 && greenEspecifico.has(num)){
      showToast('Green antecipado ⏩');
      document.getElementById('status').textContent = `🟠 Green antecipado! Número ${num} saiu durante contagem.`;
      contagemEntrada = null;
      entradaConfirmada = false;
      perdaContabilizada = false;
      rodadaConfirmaEntrada = null;
      contagemForaAlvo = 0;
      contagemLossNumerosEspecificos = 0;
      return;
    }

    if (rodadasPassadas === 3) {
      entradaConfirmada = true;
      contagemEntrada = null;
      rodadaConfirmaEntrada = resultados.length;
      perdaContabilizada = false;
      totalEntradasConfirmadas++;
      document.getElementById('status').textContent = '✔️ Entrada confirmada – entrar na casa dos 30/36';

      if (greenEspecifico.has(num)){
        showToast('Green ✅');
        totalGreensPosConfirmacao++;
      }
      atualizarEfetividade();
      return;
    }
  }

  if (entradaConfirmada){
    let rodadasDesdeConfirmacao = resultados.length - rodadaConfirmaEntrada;

    if (greenEspecifico.has(num)){
      showToast('Green ✅');
      document.getElementById('status').textContent = `🟢 Green! Número verde ${num} saiu após confirmação.`;
      totalGreensPosConfirmacao++;
      perdaContabilizada = false;
      contagemForaAlvo = 0;
      contagemLossNumerosEspecificos = 0;
      atualizarEfetividade();
    } else {
      if (!alvo.includes(num)){
        contagemForaAlvo++;
      }
      if (numerosLossEspecificos.has(num)){
        contagemLossNumerosEspecificos++;
      }

      if (contagemForaAlvo >= 4 && !perdaContabilizada){
        totalLosses++;
        perdaContabilizada = true;
        entradaConfirmada = false;
        rodadaConfirmaEntrada = null;
        contagemForaAlvo = 0;
        contagemLossNumerosEspecificos = 0;
        document.getElementById('status').textContent = '⛔ Loss contabilizado: 4 números fora do alvo após entrada.';
        atualizarEfetividade();
        return;
      }

      if (contagemLossNumerosEspecificos >= 4 && !perdaContabilizada){
        totalLosses++;
        perdaContabilizada = true;
        entradaConfirmada = false;
        rodadaConfirmaEntrada = null;
        contagemForaAlvo = 0;
        contagemLossNumerosEspecificos = 0;
        document.getElementById('status').textContent = '⛔ Loss contabilizado: 4 números da lista específica após entrada.';
        atualizarEfetividade();
        return;
      }

      if (rodadasDesdeConfirmacao >= 4 && !perdaContabilizada){
        totalLosses++;
        perdaContabilizada = true;
        entradaConfirmada = false;
        rodadaConfirmaEntrada = null;
        contagemForaAlvo = 0;
        contagemLossNumerosEspecificos = 0;
        document.getElementById('status').textContent = '⛔ Loss contabilizado após 4 rodadas sem green.';
        atualizarEfetividade();
        return;
      }
    }
  }

  if (!entradaConfirmada && contagemEntrada === null){
    document.getElementById('status').textContent = 'Status: aguardando número...';
  }
}
</script>

</body>
</html>
