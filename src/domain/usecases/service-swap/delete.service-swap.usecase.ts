export interface DeleteServiceSwapUseCase {
  delete(id: string): Promise<void>;
}
