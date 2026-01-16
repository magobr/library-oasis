import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DataBaseService } from '../database/database.service';
import { AdminDto } from './dto/admin.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateAdminDto } from './dto/update-admin.dto';


describe('User Controller', () => {
    let admin_controller: AdminController;
    let admin_service: AdminService;
    let jwtService: JwtService;

    const databaseServiceMock = {
        systemAdmin: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        }
    };

    jest.mock('bcrypt', () => ({
        compare: jest.fn(),
        hash: jest.fn(),
    }));

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AdminController,
            AdminService,
            JwtService,
            DataBaseService,
            {
                provide: DataBaseService,
                useValue: databaseServiceMock,
            }
        ],
        }).compile();

        admin_controller = module.get<AdminController>(AdminController);
        admin_service = module.get<AdminService>(AdminService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('Find Admin', () => {
        it('Deve retornar sucesso na busca', async () => {
            const admin: AdminDto = {
                id:"3caeba63-22ef-482d-96a9-e37b940b5177",
                email:"admin@example.com",
                name:"Admin User",
                createdAt: new Date(),
            };
            databaseServiceMock.systemAdmin.findFirst = jest.fn().mockResolvedValue(admin);
            const result = await admin_controller.getAdmin("3caeba63-22ef-482d-96a9-e37b940b5177");
            expect(result).toEqual(admin);
        });

        it('Deve retornar erro na busca', async () => {
            databaseServiceMock.systemAdmin.findFirst = jest.fn().mockResolvedValue(null);
            const result = await admin_controller.getAdmin("3caeba63-22ef-482d-96a9-e37b940b5177");
            expect(result).toEqual(new HttpException('Admin not found', HttpStatus.NOT_FOUND));
        });

        it('Deve retornar erro de exceção na busca', async () => {
            const exception = new Error('Database error');
            databaseServiceMock.systemAdmin.findFirst = jest.fn().mockRejectedValue(exception);
            const result = await admin_controller.getAdmin("3caeba63-22ef-482d-96a9-e37b940b5177");
            expect(result).toEqual(exception);
        });
    });

    describe('Create Admin', () => {
        it('Deve retornar sucesso na criacao de admin', async () => {
            const new_admin: CreateAdminDto = {
                email:"teste@email.com",
                name:"Teste",
                password:"password123",
            };

            const response_admin: AdminDto = {
                id:"3caeba63-22ef-482d-96a9-e37b940b5177",
                email:"teste@email.com",
                name:"Teste",
                createdAt: new Date(),
            };

            databaseServiceMock.systemAdmin.create = jest.fn().mockReturnValue(response_admin);

            const result = await admin_controller.createAdmin(new_admin);

            expect(result).toEqual(response_admin);
            expect(databaseServiceMock.systemAdmin.create).toHaveBeenCalledWith({
                data: {
                    email: new_admin.email,
                    name: new_admin.name,
                    password: expect.any(String),
                }
            });
        });

        it('Deve retornar erro de excecao na criacao de admin', async () => {
            const new_admin: CreateAdminDto = {
                email:"teste@email.com",
                name:"Teste",
                password:"password123",
            };

            const exception = new Error('Database error');
            databaseServiceMock.systemAdmin.create = jest.fn().mockRejectedValue(exception);

            const result = await admin_controller.createAdmin(new_admin);

            expect(result).toEqual(exception);
        });

        it('Deve retornar erro de email ja em uso na criacao de admin', async () => {
            const new_admin: CreateAdminDto = {
                email:"<EMAIL>",
                name:"Teste",
                password:"password123",
            };

            const exception: any = new Error('Unique constraint failed on the fields: (`email`)');
            exception.code = 'P2002';
            databaseServiceMock.systemAdmin.create = jest.fn().mockRejectedValue(exception);

            try {
                await admin_controller.createAdmin(new_admin);
            } catch (error) {
                expect(error).toEqual(new HttpException('Email already in use', HttpStatus.CONFLICT));                
            }
        });
    });

    describe('Update Admin', () => {
        it('Deve retornar sucesso na atualizacao de admin', async () => {
            const admin_data = {
                name: "Teste Atualizado",
                email: "teste@teste.com"
            };

            const updated_admin_response: AdminDto = {
                id:"3caeba63-22ef-482d-96a9-e37b940b5177",
                email:"teste@email.com",
                name:"Teste Atualizado",
                createdAt: new Date(),
            };

            databaseServiceMock.systemAdmin.update = jest.fn().mockReturnValue(updated_admin_response);

            const result = await admin_controller.updateAdmin("3caeba63-22ef-482d-96a9-e37b940b5177", admin_data);

            expect(result).toEqual(updated_admin_response);
            expect(databaseServiceMock.systemAdmin.update).toHaveBeenCalledWith({
                where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" },
                data: {
                    ...admin_data
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true
                }
            });
        });

        it('Deve retornar erro de excecao na atualizacao de admin', async () => {
            const exception = new Error('Database error');
            databaseServiceMock.systemAdmin.update = jest.fn().mockRejectedValue(exception);

            const result = await admin_controller.updateAdmin("3caeba63-22ef-482d-96a9-e37b940b5177", {
                name: "Teste Atualizado",
            });

            expect(result).toEqual(exception);
        });

        it('Deve retornar erro se nao encontrar admin para atualizacao', async () => {
            const exception = new HttpException('Admin not found', HttpStatus.NOT_FOUND);

            databaseServiceMock.systemAdmin.update = jest.fn().mockRejectedValue(exception);

            const result = await admin_controller.updateAdmin("3caeba63-22ef-482d-96a9-e37b940b5177", {
                name: "Teste Atualizado",
            });

            expect(result).toEqual(exception);
        });

        it('Deve retornar erro de email ja em uso na atualizacao de admin', async () => {
            const exception: any = new Error('Unique constraint failed on the fields: (`email`)');
            exception.code = 'P2002';
            databaseServiceMock.systemAdmin.update = jest.fn().mockRejectedValue(exception);

            try {
                await admin_controller.updateAdmin("3caeba63-22ef-482d-96a9-e37b940b5177", {
                    name: "Teste Atualizado",
                    email: "teste@email.com"
                });
            } catch (error) {
                expect(error).toEqual(new HttpException('Email already in use', HttpStatus.CONFLICT));
            }
        });

        it('Deve retornar sucesso quando for atualizar senha', async () =>{
            const admin_data: UpdateAdminDto = {
                name: "Teste Atualizado",
                email: "teste@teste.com",
                password: "newpassword123"
            };

            const updated_admin_response: AdminDto = {
                id:"3caeba63-22ef-482d-96a9-e37b940b5177",
                email:"teste@email.com",
                name:"Teste Atualizado",
                createdAt: new Date(),
            };

            databaseServiceMock.systemAdmin.update = jest.fn().mockReturnValue(updated_admin_response);

            const result = await admin_controller.updateAdmin("3caeba63-22ef-482d-96a9-e37b940b5177", admin_data);

            expect(result).toEqual(updated_admin_response);
            expect(databaseServiceMock.systemAdmin.update).toHaveBeenCalledWith({
                where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" },
                data: {
                    password: expect.any(String),
                }
            });
        }); 
    });

    describe('Delete Admin', () => {
        it('Deve deletar admin com sucesso', async () => {
            const response = { message: 'Admin deleted successfully' };
            databaseServiceMock.systemAdmin.delete = jest.fn().mockResolvedValue(undefined);

            const result = await admin_controller.deleteAdmin("3caeba63-22ef-482d-96a9-e37b940b5177");

            expect(result).toEqual(response);
            expect(databaseServiceMock.systemAdmin.delete).toHaveBeenCalledWith({
                where: { id: "3caeba63-22ef-482d-96a9-e37b940b5177" }
            });
        });

        it('Deve retornar erro de excecao ao deletar admin', async () => {
            const exception = new Error('Database error');
            databaseServiceMock.systemAdmin.delete = jest.fn().mockRejectedValue(exception);

            const result = await admin_controller.deleteAdmin("3caeba63-22ef-482d-96a9-e37b940b5177");

            expect(result).toEqual(exception);
        });
    });

    describe('Authenticate Admin', () => {
        
        it('deve autenticar com sucesso e retornar access_token', async () => {
            const adminMock = {
                id: 'uuid-123',
                email: 'admin@email.com',
                name: 'Admin',
                password: 'hashed-password'
            };

            jest.spyOn(databaseServiceMock.systemAdmin, 'findFirst').mockResolvedValue(adminMock as any);

            jest.spyOn(admin_service, 'comparePassword').mockResolvedValue(true);

            jwtService.signAsync = jest.fn().mockResolvedValue('jwt-token');

            const result = await admin_controller.authAdmin({
                password: 'plain-password',
                email: adminMock.email
            });

            expect(databaseServiceMock.systemAdmin.findFirst).toHaveBeenCalledWith({
            where: { email: adminMock.email },
            select: { id: true, email: true, name: true, password: true }
            });

            expect(admin_service.comparePassword).toHaveBeenCalledWith(
            'plain-password',
            adminMock.password
            );

            expect(jwtService.signAsync).toHaveBeenCalledWith({
                id: adminMock.id,
                email: adminMock.email,
                name: adminMock.name
            });

            expect(result).toEqual({ access_token: 'jwt-token' });
        });

        it('deve retornar erro ao nao encontrar admin', async () => {
            jest.spyOn(databaseServiceMock.systemAdmin, 'findFirst').mockResolvedValue(null);

            try {
                await admin_controller.authAdmin({
                    password: 'plain-password',
                    email: 'teste@email.com'
                });
            } catch (error) {
                expect(error).toEqual(new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED));
            }
        });

        it('deve retornar erro ao senha invalida', async () => {
            const adminMock = {
                id: 'uuid-123',
                email: 'admin@email.com',
                name: 'Admin',
                password: 'hashed-password'
            };

            jest.spyOn(databaseServiceMock.systemAdmin, 'findFirst').mockResolvedValue(adminMock as any);
            jest.spyOn(admin_service, 'comparePassword').mockResolvedValue(false);

            try {
                await admin_controller.authAdmin({
                    password: 'wrong-password',
                    email: adminMock.email
                });
            } catch (error) {
                expect(error).toEqual(new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED));
            }
        })

    });
});