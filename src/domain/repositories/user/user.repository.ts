import { UserReadRepository } from "./user-read.repository";
import { UserWriteRepository } from "./user-write.repository";

export interface UserRepository
  extends UserReadRepository,
    UserWriteRepository {}
