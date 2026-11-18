# Senfy

Site institucional da **Senfy**, um sistema de fidelidade que utiliza dados dos clientes para aumentar recorrência, ticket médio e entendimento do público — enquanto oferece recompensas para os clientes.

## Sobre a Senfy

- **Público:** lojas e profissionais que desejam fidelizar clientes com premiações.
- **Problema:** em cenários de maior concorrência e pressão financeira, reter clientes é essencial.
- **Solução:** SaaS para gestão de fidelidade com pontos, vouchers ou selos (stamps), regras flexíveis e visão de comportamento.
- **Diferencial:** insights a partir dos dados para apoiar campanhas e decisões do negócio.

## MVP (visão)

**Lado do cliente**
- Registro via QR Code ou NFC na primeira compra (nome, telefone e valor da compra).
- Conversão automática do valor em pontos conforme regras do lojista.
- Aviso de pontos ganhos, saldo total e quanto falta para o próximo prêmio.

**Lado do lojista**
- Validação/ajuste de valores registrados.
- Criação de prêmios, regras, validades e métodos de resgate.
- Visão de clientes com pontos e total de resgates.
- Estratégias por pontos, voucher ou stamps.

**Lado do sistema**
- Aplicação das regras de acúmulo e resgate.
- Análise de frequência média de compras por cliente.
- Mapa de calor de períodos quentes/frios para apoiar campanhas.
- Entendimento do comportamento para ações de retenção.

## Estrutura do projeto

- `index.html` — página principal (landing page)
- `styles.css` — estilos e layout responsivo
- `script.js` — interações simples (menu mobile e ano no rodapé)

## Como visualizar localmente

Abra o arquivo `index.html` no navegador, ou sirva a pasta com um servidor estático. Exemplo:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Próximos passos sugeridos

- Definir e-mail/canal oficial de contato no CTA.
- Adicionar domínio, SEO complementar e analytics.
- Incluir página de política de privacidade/termos quando houver captação de dados.
- Evoluir para aplicação com backend conforme o MVP do produto.
