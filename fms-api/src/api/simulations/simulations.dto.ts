import { IsNotEmpty } from 'class-validator';

export class CreateOrStartNewSimulationDTO {
  @IsNotEmpty()
  name: string;
}
