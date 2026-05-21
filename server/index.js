require('dotenv').config();

const http = require('http');
const { randomUUID } = require('crypto');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.NOTIFICATION_PORT || process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Add it to .env before starting the server.');
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    menuItemId: { type: String, required: true },
    menuItemName: { type: String, required: true },
    variantId: { type: String, required: true },
    variantName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'preparing', 'ready'], required: true },
    assignedChef: { type: String, enum: ['chef_a', 'chef_b', 'chef_c'], required: true },
    createdAt: { type: Number, required: true },
    readyAt: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    businessDate: { type: String, required: true, index: true },
    tableNumber: { type: Number, required: true },
    items: { type: [orderItemSchema], required: true },
    status: { type: String, enum: ['pending', 'partially_ready', 'ready', 'served'], required: true },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    completedAt: Number,
  }
);

const OrderModel = mongoose.model('Order', orderSchema);

function serializeOrder(document) {
  const order = document.toObject({ versionKey: false });
  delete order._id;
  delete order.businessDate;
  return order;
}

async function getDailyOrders() {
  const orders = await OrderModel.find({ businessDate: todayKey() }).sort({ createdAt: 1 });
  return orders.map(serializeOrder);
}

async function saveOrder(order) {
  const savedOrder = await OrderModel.findOneAndUpdate(
    { id: order.id },
    { ...order, businessDate: todayKey() },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return serializeOrder(savedOrder);
}

async function deleteOrder(orderId) {
  await OrderModel.deleteOne({ id: orderId });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, clients: clients.size, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/orders', async (_req, res) => {
  try {
    res.json({ date: todayKey(), orders: await getDailyOrders() });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to fetch orders' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const order = await saveOrder(req.body);
    broadcast({ type: 'order_created', order });
    res.status(201).json({ ok: true, order });
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid order payload' });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    await deleteOrder(req.params.id);
    broadcast({ type: 'order_deleted', orderId: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to delete order' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map();

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(message) {
  const payload = {
    id: randomUUID(),
    createdAt: Date.now(),
    ...message,
  };

  for (const ws of clients.keys()) {
    send(ws, payload);
  }
}

wss.on('connection', (ws) => {
  clients.set(ws, { role: null, connectedAt: Date.now() });

  send(ws, {
    type: 'connected',
    id: randomUUID(),
    createdAt: Date.now(),
    title: 'Connected',
    message: 'Realtime notifications are active',
  });

  ws.on('message', async (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === 'register') {
        clients.set(ws, { role: message.role || null, connectedAt: Date.now() });
        return;
      }

      if (message.type === 'notification') {
        broadcast(message);
        return;
      }

      if (message.type === 'order_created') {
        const order = await saveOrder(message.order);
        broadcast({ type: 'order_created', order });
        return;
      }

      if (message.type === 'order_deleted') {
        await deleteOrder(message.orderId);
        broadcast({ type: 'order_deleted', orderId: message.orderId });
      }
    } catch (error) {
      send(ws, {
        type: 'error',
        id: randomUUID(),
        createdAt: Date.now(),
        title: 'Notification error',
        message: 'Invalid websocket message',
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API and websocket server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB');
    console.error(error);
    process.exit(1);
  });
