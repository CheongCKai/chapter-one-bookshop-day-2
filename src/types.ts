export interface Book {
  /** URL-friendly stable identifier, e.g. "the-lantern-sea". */
  id: string;
  title: string;
  author: string;
  /** Price in dollars, e.g. 14.99. */
  price: number;
  genre: string;
  /** Copies in stock. Low values (<= 3) are the ones worth flagging. */
  stock: number;
  description: string;
  /** Hex colour (no leading #) shown as a fallback behind the cover image. */
  cover: string;
  /** Path (relative to /public) to the cover thumbnail asset, e.g. "covers/quiet-orbit.jpg". */
  coverImage: string;
}

/** The JSON error shape every route returns on failure. */
export interface ApiError {
  error: string;
}

/** A catalogue-derived line in a cart. */
export interface CartItem {
  bookId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  total: number;
}
