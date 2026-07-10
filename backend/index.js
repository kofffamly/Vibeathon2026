// backend/index.js
// Serveur Express pour AGRILINK CI - Marketplace Agricole
// Auteur : Oladokou Joseph (M3) - Vibeathon 2026
// Backend sécurisé : JWT Supabase, CORS restreint, routes API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '5mb' }));

// --- CORS (origines autorisées) ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,exp://localhost:8081').split(',').map(o => o.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
}));

// --- Client Supabase (service_role côté serveur uniquement) ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://wwmvzmgsbcnwztdussid.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- Middleware : vérification JWT Supabase ---
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Token invalide' });

  req.user = data.user;
  next();
}

// ============================================================
// ROUTES
// ============================================================

// --- Route de statut : GET /status ---
// Permet de vérifier que le serveur est bien en ligne
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Serveur AGRILINK en ligne ✅',
    projet: 'Marketplace Agricole - Vibeathon 2026',
    equipe: ['Mira (M1)', 'Herman (M2)', 'Joseph (M3)', 'Fangapele (M4)', 'Koffi (M5)'],
    timestamp: new Date().toISOString()
  });
});

// --- Route : Récupérer toutes les annonces actives ---
app.get('/api/listings', requireAuth, async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;

    let query = supabase
      .from('listings')
      .select(`
        id, title, description, price, quantity, unit,
        category, listing_type, image_url, status,
        created_at,
        profiles(full_name, avatar_url, phone)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erreur /api/listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Route : Créer une annonce ---
app.post('/api/listings', requireAuth, async (req, res) => {
  try {
    const { title, description, price, quantity, unit, category, listing_type, image_url, lat, lng } = req.body;

    if (!title || !category || !lat || !lng) {
      return res.status(400).json({ error: 'Champs obligatoires manquants : title, category, lat, lng' });
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        owner_id: req.user.id,
        title,
        description,
        price,
        quantity,
        unit,
        category,
        listing_type: listing_type || 'vente',
        image_url,
        location: `POINT(${lng} ${lat})`,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Erreur POST /api/listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Route : Annonces à proximité ---
app.get('/api/listings/nearby', requireAuth, async (req, res) => {
  try {
    const { lat, lng, radius_km = 50, category } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat et lng requis' });

    const { data, error } = await supabase.rpc('nearby_listings', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_km: parseFloat(radius_km),
      filter_category: category || null,
    });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erreur nearby_listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Route : Profil utilisateur connecté ---
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erreur /api/profile:', err.message);
    res.status(500).json({ error: 'Profil introuvable' });
  }
});

// ============================================================
// DÉMARRAGE
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur AGRILINK CI démarré sur le port ${PORT}`);
  console.log(`📡 Endpoint de statut : http://localhost:${PORT}/status`);
  console.log(`🌍 Vibeathon 2026 - Marketplace Agricole\n`);
});
