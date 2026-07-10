// server/index.js
// Serveur Express minimal et sécurisé pour AGRILINK CI.
// Points clés sécurité :
//  - CORS restreint à une liste blanche (pas de wildcard "*")
//  - service_role key gardée uniquement ici, jamais exposée au client
//  - toute route sensible vérifie le JWT Supabase de l'utilisateur

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '5mb' })); // limite : évite l'upload d'images géantes en base64

// --- CORS restreint (même en hackathon, éviter cors() sans argument) ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
}));

// --- Client Supabase côté serveur : utilise la service_role key ---
// Ne JAMAIS renvoyer ce client ou sa clé au frontend.
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- Middleware : vérifie le JWT envoyé par le client mobile ---
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Token invalide' });

  req.user = data.user;
  next();
}

// --- Route : annonces triées par proximité (appelle la fonction RPC PostGIS) ---
app.get('/api/listings/nearby', requireAuth, async (req, res) => {
  try {
    const { lat, lng, radius_km, category } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat et lng requis' });

    const { data, error } = await supabaseAdmin.rpc('nearby_listings', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_km: radius_km ? parseFloat(radius_km) : 50,
      filter_category: category || null,
    });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erreur nearby_listings:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Route : analyse photo par Gemini Vision -> JSON structuré ---
app.post('/api/ai/analyze-listing', requireAuth, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image manquante' });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyse cette image de produit agricole. Renvoie UNIQUEMENT un objet JSON
sans aucun texte explicatif autour, sans balises markdown. Format exact :
{"title": "nom commercial court", "category": "recolte ou animal ou intrant ou residu", "description": "phrase d'accroche commerciale courte"}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
    ]);

    const rawText = result.response.text();
    // Parsing tolérant : Gemini peut parfois ajouter du texte ou des ``` autour du JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Réponse IA non parsable');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Erreur analyze-listing:', err.message);
    res.status(500).json({ error: 'Analyse IA indisponible, veuillez remplir manuellement' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur AGRILINK CI démarré sur le port ${PORT}`));
