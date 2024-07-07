import { IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';

const NAME_REGEX = /^[a-zA-Z0-9\s]+$/;
const NAME_VALIDATION_MESSAGE =
  'Name must contain only alphanumeric characters and spaces';

export class SimulationNameDTO {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MinLength(8, { message: 'Name must be at least 8 characters long' })
  @MaxLength(30, { message: 'Name cannot be longer than 30 characters' })
  @Matches(NAME_REGEX, { message: NAME_VALIDATION_MESSAGE })
  name: string;
}

export class CreateOrStartNewSimulationDTO extends SimulationNameDTO {}

export class EndSimulationDTO extends SimulationNameDTO {}
