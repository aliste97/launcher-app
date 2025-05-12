
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
    logoUrl: '/wisePantry.png', // Realistic photo of groceries
    appUrl: '/wisepantry', // Example external URL
    description: 'WisePantry helps you manage your grocery shopping by allowing you to save items you need to buy.',
    dataAiHint: 'shopping app',
  },
  /* {
    id: 'wiseLauncher',
    name: 'Wise Launcher', // Updated name for display consistency
    logoUrl: 'https://picsum.photos/seed/appgrid/200/200', // Placeholder representing a grid of app icons
    appUrl: '/', // Assuming the launcher is at the root
    description: 'A central hub to launch and manage your Firebase applications.', // Updated description
    dataAiHint: 'app grid', // Updated AI hint for a launcher interface
  }, */
  /* {
    id: 'cloudcanvas',
    name: 'CloudCanvas',
    logoUrl: 'https://picsum.photos/seed/cloudcanvas/200/200',
    appUrl: 'https://cloudcanvas.example.com',
    description: 'Collaborative digital whiteboard for teams and individuals.',
    dataAiHint: 'drawing board',
  }, */

  // Add more Firebase apps here as needed
];

