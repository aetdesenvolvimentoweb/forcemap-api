export interface ServiceSwapIdRegisteredValidatorProtocol {
  validate(id: string): Promise<void>;
}
