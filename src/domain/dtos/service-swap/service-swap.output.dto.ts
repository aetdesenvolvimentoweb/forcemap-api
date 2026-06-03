import { Military } from "../../entities";

export type ServiceSwapOutputDTO = {
  id: string;
  substitutedMilitary: Military;
  substituteMilitary: Military;
  startsAt: string;
  endsAt: string;
};
