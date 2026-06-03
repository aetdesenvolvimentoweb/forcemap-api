import { Military } from "./military.entity";

export type ServiceSwap = {
  id: string;
  substitutedMilitaryId: string;
  substituteMilitaryId: string;
  substitutedMilitary?: Military;
  substituteMilitary?: Military;
  startsAt: string;
  endsAt: string;
};
