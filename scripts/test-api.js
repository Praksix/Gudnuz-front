const axios = require('axios');

// Configuration de test
const API_BASE_URL = 'http://localhost:8080/api';

async function testAPI() {
  console.log('🧪 Test de connectivité API...');
  console.log('📍 URL de base:', API_BASE_URL);
  
  try {
    // Test 1: Vérifier si le serveur répond
    console.log('\n1️⃣ Test de connectivité de base...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Serveur accessible:', healthResponse.status);
    
    // Test 2: Récupérer les Nuz
    console.log('\n2️⃣ Test de récupération des Nuz...');
    const nuzsResponse = await axios.get(`${API_BASE_URL}/nuzs`, { timeout: 10000 });
    console.log('✅ Nuz récupérés:', nuzsResponse.data);
    console.log('📊 Nombre de Nuz:', nuzsResponse.data.data?.length || 0);
    
    if (nuzsResponse.data.data && nuzsResponse.data.data.length > 0) {
      console.log('📋 Premier Nuz:', nuzsResponse.data.data[0]);
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Le serveur backend n\'est pas accessible');
      console.error('💡 Vérifiez que votre serveur backend fonctionne sur le port 8080');
    } else if (error.response) {
      console.error('🔴 Erreur HTTP:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🔴 Pas de réponse du serveur');
    }
  }
}

// Test avec différentes URLs pour le développement mobile
async function testMobileURLs() {
  console.log('\n📱 Test des URLs pour développement mobile...');
  
  const urls = [
    'http://localhost:8080/api',
    'http://10.0.2.2:8080/api',
    'http://127.0.0.1:8080/api'
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n🔍 Test de ${url}...`);
      const response = await axios.get(`${url}/nuzs`, { timeout: 5000 });
      console.log(`✅ ${url} - OK (${response.data.data?.length || 0} Nuz)`);
    } catch (error) {
      console.log(`❌ ${url} - Erreur: ${error.message}`);
    }
  }
}

// Exécuter les tests
async function runTests() {
  await testAPI();
  await testMobileURLs();
}

runTests().catch(console.error); 