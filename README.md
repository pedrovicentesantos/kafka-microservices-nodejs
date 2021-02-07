# Aplicação

Aplicação feita em Node.js que simula o funcionamento de microsserviços em um e-commerce.

Utiliza o [Apache Kafka](https://kafka.apache.org) como sistema de mensagem entre cada microsserviço.

Os dados da aplicação ficam salvos em um Banco de Dados SQLite e utiliza o [Knex](http://knexjs.org) para facilitar a manipulação dos dados nas tabelas.

## Rodando a aplicação

Para rodar a aplicação é necessário ter instalado o Docker e Docker Compose.

O primeiro passo é fazer o clone da aplicação e acessar a pasta da mesma:

```shell
git clone https://github.com/pedrovicentesantos/kafka-microservices-nodejs

cd kafka-microservices-nodejs
```

Feito isto, é necessário iniciar o Kafka antes de começar a rodar cada um dos microsserviços. Para isso, basta rodar `docker-compose up -d`. Isso irá gerar 2 containers, um com o `zookeeper-server` e o outro com o `kafka-server`. 

Como Kafka funcionando, deve-se rodar a aplicação na seguinte ordem:

```shell
cd kafka
npm start

cd ../recebepedido
npm start

cd ../pagamento
npm start

cd ../faturamento
npm start
```

A partir desse momento, a aplicação estará funcionando e basta fazer uma chamada a API para simular a comprar de um produto.

A API encontra-se funcionando na porta `3000` e a rota a ser acessada é `/recebepedido`.

O corpo da chamada deve incluir `description`, `value`, `quantity`. Por exemplo, um JSON no seguinte formato:

```Javascript
{
  "description": "Smartphone XPTO",
  "value": 1599.99,
  "quantity": 1
}
```

## Tópicos

São criados 3 tópicos para lidar com a lógica da aplicação. São eles:
- ORDEM_RECEBIDA:
  - Tópico utilizado após o pedido ser recebido
- ORDEM_PAGA:
  - Tópico utilizado para indicar que o pagamento foi feito com sucesso
- ORDEM_FATURADA:
  - Tópico utilizado para indicar que o pedido foi faturado

Cada tópico pode consumir e processar novos eventos de acordo com a necessidade.

Para ler os eventos de cada um dos tópicos é necessário entrar no container com o server do kafka, ir até a pasta onde está o kafka e executar o comando de leitura:

```shell
cd /opt/bitnami/kafka

bin/kafka-console-consumer.sh --topic NOME_TOPICO --from-beginning --bootstrap-server localhost:9092
```
