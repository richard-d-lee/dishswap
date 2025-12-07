// AWS S3 storage integration
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type StorageConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getStorageConfig(): StorageConfig {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS S3 credentials missing: set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY"
    );
  }

  return { bucket, region, accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = getStorageConfig();
    s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload a file to S3
 * @param relKey - The S3 key (path) for the file
 * @param data - The file data as Buffer, Uint8Array, or string
 * @param contentType - The MIME type of the file
 * @returns Object containing the key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const client = getS3Client();
  const key = normalizeKey(relKey);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: data,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct public URL (assumes bucket is public or has appropriate permissions)
  const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

  return { key, url };
}

/**
 * Get a presigned URL for downloading a file from S3
 * @param relKey - The S3 key (path) for the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Object containing the key and presigned URL
 */
export async function storageGet(
  relKey: string,
  expiresIn: number = 3600
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const client = getS3Client();
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });

  return { key, url };
}
