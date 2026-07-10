const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const uploadFolder = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const upload = multer({ dest: uploadFolder });
const JWT_SECRET = process.env.JWT_SECRET || 'vibecoding-secret';

const users = [
  {
    id: 'u1',
    nom: 'Amadou Koné',
    tel: '0700000000',
    localisation: 'Bouaké',
    activites: ['Agriculteur'],
    role: ['Agriculteur'],
    passwordHash: bcrypt.hashSync('secret123', 8),
  },
];

const products = [
  {
    id: 'p1',
    titre: 'Maïs local — récolte 2024',
    description: 'Maïs sec, qualité fermier, disponible en sacs de 50kg.',
    prixUnit: 1200,
    localisation: 'Korhogo',
    category: 'Récoltes',
    sellerId: 'u1',
    emoji: '🌽',
    lat: 9.41,
    lng: -5.56,
    imageUrl: '',
  },
  {
    id: 'p2',
    titre: 'Bœufs zébus — race locale',
    description: 'Bœufs sains, prêts à être expédiés sur commande.',
    prixUnit: 180000,
    localisation: 'Bouaké',
    category: 'Animaux',
    sellerId: 'u1',
    emoji: '🐄',
    lat: 7.70,
    lng: -5.02,
    imageUrl: '',
  },
  {
    id: 'p3',
    titre: 'Engrais NPK certifié',
    description: 'Sac de 50kg, fort rendement pour cultures maraîchères.',
    prixUnit: 25000,
    localisation: 'Abidjan',
    category: 'Intrants',
    sellerId: 'u1',
    emoji: '🌱',
    lat: 5.35,
    lng: -4.00,
    imageUrl: '',
  },
];

const orders = [];

function signToken(user) {
  return jwt.sign({ id: user.id, tel: user.tel }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const currentUser = users.find((u) => u.id === payload.id && u.tel === payload.tel);
    if (!currentUser) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

function createProductId() {
  return `p${products.length + 1}`;
}

function createOrderId() {
  return `o${orders.length + 1}`;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post('/auth/register', (req, res) => {
  const { nom, tel, localisation, activites, mdp } = req.body;
  if (!nom || !tel || !localisation || !activites?.length || !mdp) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (users.find((u) => u.tel === tel)) {
    return res.status(400).json({ error: 'Ce numéro est déjà utilisé' });
  }
  const newUser = {
    id: `u${users.length + 1}`,
    nom,
    tel,
    localisation,
    activites,
    role: activites,
    passwordHash: bcrypt.hashSync(mdp, 8),
  };
  users.push(newUser);
  const token = signToken(newUser);
  res.json({ token, user: { id: newUser.id, nom, tel, localisation, activites, role: newUser.role } });
});

app.post('/auth/login', (req, res) => {
  const { tel, mdp } = req.body;
  if (!tel || !mdp) {
    return res.status(400).json({ error: 'Téléphone et mot de passe requis' });
  }
  const user = users.find((u) => u.tel === tel);
  if (!user || !bcrypt.compareSync(mdp, user.passwordHash)) {
    return res.status(401).json({ error: 'Téléphone ou mot de passe incorrect' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, nom: user.nom, tel: user.tel, localisation: user.localisation, activites: user.activites, role: user.role } });
});

app.get('/auth/me', authenticate, (req, res) => {
  const user = req.user;
  res.json({ user: { id: user.id, nom: user.nom, tel: user.tel, localisation: user.localisation, activites: user.activites, role: user.role } });
});

app.get('/products', (req, res) => {
  const { q, category, location, lat, lng, radius } = req.query;
  let result = products.slice();

  if (q) {
    const query = q.toLowerCase();
    result = result.filter((item) =>
      item.titre.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.localisation.toLowerCase().includes(query)
    );
  }

  if (category) {
    const categoryValue = String(category).toLowerCase();
    result = result.filter((item) => item.category.toLowerCase().includes(categoryValue));
  }

  if (location) {
    const locationValue = String(location).toLowerCase();
    result = result.filter((item) => item.localisation.toLowerCase().includes(locationValue));
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const maxDistance = Number(radius || 9999);
  if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    result = result.filter((item) => {
      if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return false;
      return getDistance(latitude, longitude, item.lat, item.lng) <= maxDistance;
    });
  }

  res.json(result);
});

app.get('/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }
  res.json(product);
});

app.post('/products', authenticate, (req, res) => {
  const { titre, description, prixUnit, localisation, category, emoji, imageUrl, lat, lng } = req.body;
  if (!titre || !description || !prixUnit || !localisation || !category) {
    return res.status(400).json({ error: 'Champs manquants dans la fiche produit' });
  }
  const newProduct = {
    id: createProductId(),
    titre,
    description,
    prixUnit: Number(prixUnit),
    localisation,
    category,
    sellerId: req.user.id,
    emoji: emoji || '🌾',
    imageUrl: imageUrl || '',
    lat: Number(lat) || req.user.lat || 6.0,
    lng: Number(lng) || req.user.lng || -5.0,
  };
  products.unshift(newProduct);
  return res.status(201).json(newProduct);
});

app.put('/products/:id', authenticate, (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Droits insuffisants' });
  const changes = req.body;
  Object.assign(product, changes);
  res.json(product);
});

app.delete('/products/:id', authenticate, (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Produit introuvable' });
  const product = products[index];
  if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Droits insuffisants' });
  products.splice(index, 1);
  res.json({ success: true });
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucune image fournie' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.post('/orders', authenticate, (req, res) => {
  const { items, total, delivery, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Commande invalide' });
  }
  const order = {
    id: createOrderId(),
    buyerId: req.user.id,
    items,
    total: Number(total),
    delivery: delivery || 'À négocier',
    paymentMethod: paymentMethod || 'Paiement sur place',
    status: 'En attente',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  res.status(201).json(order);
});

app.get('/orders', authenticate, (req, res) => {
  const userOrders = orders.filter((order) => order.buyerId === req.user.id);
  res.json(userOrders);
});

app.get('/orders/:id', authenticate, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id && o.buyerId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  res.json(order);
});

app.post('/orders/:id/pay', authenticate, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id && o.buyerId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  order.status = 'Payée';
  res.json(order);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Backend Vibeathon fonctionne',
    routes: [
      '/auth/register',
      '/auth/login',
      '/auth/me',
      '/products',
      '/orders'
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Vibeathon écoute sur http://0.0.0.0:${port}`);
  console.log(`Accessible depuis le réseau local sur http://192.168.1.7:${port}`);
});
