const { Kafka } = require('kafkajs');

const connection = require('../database/connection');

const kafka = new Kafka({
  clientId: 'kafka_app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'invoice' });
const producer = kafka.producer();

const faturarPedido = async (pedido) => {
  const nfe = `nfe_${pedido.id}_2021.xml`;

  const resp = await connection('pedidos')
    .where('id', pedido.id)
    .update({
      status: 'FATURADO',
      nfe,
    });

  if (resp > 0) {
    await producer.connect();

    const pedidoFaturado = await connection('pedidos')
      .select('*')
      .where('id', pedido.id)
      .first();

    await producer.send({
      topic: 'ORDEM_FATURADA',
      messages: [
        { value: JSON.stringify(pedidoFaturado) },
      ],
    });

    await producer.disconnect();
  }
};

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'ORDEM_PAGA',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({
      message,
    }) => {
      const pedido = JSON.parse(message.value.toString());
      await faturarPedido(pedido);
    },
  });
};

run().catch(console.error);
