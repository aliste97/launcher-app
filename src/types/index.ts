export interface ShoppingItem {
    id: string;
    name: string;
    quantity: number;
    purchased: boolean;
    supermarket?: string; // Added supermarket field
  }
  