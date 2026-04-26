import { LocalizedString } from '../lib/i18n';

// Raw structure from the API
export interface RawProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
}

export interface Product {
  id: string; // Mapped to string for UI
  categoryId: string;
  name: string | LocalizedString; // We support either, will coerce to string later or use EN/FR mapping
  price: number;
  image: string;
  inStock?: boolean;
  rating?: number;
}

export interface Category {
  id: string;
  name: LocalizedString;
  image: string;
}

export interface Branch {
  id: string;
  name: string | LocalizedString;
  address: string | LocalizedString;
  city: string | LocalizedString;
  lat: number;
  lng: number;
}

// Category mappings from raw categories to UI categories
const API_CATEGORIES = [
  "Cosmetics & Personal Care",
  "Sports & Wellness",
  "Baby Products",
  "Food Products",
  "Alcoholic Drinks",
  "Kitchenware & Electronics",
  "Kitchen Storage",
  "Cleaning & Sanitary",
  "Pet Care",
  "General"
] as const;

export const generateCategories = (): Category[] => {
  return [
    { 
      id: "personal-care", 
      name: { EN: "Cosmetics & Personal Care", FR: "Cosmétiques et Soins", KIN: "Isuku n'Ubwiza" },
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      id: "sports-wellness", 
      name: { EN: "Sports & Wellness", FR: "Sports et Bien-être", KIN: "Siporo n'Ubuzima" },
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      id: "baby-products", 
      name: { EN: "Baby Products", FR: "Produits pour Bébés", KIN: "Ibikoresho by'Abana" },
      image: "/baby-product.jfif" 
    },
    { 
      id: "food-products", 
      name: { EN: "Food Products", FR: "Produits Alimentaires", KIN: "Ibiribwa" },
      image: "/food-products.jfif" 
    },
    { 
      id: "alcoholic-drinks", 
      name: { EN: "Alcoholic Drinks", FR: "Boissons Alcoolisées", KIN: "Inzoga" },
      image: "https://res.cloudinary.com/eskalate/image/upload/v1776507696/simba_contest/product_27003.jpg" 
    },
    { 
      id: "kitchen-electronics", 
      name: { EN: "Kitchenware & Electronics", FR: "Cuisine et Électronique", KIN: "Ibyo mu Gikoni n'Ibikoresho" },
      image: "/kitchenware-and-electronics.jfif" 
    },
    { 
      id: "kitchen-storage", 
      name: { EN: "Kitchen Storage", FR: "Rangement de Cuisine", KIN: "Kubika ibyo Gikoni" },
      image: "/kitchen-storage.jfif" 
    },
    { 
      id: "cleaning-sanitary", 
      name: { EN: "Cleaning & Sanitary", FR: "Nettoyage et Sanitaire", KIN: "Isuku n'Isukura" },
      image: "/cleaning-and-sanitation.jfif" 
    },
    { 
      id: "pet-care", 
      name: { EN: "Pet Care", FR: "Soins des Animaux", KIN: "Kwitaho k'Inyamaswa" },
      image: "/pet-care.jfif" 
    },
    { 
      id: "general", 
      name: { EN: "General", FR: "Général", KIN: "Ibindi Gena" },
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800" 
    }
  ];
};

// Dynamic category mapping logic
const categoryIdMap: Record<string, string> = {
  "Cosmetics & Personal Care": "personal-care",
  "Sports & Wellness": "sports-wellness",
  "Baby Products": "baby-products",
  "Kitchenware & Electronics": "kitchen-electronics",
  "Food Products": "food-products",
  "Alcoholic Drinks": "alcoholic-drinks",
  "General": "general",
  "Kitchen Storage": "kitchen-storage",
  "Cleaning & Sanitary": "cleaning-sanitary",
  "Pet Care": "pet-care"
};

import simbaDataRaw from './simbaData.json';

let rawProductData: any[] = [];
try {
  let fetchedData = simbaDataRaw as any;
  // Handle if the user pasted the payload as an object with a "products" array instead of a direct array
  if (fetchedData && !Array.isArray(fetchedData) && Array.isArray(fetchedData.products)) {
    fetchedData = fetchedData.products;
  } else if (!Array.isArray(fetchedData)) {
    fetchedData = [];
  }
  
  rawProductData = [...fetchedData];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
  // Graceful fallback if simbaData.json is somehow malformed
  rawProductData = [
    {"id":13001,"name":"Lentz Radiant Heater 80036","price":83600.0,"category":"Cosmetics & Personal Care","subcategoryId":13,"inStock":true,"image":"https://res.cloudinary.com/eskalate/image/upload/v1776507692/simba_contest/product_13001.jpg","unit":"Pcs"}
  ];
}

export const categories = generateCategories();

export const branches: Branch[] = [
  // Kigali City Center
  { id: '1', name: { EN: 'Simba UTC', FR: 'Simba UTC', KIN: 'Simba UTC' }, address: { EN: 'Union Trade Centre, 1 KN 4 Ave', FR: 'Union Trade Centre, 1 KN 4 Ave', KIN: 'Union Trade Centre, 1 KN 4 Ave' }, city: { EN: 'Kigali City Center', FR: 'Centre-ville de Kigali', KIN: 'Kigali rwagati' }, lat: -1.9444, lng: 30.0573 },
  { id: '2', name: { EN: 'Simba Centenary', FR: 'Simba Centenary', KIN: 'Simba Centenary' }, address: { EN: 'Centenary House, KN 4 Ave', FR: 'Centenary House, KN 4 Ave', KIN: 'Centenary House, KN 4 Ave' }, city: { EN: 'Kigali City Center', FR: 'Centre-ville de Kigali', KIN: 'Kigali rwagati' }, lat: -1.9435, lng: 30.0600 },
  
  // Kigali Suburban
  { id: '3', name: { EN: 'Simba Gishushu', FR: 'Simba Gishushu', KIN: 'Simba Gishushu' }, address: { EN: 'KN 5 Rd, Near RDB', FR: 'KN 5 Rd, Près du RDB', KIN: 'KN 5 Rd, Hafi y\'uburenganzira' }, city: { EN: 'Gishushu', FR: 'Gishushu', KIN: 'Gishushu' }, lat: -1.9482, lng: 30.0910 },
  { id: '4', name: { EN: 'Simba Kimironko', FR: 'Simba Kimironko', KIN: 'Simba Kimironko' }, address: { EN: 'Near Kimironko Market', FR: 'Près du marché de Kimironko', KIN: 'Hafi y\'isoko rya Kimironko' }, city: { EN: 'Kimironko', FR: 'Kimironko', KIN: 'Kimironko' }, lat: -1.9360, lng: 30.1274 },
  { id: '5', name: { EN: 'Simba Kisimenti', FR: 'Simba Kisimenti', KIN: 'Simba Kisimenti' }, address: { EN: 'Remera, Kisimenti roundabout', FR: 'Remera, rond-point de Kisimenti', KIN: 'Remera, Kisimenti' }, city: { EN: 'Remera', FR: 'Remera', KIN: 'Remera' }, lat: -1.9568, lng: 30.1064 },
  { id: '6', name: { EN: 'Simba Remera', FR: 'Simba Remera', KIN: 'Simba Remera' }, address: { EN: 'Main Remera Road', FR: 'Route principale de Remera', KIN: 'Umuhanda munini wa Remera' }, city: { EN: 'Remera', FR: 'Remera', KIN: 'Remera' }, lat: -1.9610, lng: 30.1150 },
  { id: '7', name: { EN: 'Simba Kicukiro', FR: 'Simba Kicukiro', KIN: 'Simba Kicukiro' }, address: { EN: 'Near Kicukiro Centre', FR: 'Près du centre de Kicukiro', KIN: 'Hafi rwagati ya Kicukiro' }, city: { EN: 'Kicukiro', FR: 'Kicukiro', KIN: 'Kicukiro' }, lat: -1.9867, lng: 30.1172 },
  { id: '8', name: { EN: 'Simba Gacuriro', FR: 'Simba Gacuriro', KIN: 'Simba Gacuriro' }, address: { EN: 'Umucyo Estate', FR: 'Lotissement Umucyo', KIN: 'Umucyo Estate' }, city: { EN: 'Gacuriro', FR: 'Gacuriro', KIN: 'Gacuriro' }, lat: -1.9180, lng: 30.0920 },
  { id: '9', name: { EN: 'Simba Nyarutarama', FR: 'Simba Nyarutarama', KIN: 'Simba Nyarutarama' }, address: { EN: 'Near MTN Center', FR: 'Près du centre MTN', KIN: 'Hafi ya MTN Center' }, city: { EN: 'Nyarutarama', FR: 'Nyarutarama', KIN: 'Nyarutarama' }, lat: -1.9288, lng: 30.1066 },
  { id: '10', name: { EN: 'Simba Kimihurura', FR: 'Simba Kimihurura', KIN: 'Simba Kimihurura' }, address: { EN: 'Near Parliament', FR: 'Près du Parlement', KIN: 'Hafi y\'inteko' }, city: { EN: 'Kimihurura', FR: 'Kimihurura', KIN: 'Kimihurura' }, lat: -1.9540, lng: 30.0811 },
  { id: '11', name: { EN: 'Simba Kacyiru', FR: 'Simba Kacyiru', KIN: 'Simba Kacyiru' }, address: { EN: 'Government Offices Area', FR: 'Zone des bureaux du gouvernement', KIN: 'Kacyiru rwagati' }, city: { EN: 'Kacyiru', FR: 'Kacyiru', KIN: 'Kacyiru' }, lat: -1.9405, lng: 30.0880 },
  { id: '12', name: { EN: 'Simba Nyamirambo', FR: 'Simba Nyamirambo', KIN: 'Simba Nyamirambo' }, address: { EN: 'KN 1 Rd, Cosmos', FR: 'KN 1 Rd, Cosmos', KIN: 'KN 1 Rd, Cosmos' }, city: { EN: 'Nyamirambo', FR: 'Nyamirambo', KIN: 'Nyamirambo' }, lat: -1.9757, lng: 30.0487 },
  { id: '13', name: { EN: 'Simba Nyabugogo', FR: 'Simba Nyabugogo', KIN: 'Simba Nyabugogo' }, address: { EN: 'Bus Park Area', FR: 'Zone de la gare routière', KIN: 'Nyabugogo' }, city: { EN: 'Nyabugogo', FR: 'Nyabugogo', KIN: 'Nyabugogo' }, lat: -1.9365, lng: 30.0450 },
  { id: '14', name: { EN: 'Simba Kanombe', FR: 'Simba Kanombe', KIN: 'Simba Kanombe' }, address: { EN: 'Near International Airport', FR: 'Près de l\'aéroport international', KIN: 'Hafi y\'ikibuga cy\'indege' }, city: { EN: 'Kanombe', FR: 'Kanombe', KIN: 'Kanombe' }, lat: -1.9630, lng: 30.1330 },
  { id: '15', name: { EN: 'Simba Kabeza', FR: 'Simba Kabeza', KIN: 'Simba Kabeza' }, address: { EN: 'Kabeza Market Area', FR: 'Zone du marché de Kabeza', KIN: 'Kabeza' }, city: { EN: 'Kabeza', FR: 'Kabeza', KIN: 'Kabeza' }, lat: -1.9810, lng: 30.1310 },
  { id: '16', name: { EN: 'Simba Rebero', FR: 'Simba Rebero', KIN: 'Simba Rebero' }, address: { EN: 'Rebero Hill', FR: 'Colline Rebero', KIN: 'Umuryango wa Rebero' }, city: { EN: 'Rebero', FR: 'Rebero', KIN: 'Rebero' }, lat: -2.0010, lng: 30.0650 },
  { id: '17', name: { EN: 'Simba Kagugu', FR: 'Simba Kagugu', KIN: 'Simba Kagugu' }, address: { EN: 'Kagugu Center', FR: 'Centre de Kagugu', KIN: 'Kagugu rwagati' }, city: { EN: 'Kagugu', FR: 'Kagugu', KIN: 'Kagugu' }, lat: -1.9050, lng: 30.0810 },

  // Outside Kigali
  { id: '18', name: { EN: 'Simba Huye', FR: 'Simba Huye', KIN: 'Simba Huye' }, address: { EN: 'Near University Town Center', FR: 'Près du centre universitaire', KIN: 'Hafi ya kaminuza' }, city: { EN: 'Huye', FR: 'Huye', KIN: 'Huye' }, lat: -2.5967, lng: 29.7392 },
  { id: '19', name: { EN: 'Simba Muhanga', FR: 'Simba Muhanga', KIN: 'Simba Muhanga' }, address: { EN: 'Muhanga Town', FR: 'Ville de Muhanga', KIN: 'Mujyi wa Muhanga' }, city: { EN: 'Muhanga', FR: 'Muhanga', KIN: 'Muhanga' }, lat: -2.0833, lng: 29.7500 },
  { id: '20', name: { EN: 'Simba Nyanza', FR: 'Simba Nyanza', KIN: 'Simba Nyanza' }, address: { EN: 'Near King\'s Palace', FR: 'Près du palais du roi', KIN: 'Hafi y\'ingoro y\'umwami' }, city: { EN: 'Nyanza', FR: 'Nyanza', KIN: 'Nyanza' }, lat: -2.3500, lng: 29.7500 },
  { id: '21', name: { EN: 'Simba Nyamagabe', FR: 'Simba Nyamagabe', KIN: 'Simba Nyamagabe' }, address: { EN: 'Nyamagabe Town', FR: 'Ville de Nyamagabe', KIN: 'Mujyi wa Nyamagabe' }, city: { EN: 'Nyamagabe', FR: 'Nyamagabe', KIN: 'Nyamagabe' }, lat: -2.4700, lng: 29.5700 },
  { id: '22', name: { EN: 'Simba Musanze', FR: 'Simba Musanze', KIN: 'Simba Musanze' }, address: { EN: 'Near Main Roundabout', FR: 'Près du rond-point principal', KIN: 'Hafi y\'umuryango' }, city: { EN: 'Musanze', FR: 'Musanze', KIN: 'Musanze' }, lat: -1.5083, lng: 29.6333 },
  { id: '23', name: { EN: 'Simba Gicumbi', FR: 'Simba Gicumbi', KIN: 'Simba Gicumbi' }, address: { EN: 'Byumba Town', FR: 'Ville de Byumba', KIN: 'Mujyi wa Byumba' }, city: { EN: 'Gicumbi', FR: 'Gicumbi', KIN: 'Gicumbi' }, lat: -1.6100, lng: 30.0600 },
  { id: '24', name: { EN: 'Simba Rubavu', FR: 'Simba Rubavu', KIN: 'Simba Rubavu' }, address: { EN: 'Near Lake Kivu', FR: 'Près du lac Kivu', KIN: 'Hafi y\'ikiyaga cya Kivu' }, city: { EN: 'Gisenyi', FR: 'Gisenyi', KIN: 'Gisenyi' }, lat: -1.7028, lng: 29.2564 },
  { id: '25', name: { EN: 'Simba Karongi', FR: 'Simba Karongi', KIN: 'Simba Karongi' }, address: { EN: 'Lake Kivu Area', FR: 'Zone du lac Kivu', KIN: 'Hafi y\'ikiyaga cya Kivu' }, city: { EN: 'Kibuye', FR: 'Kibuye', KIN: 'Kibuye' }, lat: -2.0500, lng: 29.3500 },
  { id: '26', name: { EN: 'Simba Rusizi', FR: 'Simba Rusizi', KIN: 'Simba Rusizi' }, address: { EN: 'Border Town', FR: 'Ville frontalière', KIN: 'Hafi y\'umupaka' }, city: { EN: 'Cyangugu', FR: 'Cyangugu', KIN: 'Cyangugu' }, lat: -2.4833, lng: 28.9000 },
  { id: '27', name: { EN: 'Simba Rwamagana', FR: 'Simba Rwamagana', KIN: 'Simba Rwamagana' }, address: { EN: 'Town Center', FR: 'Centre-ville', KIN: 'Mujyi rwagati' }, city: { EN: 'Rwamagana', FR: 'Rwamagana', KIN: 'Rwamagana' }, lat: -1.9500, lng: 30.4333 },
  { id: '28', name: { EN: 'Simba Ngoma', FR: 'Simba Ngoma', KIN: 'Simba Ngoma' }, address: { EN: 'Ngoma Town', FR: 'Ville de Ngoma', KIN: 'Mujyi wa Ngoma' }, city: { EN: 'Ngoma', FR: 'Ngoma', KIN: 'Ngoma' }, lat: -2.1833, lng: 30.4833 },
  { id: '29', name: { EN: 'Simba Nyagatare', FR: 'Simba Nyagatare', KIN: 'Simba Nyagatare' }, address: { EN: 'Nyagatare Town', FR: 'Ville de Nyagatare', KIN: 'Mujyi wa Nyagatare' }, city: { EN: 'Nyagatare', FR: 'Nyagatare', KIN: 'Nyagatare' }, lat: -1.3000, lng: 30.3333 }
];

const frDict: Record<string, string> = {
  "milk": "lait", "bread": "pain", "beef": "bœuf", "chicken": "poulet", "pork": "porc", "cheese": "fromage",
  "rice": "riz", "corn": "maïs", "sugar": "sucre", "salt": "sel", "spice": "épice", "mushroom": "champignon",
  "honey": "miel", "dates": "dattes", "mustard": "moutarde", "ketchup": "ketchup", "jam": "confiture",
  "chocolate": "chocolat", "coffee": "café", "tea": "thé", "tuna": "thon", "sardine": "sardine",
  "peanuts": "cacahuètes", "oil": "huile", "mayonnaise": "mayonnaise", "flour": "farine", "vinegar": "vinaigre",
  "water": "eau", "apple": "pomme", "lemon": "citron", "orange": "orange", "avocado": "avocat", "strawberry": "fraise",
  "pineapple": "ananas", "meat": "viande", "biscuit": "biscuit", "sweet": "bonbon", "cake": "gâteau", "sausage": "saucisse",
  "beer": "bière", "wine": "vin", "juice": "jus", "drinks": "boissons", "drink": "boisson",
  "soap": "savon", "shampoo": "shampoing", "lotion": "lotion", "cream": "crème", "brush": "brosse",
  "toy": "jouet", "diaper": "couche", "wipes": "lingettes", "pad": "serviette", "towel": "serviette",
  "paper": "papier", "glass": "verre", "cup": "tasse", "plate": "assiette", "knife": "couteau", "spoon": "cuillère",
  "bottle": "bouteille", "pan": "poêle", "pot": "casserole", "iron": "fer", "heater": "radiateur", "shoes": "chaussures",
  "black": "noir", "white": "blanc", "red": "rouge", "green": "vert", "blue": "bleu", "yellow": "jaune", "brown": "marron",
  "pure": "pur"
};

const kinDict: Record<string, string> = {
  "milk": "amata", "bread": "umugati", "beef": "inyama", "chicken": "inkoko", "pork": "ingurube", "cheese": "foromaje",
  "rice": "umuceri", "corn": "ikigori", "sugar": "isukari", "salt": "umunyu", "spice": "ibirungo", "mushroom": "icyobo",
  "honey": "ubuki", "mustard": "mutaridi", "jam": "konfitire",
  "chocolate": "shokora", "coffee": "ikawa", "tea": "icyayi", "tuna": "ifi", "sardine": "sarudine",
  "peanuts": "ubunyobwa", "oil": "amavuta", "flour": "ifu", "vinegar": "vinegere",
  "water": "amazi", "apple": "pome", "lemon": "indimu", "orange": "icunga", "avocado": "avoka", "strawberry": "inobori",
  "pineapple": "inanasi", "meat": "inyama", "biscuit": "biswi", "sweet": "shokola", "cake": "keke", "sausage": "sosise",
  "beer": "inzoga", "wine": "divayi", "juice": "umutobe", "drinks": "ibinyobwa", "drink": "ikinyobwa",
  "soap": "isabune", "shampoo": "isabune y'imisatsi", "lotion": "amavuta", "cream": "amavuta", "brush": "uburoso",
  "toy": "igikinishe", "diaper": "pampasi", "wipes": "umwenda", "pad": "kotegisi", "towel": "eswimayi",
  "paper": "urupapuro", "glass": "ikirahure", "cup": "igikombe", "plate": "isahani", "knife": "icyuma", "spoon": "ikiyiko",
  "bottle": "icupa", "pan": "ipanu", "pot": "isafuriya", "iron": "ipasi", "heater": "ishyushyabintu",
  "black": "umukara", "white": "umweru", "red": "umutuku", "green": "icyatsi", "blue": "ubururu", "yellow": "umuhondo",
  "pure": "umwimerere"
};

function translateName(name: string, dict: Record<string, string>): string {
  let translated = name;
  for (const [en, trans] of Object.entries(dict)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, (match) => {
      // Basic match case
      if (match === match.toUpperCase() && match.length > 1) return trans.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return trans.charAt(0).toUpperCase() + trans.slice(1);
      return trans;
    });
  }
  return translated;
}

export const products: Product[] = rawProductData.map((raw: any) => {
  let mappedCategory = categoryIdMap[raw.category] || "general";
  const nameLower = String(raw.name || "").toLowerCase();

  // The raw JSON has corrupted category data (e.g., Milk in Cosmetics, Toilet paper in Alcoholic Drinks).
  // We use intelligent keyword matching to correctly place items into their real categories.
  if (
    nameLower.includes("milk") || nameLower.includes("baguette") || nameLower.includes("bread") || 
    nameLower.includes("sausage") || nameLower.includes("croissant") || nameLower.includes("cheese") || 
    nameLower.includes("beef") || nameLower.includes("chicken") || nameLower.includes("pork") || 
    nameLower.includes("cake") || nameLower.includes("honey") || nameLower.includes("mustard") || 
    nameLower.includes("ketchup") || nameLower.includes("rice") || nameLower.includes("corn") || 
    nameLower.includes("sugar") || nameLower.includes("salt") || nameLower.includes("spice") || 
    nameLower.includes("powder") || nameLower.includes("jam") || nameLower.includes("spread") || 
    nameLower.includes("coffee") || nameLower.includes("tea") || nameLower.includes("chocolate") || 
    nameLower.includes("candy") || nameLower.includes("toffee") || nameLower.includes("gum") || 
    nameLower.includes("lollipop") || nameLower.includes("tuna") || nameLower.includes("sardine") ||
    nameLower.includes("mushroom") || nameLower.includes("dates") || nameLower.includes("peanuts") ||
    nameLower.includes("oil") || nameLower.includes("mayonnaise") || nameLower.includes("flour") ||
    nameLower.includes("vinegar") || nameLower.includes("pop corn") || nameLower.includes("sauce") ||
    nameLower.includes("noodle") || nameLower.includes("indomie") || nameLower.includes("eggs") ||
    nameLower.includes("apple") || nameLower.includes("lemon") || nameLower.includes("orange") ||
    nameLower.includes("avocado") || nameLower.includes("strawberry") || nameLower.includes("pineapple") ||
    nameLower.includes("oat") || nameLower.includes("muesli") || nameLower.includes("syrup") ||
    nameLower.includes("margarine") || nameLower.includes("corned") || nameLower.includes("meat") ||
    nameLower.includes("wafer") || nameLower.includes("sweets")
  ) {
    mappedCategory = "food-products";
  } else if (
    nameLower.includes("beer") || nameLower.includes("whisky") || nameLower.includes("whiskey") ||
    nameLower.includes("wine") || nameLower.includes("champagne") || nameLower.includes("gin ") ||
    nameLower.includes("cognac") || nameLower.includes("tequila") || nameLower.includes("vodka") ||
    nameLower.includes("rum ") || nameLower.includes("cider") || nameLower.includes("amarula") ||
    nameLower.includes("liqueur") || nameLower.includes("sec") || nameLower.includes("smirnoff") ||
    nameLower.includes("gordon") || nameLower.includes("black label") || nameLower.includes("red label") ||
    nameLower.includes("jack daniel") || nameLower.includes("energy drink") || nameLower.includes("red bull") ||
    nameLower.includes("panache")
  ) {
    mappedCategory = "alcoholic-drinks";
  } else if (
    nameLower.includes("baby") || nameLower.includes("diaper") || nameLower.includes("doll ") ||
    nameLower.includes("toy") || nameLower.includes("wipes") || nameLower.includes("lactogen") ||
    nameLower.includes("pampers") || nameLower.includes("cotton buds")
  ) {
    mappedCategory = "baby-products";
  } else if (
    nameLower.includes("shampoo") || nameLower.includes("conditioner") || nameLower.includes("lotion") ||
    nameLower.includes("cream") || nameLower.includes("soap") || nameLower.includes("handwash") ||
    nameLower.includes("gel") || nameLower.includes("spray") || nameLower.includes("deodorant") ||
    nameLower.includes("perfume") || nameLower.includes("shaver") || nameLower.includes("razor") ||
    nameLower.includes("gilette") || nameLower.includes("vaseline") || nameLower.includes("pads") ||
    nameLower.includes("tampon") || nameLower.includes("sanitary towel") || nameLower.includes("pantyliner") ||
    nameLower.includes("lip") || nameLower.includes("massage") || nameLower.includes("hair")
  ) {
    mappedCategory = "personal-care";
  } else if (
    nameLower.includes("cleaner") || nameLower.includes("detergent") || nameLower.includes("softner") ||
    nameLower.includes("bleach") || nameLower.includes("toilet paper") || nameLower.includes("kitchen towel") ||
    nameLower.includes("tissue") || nameLower.includes("mop") || nameLower.includes("brush") ||
    nameLower.includes("sponge") || nameLower.includes("scouring") || nameLower.includes("cloth") ||
    nameLower.includes("washing")
  ) {
    mappedCategory = "cleaning-sanitary";
  } else if (
    nameLower.includes("dog food") || nameLower.includes("cat food") || nameLower.includes("pet")
  ) {
    mappedCategory = "pet-care";
  } else if (
    nameLower.includes("kettle") || nameLower.includes("blender") || nameLower.includes("iron") ||
    nameLower.includes("heater") || nameLower.includes("pan ") || nameLower.includes("pot") ||
    nameLower.includes(" extension") || nameLower.includes("socket") || nameLower.includes("adaptor") ||
    nameLower.includes("coffee maker") || nameLower.includes("knife") || nameLower.includes("spoon") ||
    nameLower.includes("cup") || nameLower.includes("glass") || nameLower.includes("plate") ||
    nameLower.includes("foil") || nameLower.includes("paper plate")
  ) {
    mappedCategory = "kitchen-electronics";
  } else if (
    nameLower.includes("bottle") || nameLower.includes("canister") || nameLower.includes("flask")
  ) {
    mappedCategory = "kitchen-storage";
  } else if (
    nameLower.includes("sports") || nameLower.includes("dumbell") || nameLower.includes("yoga") ||
    nameLower.includes("jump rope")
  ) {
    mappedCategory = "sports-wellness";
  }

  // Edge Case overrides
  if (nameLower.includes("dog shampoo")) mappedCategory = "pet-care";

  const englishName = String(raw.name || "");
  return {
    id: String(raw.id),
    categoryId: mappedCategory,
    name: { 
      EN: englishName, 
      FR: translateName(englishName, frDict), 
      KIN: translateName(englishName, kinDict) 
    },
    price: raw.price,
    image: raw.image,
    inStock: raw.inStock,
    rating: 3.5 + (Number(raw.id) % 15) / 10 // Generated stable rating between 3.5 and 5.0
  };
});
