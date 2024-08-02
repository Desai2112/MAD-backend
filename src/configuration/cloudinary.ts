import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.Cloudinary_Cloud_Name!,
  api_key: process.env.Cloudinary_api_key!,
  api_secret: process.env.Cloudinary_api_secret!,
});

const uploadOnCloudinary = async (localfilepath: string): Promise<string | null> => {
  try {
    console.log(localfilepath);
    if (!localfilepath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: 'auto'
    });

    console.log("File is uploaded successfully on Cloudinary", response.url);
    fs.unlinkSync(localfilepath); // Remove the local file after successful upload
    return response.url;
  } catch (error) {
    console.log("Error:", error);
    fs.unlinkSync(localfilepath); // Remove the local file as upload failed
    return null;
  }
}

export { uploadOnCloudinary };
