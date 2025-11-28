export interface StorageDao {
  createImage(imageBytesBase64: string, fileName: string): Promise<string>;
  deleteImage(fileName: string): Promise<void>;
  getImage(fileName: string): Promise<string>;
}
