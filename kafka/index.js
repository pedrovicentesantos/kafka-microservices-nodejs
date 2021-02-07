const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kafka_app',
  brokers: ['localhost:9092'],
});

const run = async () => {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      {
        topic: 'ORDEM_RECEBIDA',
      },
      {
        topic: 'ORDEM_PAGA',
      },
      {
        topic: 'ORDEM_FATURADA',
      },
    ],
  });
  await admin.disconnect();
};

run().catch(console.error);
