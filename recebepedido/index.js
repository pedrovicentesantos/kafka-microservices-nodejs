const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const connection = require('../database/connection');

const kafka = new Kafka({
  clientId: 'kafka_app',
  brokers: ['localhost:9092'],
});

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.post('/recebepedido', async (req, res) => {
  try {
    const { description, value, quantity } = req.body;

    const id = uuidv4();
    const status = 'PENDENTE_PAGAMENTO';

    const resp = await connection('pedidos').insert({
      id,
      description,
      value,
      quantity,
      status,
    });

    if (resp >= 0) {
      const order = {
        id,
        description,
        value,
        quantity,
        status,
      };

      const producer = kafka.producer();
      await producer.connect();
      await producer.send({
        topic: 'ORDEM_RECEBIDA',
        messages: [
          { value: JSON.stringify(order) },
        ],
      });
      await producer.disconnect();

      return res.status(200).json({
        order,
        message: 'Pedido realizado com sucesso. Estamos analisando seu pagamento',
      });
    }

    return res.status(400).json({ error: 'Erro ao receber pagamento' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Erro ao receber pagamento' });
  }
});

app.listen(port, () => {
  console.log(`Express API running on localhost:${port}`);
});
