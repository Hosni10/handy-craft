/**
 * File storage service interface.
 * Currently backed by local disk (`/uploads`).
 * Replace with an S3-compatible implementation when needed.
 */
export interface StorageService {
  /** Save a file buffer and return its public URL path */
  save(file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<string>;
  /** Delete a file by its URL path */
  delete(urlPath: string): Promise<void>;
}
