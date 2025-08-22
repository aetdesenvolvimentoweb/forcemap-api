export const createMilitaryRankRepositoryMock = () => ({
  findByAbbreviation: jest.fn(),
  findByOrder: jest.fn(),
  create: jest.fn(),
});
