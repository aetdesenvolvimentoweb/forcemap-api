import { ServiceSwapRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import { ServiceSwapIdRegisteredValidatorProtocol } from "../../protocols";

interface ServiceSwapIdRegisteredValidatorProps {
  serviceSwapRepository: ServiceSwapRepository;
}

export class ServiceSwapIdRegisteredValidator
  implements ServiceSwapIdRegisteredValidatorProtocol
{
  constructor(private readonly props: ServiceSwapIdRegisteredValidatorProps) {}

  validate = async (id: string): Promise<void> => {
    const { serviceSwapRepository } = this.props;
    const serviceSwap = await serviceSwapRepository.findById(id);

    if (!serviceSwap) {
      throw new EntityNotFoundError("Troca de Serviço");
    }
  };
}
