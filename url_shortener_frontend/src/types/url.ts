export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUrlPayload {
  originalUrl: string;
}
