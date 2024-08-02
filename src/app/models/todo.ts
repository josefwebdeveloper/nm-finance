export interface Todo {
  title: string;
  expirationDate: string;
  expirationTime?: string;
  createdAt: Date;
  favorite: boolean;
}
