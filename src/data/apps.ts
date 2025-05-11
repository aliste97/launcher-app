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
    id: 'PantryPal',
    name: 'PantryPal',
    logoUrl: 'https://picsum.photos/seed/safeplate/200/200',
    appUrl: 'https://pantrypal-budwm.web.app', // Example external URL
    description: 'Manage food safety protocols and ensure compliance with industry standards.',
    dataAiHint: 'food safety',
  },
  /* {
    id: 'firejournal',
    name: 'FireJournal',
    logoUrl: 'https://picsum.photos/seed/firejournal/200/200',
    appUrl: 'https://firejournal.example.com',
    description: 'Your personal, secure, cloud-based journaling application.',
    dataAiHint: 'journal notebook',
  },
  {
    id: 'cloudcanvas',
    name: 'CloudCanvas',
    logoUrl: 'https://picsum.photos/seed/cloudcanvas/200/200',
    appUrl: 'https://cloudcanvas.example.com',
    description: 'Collaborative digital whiteboard for teams and individuals.',
    dataAiHint: 'drawing board',
  }, */
  // Add more Firebase apps here as needed
];
