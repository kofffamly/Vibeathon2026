// backend/index.js
// Serveur Express AGRILINK CI — Version complète Vibeathon 2026
// Routes : status, listings, nearby, profile, orders, messages, upload, AI Gemini
// Sécurité : JWT Supabase, CORS strict, rate-limiting
// Auteur : Équipe Vibeathon 2026 (M1→M5)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '10mb' }));

// ============================================================
// CORS
// ============================================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,http://localhost:8083,exp://localhost:8081,exp://localhost:8083').split(',').map(o => o.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origine non autorisée par CORS'));
  },
}));

// ============================================================
// RATE LIMITING simple (sans dépendances externes)
// ============================================================
const rateLimitMap = new Map();
function rateLimit(maxReq = 30, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const bucket = rateLimitMap.get(ip) || { count: 0, start: now };
    if (now - bucket.start > windowMs) { bucket.count = 0; bucket.start = now; }
    bucket.count++;
    rateLimitMap.set(ip, bucket);
    if (bucket.count > maxReq) return res.status(429).json({ error: 'Trop de requêtes, réessayez dans 1 minute.' });
    next();
  };
}
app.use(rateLimit(60));

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabaseUrl  = process.env.SUPABASE_URL || 'https://wwmvzmgsbcnwztdussid.supabase.co';
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9eCW0RHoFOtjR4uvxvn2SQ_c1gHDflI';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ============================================================
// MIDDLEWARE AUTH
// ============================================================
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Token invalide' });
  req.user = data.user;
  next();
}

// ============================================================
// ROUTES SYSTÈME
// ============================================================

// GET /status — Santé du serveur
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 Serveur AGRILINK CI en ligne ✅',
    version: '2.0.0',
    projet: 'Marketplace Agricole — Vibeathon 2026',
    equipe: ['Mira (M1)', 'Herman (M2)', 'Joseph (M3)', 'Fangapele (M4)', 'Koffi (M5)'],
    routes: ['/status', '/api/listings', '/api/listings/nearby', '/api/orders', '/api/messages', '/api/profile', '/api/notifications', '/api/ai/analyze', '/api/stats'],
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// ROUTES LISTINGS
// ============================================================

// GET /api/listings — Liste des annonces actives
app.get('/api/listings', async (req, res) => {
  try {
    const { category, listing_type, limit = 20, offset = 0 } = req.query;
    let query = supabase
      .from('listings')
      .select('id, title, description, price, quantity, unit, category, listing_type, image_url, status, created_at, owner_id, profiles(full_name, avatar_url, phone)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    if (category) query = query.eq('category', category);
    if (listing_type) query = query.eq('listing_type', listing_type);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/listings/:id — Détail d'une annonce
app.get('/api/listings/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(full_name, avatar_url, phone, role, activity_description)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Annonce introuvable' });
    res.json(data);
  } catch (err) {
    console.error('GET /api/listings/:id:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/listings — Créer une annonce
app.post('/api/listings', requireAuth, async (req, res) => {
  try {
    const { title, description, price, quantity, unit, category, listing_type, image_url, lat, lng } = req.body;
    if (!title || !category || lat === undefined || lng === undefined)
      return res.status(400).json({ error: 'title, category, lat, lng sont obligatoires' });
    const { data, error } = await supabase
      .from('listings')
      .insert({ owner_id: req.user.id, title, description, price, quantity, unit, category, listing_type: listing_type || 'vente', image_url, location: `POINT(${lng} ${lat})`, status: 'active' })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/listings/nearby — Annonces à proximité (PostGIS)
app.get('/api/listings/nearby', async (req, res) => {
  try {
    const { lat, lng, radius_km = 50, category } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat et lng requis' });
    const { data, error } = await supabase.rpc('nearby_listings', {
      user_lat: parseFloat(lat), user_lng: parseFloat(lng),
      radius_km: parseFloat(radius_km), filter_category: category || null,
    });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/listings/nearby:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES COMMANDES
// ============================================================

// POST /api/orders — Créer une commande
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, payment_method = 'sur_place', delivery_note } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items[] est obligatoire' });
    const total = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
    const { data, error } = await supabase.rpc('create_order', {
      p_items: JSON.stringify(items),
      p_total: total,
      p_payment_method: payment_method,
      p_delivery_note: delivery_note || null,
    });
    if (error) throw error;
    res.status(201).json({ order_id: data, total, status: 'en_attente' });
  } catch (err) {
    console.error('POST /api/orders:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// GET /api/orders — Mes commandes (acheteur + vendeur)
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, listings(title, image_url, category))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/orders:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/orders/:id — Détail d'une commande
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, listings(title, image_url, price, category), profiles(full_name, phone))')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(data);
  } catch (err) {
    console.error('GET /api/orders/:id:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/orders/:id/status — Mettre à jour le statut
app.patch('/api/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['en_attente', 'en_cours', 'confirmee', 'livree', 'annulee'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Statut invalide. Valeurs : ${validStatuses.join(', ')}` });
    const { data, error } = await supabase
      .from('orders').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('PATCH /api/orders/:id/status:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES MESSAGES
// ============================================================

// GET /api/messages/:listing_id — Conversation sur une annonce
app.get('/api/messages/:listing_id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)')
      .eq('listing_id', req.params.listing_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    // Marquer comme lus les messages reçus
    await supabase.from('messages')
      .update({ read: true })
      .eq('listing_id', req.params.listing_id)
      .eq('receiver_id', req.user.id)
      .eq('read', false);
    res.json(data);
  } catch (err) {
    console.error('GET /api/messages/:listing_id:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages — Envoyer un message
app.post('/api/messages', requireAuth, async (req, res) => {
  try {
    const { listing_id, receiver_id, content } = req.body;
    if (!listing_id || !receiver_id || !content)
      return res.status(400).json({ error: 'listing_id, receiver_id, content sont obligatoires' });
    const { data, error } = await supabase
      .from('messages')
      .insert({ listing_id, sender_id: req.user.id, receiver_id, content })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/messages:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES PROFIL
// ============================================================

// GET /api/profile — Mon profil
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/profile:', err.message);
    res.status(500).json({ error: 'Profil introuvable' });
  }
});

// PATCH /api/profile — Modifier mon profil
app.patch('/api/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone, activity_description, avatar_url } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, phone, activity_description, avatar_url })
      .eq('id', req.user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('PATCH /api/profile:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES NOTIFICATIONS
// ============================================================

// GET /api/notifications — Mes notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/notifications:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/notifications/read-all — Tout marquer comme lu
app.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications').update({ read: true }).eq('user_id', req.user.id).eq('read', false);
    if (error) throw error;
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    console.error('PATCH /api/notifications/read-all:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES AVIS
// ============================================================

// POST /api/reviews — Laisser un avis
app.post('/api/reviews', requireAuth, async (req, res) => {
  try {
    const { seller_id, listing_id, order_id, rating, comment } = req.body;
    if (!seller_id || !rating)
      return res.status(400).json({ error: 'seller_id et rating sont obligatoires' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: 'rating doit être entre 1 et 5' });
    const { data, error } = await supabase
      .from('reviews')
      .insert({ reviewer_id: req.user.id, seller_id, listing_id, order_id, rating, comment })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('POST /api/reviews:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/reviews/:seller_id — Avis d'un vendeur
app.get('/api/reviews/:seller_id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(full_name, avatar_url)')
      .eq('seller_id', req.params.seller_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /api/reviews/:seller_id:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTE IA GEMINI — Analyse de photo
// ============================================================
app.post('/api/ai/analyze', requireAuth, rateLimit(10, 60000), async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 est obligatoire' });
    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'Service IA non configuré (clé GEMINI manquante)' });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Tu es un expert en produits agricoles ivoiriens.
Analyse cette image et retourne UNIQUEMENT un objet JSON valide, sans texte autour, sans balises markdown.
Format EXACT :
{
  "title": "nom commercial court en français",
  "category": "recolte" ou "animal" ou "intrant" ou "residu",
  "description": "description commerciale courte et attractive (max 100 mots)",
  "estimated_quantity_kg": nombre estimé en kg ou null,
  "quality": "excellent" ou "bon" ou "moyen" ou "mauvais",
  "suggested_price_fcfa": prix suggéré au kg en FCFA ou null,
  "confidence": "haute" ou "moyenne" ou "faible"
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } }
    ]);
    const rawText = result.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Réponse IA non parsable');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ ...parsed, ai_generated: true });
  } catch (err) {
    console.error('POST /api/ai/analyze:', err.message);
    res.status(500).json({ error: 'Analyse IA indisponible, veuillez remplir manuellement', details: err.message });
  }
});

// ============================================================
// ROUTE STATS
// ============================================================

// GET /api/stats — Statistiques globales de la plateforme
app.get('/api/stats', async (req, res) => {
  try {
    const [listingsRes, profilesRes, ordersRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);
    res.json({
      active_listings: listingsRes.count || 0,
      total_users:     profilesRes.count || 0,
      total_orders:    ordersRes.count || 0,
      platform:        'AGRILINK CI — Marketplace Agricole Côte d\'Ivoire',
      generated_at:    new Date().toISOString()
    });
  } catch (err) {
    console.error('GET /api/stats:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// DÉMARRAGE
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur AGRILINK CI v2.0 démarré sur le port ${PORT}`);
  console.log(`📡 Statut : http://localhost:${PORT}/status`);
  console.log(`📊 Stats  : http://localhost:${PORT}/api/stats`);
  console.log(`🌍 Vibeathon 2026 — Marketplace Agricole Côte d'Ivoire\n`);
});
