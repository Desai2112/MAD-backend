import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: File, cb: (error: (Error | null), destination: string) => void): void {
    console.log('File upload destination function called.');
    console.log('File fieldname:', file.fieldname);
    console.log('File originalname:', file.originalname);
    console.log('Destination folder:', './public/temp');
    cb(null, './public/temp');
  },
  filename: function (req: Request, file: File, cb: (error: (Error | null), filename: string) => void): void {
    console.log('File upload filename function called.');
    console.log('File originalname:', file.originalname);
    const newFilename = Date.now() + '-' + file.originalname;
    console.log('New filename:', newFilename);
    cb(null, newFilename);
  }
});

export const upload = multer({ storage: storage });
