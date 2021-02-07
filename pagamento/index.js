const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const connection = require('../database/connection');

const kafka = new Kafka({
  clientId: 'kafka_app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'pagamento' });
const producer = kafka.producer();

const processarPagamento = async (pedido) => {
  const paymentId = uuidv4();
  const resp = await connection('pedidos')
    .where('id', pedido.id)
    .update({
      status: 'PAGO',
      payment_id: paymentId,
    });
  if (resp > 0) {
    await producer.connect();
    const pedidoPago = await connection('pedidos')
      .select('*')
      .where('id', pedido.id)
      .first();
    await producer.send({
      topic: 'ORDEM_PAGA',
      messages: [
        { value: JSON.stringify(pedidoPago) },
      ],
    });
    await producer.disconnect();
  }
};

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'ORDEM_RECEBIDA',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({
      message,
    }) => {
      const pedido = JSON.parse(message.value.toString());
      await processarPagamento(pedido);
    },
  });
};

run().catch(console.error);
