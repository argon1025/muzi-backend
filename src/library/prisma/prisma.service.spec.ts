import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  describe('onModuleInit', () => {
    it('모듈이 로드 된 후 prisma connect를 호출한다.', async () => {
      // given
      jest.spyOn(prismaService, '$connect').mockImplementationOnce(() => Promise.resolve());

      // when
      await prismaService.onModuleInit();

      // then
      expect(prismaService.$connect).toHaveBeenCalledTimes(1);
    });
  });
});
