import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from './dto/user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DataBaseService } from '../database/database.service';


describe('User controller', () => {
  let user_controller: UserController;

  const databaseServiceMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserController,
        UserService,
        {
          provide: DataBaseService,
          useValue: databaseServiceMock,
        },
      ],
    }).compile();

    user_controller = module.get<UserController>(UserController);
  });

  describe('Find User', () => {

    it('Deve retornar sucesso na busca', async () => {
      const user: UserDto = {
        id:"3caeba63-22ef-482d-96a9-e37b940b5177",
        email:"thiago@email.com",
        name:"Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z")
      }

      jest.spyOn(user_controller, 'getUser').mockResolvedValue(user);

      const result = await user_controller.getUser("3caeba63-22ef-482d-96a9-e37b940b5177");

      expect(result).toEqual(user);
    });

    it('Deve retornar erro na busca', async () => {
      const exception = new HttpException('User not found', HttpStatus.NOT_FOUND)
      const result = await user_controller.getUser("3caeba63-22ef-482d-96a9-e37b940b5177");

      jest.spyOn(user_controller, 'getUser').mockRejectedValue(exception);
      
      expect(result).toEqual(exception);
    });

    it('Deve retornar erro quando o id não estiver no formato UUID', async () => {
      const exception = new HttpException('User not found', HttpStatus.INTERNAL_SERVER_ERROR)
      databaseServiceMock.user.findUnique.mockReturnValue(exception);

      const result = await user_controller.getUser("12345" as any);

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({"where": {"id": "12345"}});
    });
  });

  describe('Create User', () => {
    it('Deve criar um usuário com sucesso', async () => {
      const user: UserDto = {
        id:"3caeba63-22ef-482d-96a9-e37b940b5177",
        email:"thiago@email.com",
        name:"Thiago Novaes",
        createdAt: new Date("2026-01-12T02:16:27.546Z")
      }

      databaseServiceMock.user.create = jest.fn().mockReturnValue(user);
      const result = await user_controller.createUser({
        email: "thiago@email.com",
        name: "Thiago Novaes"
      });

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "thiago@email.com",
          name: "Thiago Novaes"
        }
      });
    });

    it('Deve retornar erro ao criar usuário com email já existente', async () => {
      const exception = new HttpException('Email already exists', HttpStatus.CONFLICT)

      databaseServiceMock.user.create = jest.fn().mockReturnValue(exception);
      const result = await user_controller.createUser({
        email: "thiago@email.com",
        name: "Thiago Novaes"
      });

      expect(result).toEqual(exception);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "thiago@email.com",
          name: "Thiago Novaes"
        }
      });
    });

    it('Deve retornar erro generico na criacao', async () => {
      const exception = new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);

      databaseServiceMock.user.create = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      try {
        await user_controller.createUser({
          email: "thiago@email.com",
          name: "Thiago Novaes"
        }); 
      } catch (error) {
        expect(error).toEqual(exception);  
      }

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "thiago@email.com",
          name: "Thiago Novaes"
        }
      });
    });
    
  });

  describe('Update User', () => {
    it('Deve retornar sucesso na atualizacao', async () => {
      const user: UserDto = {
        id:"3caeba63-22ef-482d-96a9-e37b940b5177",
        email:"teste@teste.com",
        name:"Teste Atualizado",
        createdAt: new Date("2026-01-12T02:16:27.546Z")
      }

      databaseServiceMock.user.update = jest.fn().mockReturnValue(user);
      const result = await user_controller.updateUser("3caeba63-22ef-482d-96a9-e37b940b5177", {
        name: "Teste Atualizado"
      });

      expect(result).toEqual(user);

      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        },
        data: {
          name: "Teste Atualizado"
        }
      });
    });

    it('Deve retornar erro de usuario nao encontrado na atualizacao', async () => {
      const exception = new HttpException('User not found', HttpStatus.NOT_FOUND);

      databaseServiceMock.user.update = jest.fn().mockImplementation(() => {
        const error: any = new Error();
        error.code = 'P2025';
        throw error;
      });

      try {
        await user_controller.updateUser("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado"
        }); 
      } catch (error) {
        expect(error).toEqual(exception);  
      }

      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        },
        data: {
          name: "Teste Atualizado"
        }
      });
    });

    it('Deve retornar erro generico na atualizacao', async () => {
      const exception = new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);

      databaseServiceMock.user.update = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      try {
        await user_controller.updateUser("3caeba63-22ef-482d-96a9-e37b940b5177", {
          name: "Teste Atualizado"
        }); 
      } catch (error) {
        expect(error).toEqual(exception);  
      }

      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        },
        data: {
          name: "Teste Atualizado"
        }
      });
    });
  });

  describe('Delete User', () => {
    it('Deve retornar sucesso na exclusao', async () =>{
      const returnMessage = { message: 'User deleted successfully' };

      databaseServiceMock.user.delete = jest.fn().mockReturnValue(returnMessage);
      const result = await user_controller.deleteUser("3caeba63-22ef-482d-96a9-e37b940b5177");

      expect(result).toEqual(returnMessage);

      expect(databaseServiceMock.user.delete).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        }
      });
    });

    it('Deve retornar erro por usuario nao encontrado na exclusao', async () =>{
      const returnMessage = new HttpException('User not found', HttpStatus.NOT_FOUND);

      databaseServiceMock.user.delete = jest.fn().mockImplementation(() =>{
        const error: any = new Error();
        error.code = 'P2025';
        throw error;
      });

      try {
        await user_controller.deleteUser("3caeba63-22ef-482d-96a9-e37b940b5177");  
      } catch (error) {
        expect(error).toEqual(returnMessage); 
      }
      
      expect(databaseServiceMock.user.delete).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        }
      });
    });

    it('Deve retornar erro generico na exclusao', async () =>{
      const returnMessage = new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);

      databaseServiceMock.user.delete = jest.fn().mockImplementation(() =>{
        throw new Error();
      });

      try {
        await user_controller.deleteUser("3caeba63-22ef-482d-96a9-e37b940b5177");  
      } catch (error) {
        expect(error).toEqual(returnMessage); 
      }

      expect(databaseServiceMock.user.delete).toHaveBeenCalledWith({
        where: {
          id: "3caeba63-22ef-482d-96a9-e37b940b5177",
        }
      });
    });
  })

});
