import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { DataBaseService } from '../database/database.service';
import { AdminDto } from './dto/admin.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';

describe('User Service', () => {
    let admin_service: AdminService;

    const databaseServiceMock = {
        systemAdmin: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AdminService,
            DataBaseService,
            {
                provide: DataBaseService,
                useValue: databaseServiceMock,
            }
        ],
        }).compile();

        admin_service = module.get<AdminService>(AdminService);
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
            const result = await admin_service.find("3caeba63-22ef-482d-96a9-e37b940b5177");
            expect(result).toEqual(admin);
        });

        it('Deve retornar erro na busca', async () => {
            databaseServiceMock.systemAdmin.findFirst = jest.fn().mockResolvedValue(null);
            const result = await admin_service.find("3caeba63-22ef-482d-96a9-e37b940b5177");
            expect(result).toEqual(new HttpException('Admin not found', HttpStatus.NOT_FOUND));
        });

        it('Deve retornar erro de exceção na busca', async () => {
            const exception = new Error('Database error');
            databaseServiceMock.systemAdmin.findFirst = jest.fn().mockRejectedValue(exception);
            const result = await admin_service.find("3caeba63-22ef-482d-96a9-e37b940b5177");
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

            const result = await admin_service.create(new_admin);

            expect(result).toEqual(response_admin);
            expect(databaseServiceMock.systemAdmin.create).toHaveBeenCalledWith({
                data: {
                    email: new_admin.email,
                    name: new_admin.name,
                    password: expect.any(String),
                }
            });
        })
    });
});