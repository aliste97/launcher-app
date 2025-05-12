
export interface FirebaseAppConfig {
  id: string;
  name: string;
  logoUrl: string;
  appUrl: string;
  description?: string;
  dataAiHint?: string; // Optional specific hint for AI
}

export const firebaseApps: FirebaseAppConfig[] = [
  {
    id: 'wisePantry',
    name: 'WisePantry',
    logoUrl: 'wisePantry.png', // Modern pantry/basket image
    appUrl: '/wisepantry', // Example internal URL
    description: 'WisePantry helps you manage your grocery shopping by allowing you to save items you need to buy.',
    dataAiHint: 'pantry basket', // Updated hint
  },
  {
    id: 'veganWise',
    name: 'VeganWise',
    logoUrl: 'https://picsum.photos/seed/barcodephone/300/300', // New image: phone scanning barcode
    appUrl: 'https://veganwise.web.app/', // Example external URL
    description: 'VeganWise helps you make ethical shopping choices by scanning barcodes and instantly telling you if an item is vegan.',
    dataAiHint: 'barcode phone', // Updated hint for the new image
  }
  // Add more Firebase apps here as needed
];







