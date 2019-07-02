export class AzureMapError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}
