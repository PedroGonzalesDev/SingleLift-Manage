# 🏋️ PowerManager - Single Lift Edition

Sistema web simples e eficiente para gestão de campeonatos de Powerlifting (Supino e Levantamento Terra), focado em competições *Single Lift*. Desenvolvido para rodar localmente no navegador, sem necessidade de instalação de servidores ou banco de dados.

## 🚀 Funcionalidades

* **Gestão de Secretaria (Cadastro):**
    * Cadastro completo de atletas (Nome, Peso, Idade, Categoria).
    * Seleção flexível de provas: O atleta pode competir apenas no Supino, apenas no Terra ou em ambos (Push-Pull).
    * Definição imediata da **1ª Pedida (Opener)** para organização inicial do *Bar Loading*.
* **Mesa de Controle (Competição):**
    * Abas separadas por Gênero (M/F) e por Movimento (Supino/Terra).
    * **Bar Loading Automático:** Os atletas são ordenados automaticamente pelo peso da pedida (menor peso levanta primeiro).
    * **Sistema de Julgamento:** Botões de "Válido" (Verde) e "Inválido" (Vermelho).
    * **Bloqueio Lógico:** A 2ª e 3ª pedidas só são liberadas após o julgamento da anterior.
    * **Regra de Incremento:** Se o próximo peso não for informado em 1 minuto após o julgamento, o sistema sugere automaticamente +2.5kg.
* **Rankings e Resultados:**
    * Separação automática por **Divisão de Idade**: OPEN (até 39 anos) e MASTERS (40+ anos).
    * Rankings individuais por movimento (Single Lift).
    * Critério de desempate IPF: Maior peso levantado vence; em caso de empate, vence o atleta com menor peso corporal.

## 📂 Estrutura de Arquivos

Para o sistema funcionar, certifique-se de que os três arquivos abaixo estejam na **mesma pasta**:

1.  `front.html`: A estrutura visual e o layout da aplicação.
2.  `styles.css`: O design moderno, cores e responsividade.
3.  `software.js`: Toda a lógica de regras, cálculos e funcionamento do sistema.

## 🛠️ Como Usar

1.  Baixe os 3 arquivos (`front.html`, `styles.css`, `software.js`) e coloque-os em uma pasta.
2.  Dê um **duplo clique** no arquivo `front.html`.
3.  O sistema abrirá no seu navegador padrão (Chrome, Edge, Firefox, etc.).
4.  Vá para a aba **"Secretaria / Cadastro"** para inserir os atletas.
5.  Navegue pelas abas de competição para gerenciar as pedidas.

## 💻 Tecnologias Utilizadas

* **HTML5:** Estrutura semântica.
* **CSS3:** Estilização moderna (Flexbox/Grid), variáveis de cor e animações suaves.
* **JavaScript (Vanilla):** Lógica pura, sem dependência de bibliotecas externas (como React ou Vue), garantindo leveza e facilidade de execução.

## ⚠️ Observação Importante

Como este é um software **Client-Side** (roda apenas no navegador), os dados ficam salvos na memória temporária da página. **Se você recarregar a página (F5), os dados serão perdidos.**

> *Dica: Para competições reais, recomenda-se manter o navegador aberto e evitar recarregamentos acidentais, ou solicitar uma versão futura com persistência em `LocalStorage`.*

---
Desenvolvido para auxiliar organizadores de competições amadoras e treinos controlados.