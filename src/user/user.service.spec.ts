import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataBaseService } from '../database/database.service';
import { UserDto } from './dto/user.dto';
import { HttpException } from '@nestjs/common';


describe('User Service', () => {
  let user_service: UserService;

  const databaseServiceMock = {
    user: {
      findUnique: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        DataBaseService,
        {
          provide: DataBaseService,
          useValue: databaseServiceMock,
        }
      ],
    }).compile();

    user_service = module.get<UserService>(UserService);
  });

  describe('root', () => {
    it('Deve retornar sucesso na busca', async () => {
      const user: UserDto = {
        id:"3caeba63-22ef-482d-96a9-e37b940b5177",
        email:"thiago@email.com",
        name:"Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z")
      }

      databaseServiceMock.user.findUnique.mockReturnValue(user);

      const result = await user_service.find("3caeba63-22ef-482d-96a9-e37b940b5177");

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({"where": {"id": "3caeba63-22ef-482d-96a9-e37b940b5177"}});
    });

    it('Deve retornar erro na busca', async () => {
      const exception = new HttpException('User not found', 404)

      databaseServiceMock.user.findUnique.mockReturnValue(exception);

      const result = await user_service.find("3caeba63-22ef-482d-96a9-e37b940b5177");

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({"where": {"id": "3caeba63-22ef-482d-96a9-e37b940b5177"}});
    });
  });
});
