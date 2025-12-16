import "express";

declare module "express-serve-static-core" {
  interface Request {
    file?: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer?: Buffer;
      size?: number;
    };
  }
}
