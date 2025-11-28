import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageDao } from "./StorageDao";

const BUCKET = "jakenef-tweeter-storage";
const REGION = "us-east-2";

export class StorageDaoS3 implements StorageDao {
  private readonly client = new S3Client({ region: REGION });

  async createImage(
    imageBytesBase64: string,
    fileName: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(imageBytesBase64, "base64");
    const s3Params = {
      Bucket: BUCKET,
      Key: "image/" + fileName,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    try {
      await this.client.send(c);
      return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }

  deleteImage(fileName: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getImage(fileName: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
