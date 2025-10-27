/**
 * Smart Sample Brief Generator
 * Generates contextually relevant briefs based on random brands from our database
 */

import { Brand } from "@/types";

// Campaign templates based on industry
const CAMPAIGN_TEMPLATES = {
  "Fashion & Retail": {
    products: ["Nueva colección primavera/verano", "Línea de ropa sostenible", "Colaboración con diseñador", "Colección cápsula exclusiva"],
    objectives: [
      "Generar awareness sobre el lanzamiento de la nueva colección",
      "Posicionar la marca como referente en moda sostenible",
      "Alcanzar 2M de impresiones en redes sociales",
      "Aumentar ventas online en un 30%",
      "Generar tráfico cualificado a la web de e-commerce"
    ],
    contentThemes: [
      "Lookbook de temporada y styling tips",
      "Unboxing y haul de la nueva colección",
      "Outfits del día y combinaciones versátiles",
      "Behind the scenes del proceso de diseño",
      "Styling para diferentes ocasiones"
    ],
    hashtags: ["#NewCollection", "#FashionStyle", "#OOTD", "#SustainableFashion"]
  },
  "Sports & Fitness": {
    products: ["Nuevo equipamiento deportivo", "Línea de ropa técnica", "Zapatillas running", "Colección fitness"],
    objectives: [
      "Aumentar awareness de la marca en el sector fitness",
      "Posicionar productos como referencia en rendimiento deportivo",
      "Generar contenido motivacional y aspiracional",
      "Incrementar ventas de la nueva línea en 40%",
      "Alcanzar comunidad activa de 1.5M personas"
    ],
    contentThemes: [
      "Rutinas de entrenamiento con productos",
      "Desafíos fitness y transformaciones",
      "Tips de nutrición y recuperación",
      "Lifestyle de atletas y deportistas",
      "Motivación y superación personal"
    ],
    hashtags: ["#FitnessMotivation", "#ActiveLifestyle", "#TrainHard", "#SportsPerformance"]
  },
  "Food & Beverage": {
    products: ["Nueva línea de productos gourmet", "Lanzamiento de bebida premium", "Colección recetas", "Productos orgánicos"],
    objectives: [
      "Generar awareness del nuevo producto",
      "Posicionar la marca como opción premium/saludable",
      "Aumentar trial y repetición de compra",
      "Generar contenido gastronómico aspiracional",
      "Alcanzar foodies y amantes de la buena comida"
    ],
    contentThemes: [
      "Recetas creativas con los productos",
      "Momentos de disfrute y ocasiones de consumo",
      "Unboxing y tasting de productos",
      "Maridajes y combinaciones gourmet",
      "Behind the scenes de la producción"
    ],
    hashtags: ["#Foodie", "#GourmetLife", "#FoodLovers", "#DeliciousMoments"]
  },
  "Beauty & Cosmetics": {
    products: ["Nueva línea de skincare", "Colección de maquillaje", "Tratamiento facial innovador", "Fragancias exclusivas"],
    objectives: [
      "Lanzar nueva línea de productos beauty",
      "Posicionar como marca de belleza premium/accesible",
      "Generar tutoriales y demostraciones de uso",
      "Aumentar engagement con comunidad beauty",
      "Incrementar conversión online en 35%"
    ],
    contentThemes: [
      "Rutinas de skincare y makeup tutorials",
      "Before & after y resultados reales",
      "Tips de belleza y trucos profesionales",
      "Get ready with me y looks completos",
      "Reviews honestas y primeras impresiones"
    ],
    hashtags: ["#BeautyRoutine", "#SkincareObsessed", "#MakeupTutorial", "#GlowUp"]
  },
  "Technology & Electronics": {
    products: ["Nuevo smartphone", "Gadget innovador", "Accesorios tech", "Dispositivo smart home"],
    objectives: [
      "Generar buzz sobre lanzamiento tecnológico",
      "Demostrar características y beneficios del producto",
      "Posicionar como marca innovadora",
      "Generar reviews auténticas y unboxings",
      "Alcanzar early adopters y tech enthusiasts"
    ],
    contentThemes: [
      "Unboxing y primeras impresiones",
      "Reviews técnicas y comparativas",
      "Casos de uso en la vida diaria",
      "Tips y trucos para aprovechar el dispositivo",
      "Integración en ecosistema tech"
    ],
    hashtags: ["#TechReview", "#Innovation", "#TechLife", "#Gadgets"]
  },
  "Home & Decor": {
    products: ["Nueva colección decoración", "Línea de muebles", "Textiles para hogar", "Artículos de organización"],
    objectives: [
      "Inspirar a renovar espacios del hogar",
      "Posicionar como marca de diseño accesible/premium",
      "Generar ideas de decoración y styling",
      "Aumentar tráfico a tiendas físicas y online",
      "Crear comunidad de home decor lovers"
    ],
    contentThemes: [
      "Room makeovers y transformaciones",
      "Tips de decoración y organización",
      "Seasonal decor y tendencias",
      "DIY projects con productos de la marca",
      "Home tours y styling"
    ],
    hashtags: ["#HomeDecor", "#InteriorDesign", "#HomeInspo", "#CozyHome"]
  },
  "Automotive": {
    products: ["Nuevo modelo de vehículo", "Edición especial", "Accesorios para coche", "Servicio de mantenimiento"],
    objectives: [
      "Generar awareness del nuevo modelo",
      "Posicionar características diferenciales",
      "Crear experiencias de prueba y test drive",
      "Aumentar visitas a concesionarios",
      "Generar contenido aspiracional de lifestyle"
    ],
    contentThemes: [
      "Experiencias de conducción y road trips",
      "Características y tecnología del vehículo",
      "Lifestyle y momentos con el coche",
      "Comparativas y reviews honestas",
      "Aventuras y viajes"
    ],
    hashtags: ["#CarLife", "#DrivingExperience", "#RoadTrip", "#CarReview"]
  }
};

const PLATFORMS = ["Instagram", "TikTok", "YouTube"];
const LOCATIONS = ["Madrid, Barcelona, Valencia", "España", "Principales ciudades españolas"];
const TIMELINES = [
  "Lanzamiento: próximo mes, campaña de 3 semanas",
  "Inicio inmediato, duración 4 semanas",
  "Lanzamiento trimestral, campaña de 2 meses",
  "Inicio Q1, campaña de 6 semanas"
];

/**
 * Get industry category (simplified to match campaign templates)
 */
const getIndustryCategory = (industry: string): keyof typeof CAMPAIGN_TEMPLATES => {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes("fashion") || industryLower.includes("retail") || industryLower.includes("clothing")) {
    return "Fashion & Retail";
  }
  if (industryLower.includes("sport") || industryLower.includes("fitness") || industryLower.includes("athletic")) {
    return "Sports & Fitness";
  }
  if (industryLower.includes("food") || industryLower.includes("beverage") || industryLower.includes("restaurant") || industryLower.includes("grocery")) {
    return "Food & Beverage";
  }
  if (industryLower.includes("beauty") || industryLower.includes("cosmetic") || industryLower.includes("skincare")) {
    return "Beauty & Cosmetics";
  }
  if (industryLower.includes("tech") || industryLower.includes("electronic") || industryLower.includes("software")) {
    return "Technology & Electronics";
  }
  if (industryLower.includes("home") || industryLower.includes("decor") || industryLower.includes("furniture")) {
    return "Home & Decor";
  }
  if (industryLower.includes("automotive") || industryLower.includes("car")) {
    return "Automotive";
  }
  
  // Default to Fashion & Retail
  return "Fashion & Retail";
};

/**
 * Load all brands from CSV
 */
export const loadBrandsFromCSV = async (): Promise<Brand[]> => {
  try {
    const response = await fetch('/data/brands.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const brands: Brand[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 7) continue;
      
      brands.push({
        name: values[0].replace(/^"|"$/g, ''),
        industry: values[1].replace(/^"|"$/g, ''),
        description: values[2].replace(/^"|"$/g, ''),
        targetAge: values[3].replace(/^"|"$/g, ''),
        targetGender: values[4].replace(/^"|"$/g, ''),
        targetInterests: values[5].replace(/^"|"$/g, '').split(',').map(s => s.trim()),
        contentThemes: values[6].replace(/^"|"$/g, '').split(',').map(s => s.trim())
      });
    }
    
    return brands;
  } catch (error) {
    console.error('Error loading brands from CSV:', error);
    return [];
  }
};

/**
 * Generate a random sample brief based on a random brand from database
 */
export const generateRandomSampleBrief = async (): Promise<string> => {
  const brands = await loadBrandsFromCSV();
  
  if (brands.length === 0) {
    // Fallback to default sample if CSV loading fails
    return generateFallbackBrief();
  }
  
  // Pick random brand
  const randomBrand = brands[Math.floor(Math.random() * brands.length)];
  
  // Get industry category and template
  const industryCategory = getIndustryCategory(randomBrand.industry);
  const template = CAMPAIGN_TEMPLATES[industryCategory];
  
  // Generate random selections
  const product = template.products[Math.floor(Math.random() * template.products.length)];
  const objectives = template.objectives
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4 objectives
  const contentThemes = template.contentThemes
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4 themes
  const platforms = PLATFORMS.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 platforms
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const timeline = TIMELINES[Math.floor(Math.random() * TIMELINES.length)];
  const budget = [15000, 25000, 35000, 50000, 75000, 100000][Math.floor(Math.random() * 6)];
  const hashtag = template.hashtags[Math.floor(Math.random() * template.hashtags.length)];
  
  // Generate brief
  return `Brief de Campaña - ${randomBrand.name}

Cliente: ${randomBrand.name}
Sector: ${randomBrand.industry}
Producto: ${product}
Presupuesto: ${budget.toLocaleString()}€

Sobre la Marca:
${randomBrand.description}

Objetivos de la Campaña:
${objectives.map(obj => `- ${obj}`).join('\n')}

Target:
- Edad: ${randomBrand.targetAge}
- Género: ${randomBrand.targetGender}
- Ubicación: ${location}
- Intereses: ${randomBrand.targetInterests.slice(0, 4).join(', ')}

Territorio de Contenido:
${contentThemes.map(theme => `- ${theme}`).join('\n')}

Requerimientos:
- Contenido auténtico y natural
- Mencionar beneficios clave del producto
- Link a la web en stories y bio
- Uso del hashtag ${hashtag}
- Tag @${randomBrand.name.toLowerCase().replace(/\s+/g, '')} en publicaciones

Plataformas Preferidas:
${platforms.map(p => `- ${p}`).join('\n')}

Timeline:
${timeline}

Notas Adicionales:
- Buscamos influencers que conecten con los valores de marca: ${randomBrand.contentThemes.slice(0, 2).join(' y ')}
- Preferencia por contenido de alta calidad visual
- Look After You gestionará la coordinación y envío de productos`;
};

/**
 * Fallback brief if CSV loading fails
 */
const generateFallbackBrief = (): string => {
  return `Brief de Campaña - The Band Perfume

Cliente: The Band
Producto: Lanzamiento nueva línea de perfumes de lujo
Presupuesto: 50,000€

Objetivos de la Campaña:
- Generar awareness sobre el lanzamiento de la nueva colección
- Posicionar The Band como marca premium en el segmento de perfumería de lujo
- Alcanzar 2M de impresiones en redes sociales
- Generar tráfico cualificado a la web de e-commerce

Target:
- Edad: 25-45 años
- Género: 60% mujeres, 40% hombres
- Ubicación: España (Madrid, Barcelona, Valencia)
- Intereses: Moda, lifestyle premium, belleza, tendencias

Territorio de Contenido:
- Unboxing y first impressions de la colección
- Storytelling sobre las notas olfativas
- Lifestyle content integrando el perfume
- Momentos especiales (eventos, cenas, viajes)

Plataformas Preferidas:
- Instagram
- TikTok

Timeline:
- Lanzamiento: próximo mes
- Duración campaña: 3 semanas`;
};

