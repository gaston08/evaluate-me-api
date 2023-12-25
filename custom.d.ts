declare namespace Express {
  export interface Request {
    user?: {
      _id: string;
      email: string;
      tokens: Array;
      createdAt: string;
      updatedAt: string;
      __v: number;
      iat: number;
      exp: number;
    };
  }
}
