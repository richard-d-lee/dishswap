/**
 * Data API has been removed - use direct API integrations instead
 * 
 * For common data needs:
 * - YouTube: Use @googleapis/youtube npm package
 * - Twitter: Use twitter-api-v2 npm package
 * - Other APIs: Use axios or fetch with proper authentication
 */

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export async function callDataApi(
  apiId: string,
  options: DataApiCallOptions = {}
): Promise<unknown> {
  throw new Error(
    "Data API has been removed. Please use direct API integrations with npm packages like @googleapis/youtube, twitter-api-v2, etc."
  );
}
