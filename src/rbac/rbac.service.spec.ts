import { RbacService } from './rbac.service';
import { HttpException } from '@nestjs/common';

describe('RbacService', () => {
    let service: RbacService;
    let mockDatabase: any;
    let mockJwt: any;

    beforeEach(() => {
        mockDatabase = {
            roleTypes: {
                create: jest.fn(),
                findFirst: jest.fn(),
            },
            roles: {
                create: jest.fn(),
                update: jest.fn(),
                findFirst: jest.fn(),
            },
        };

        mockJwt = {
            verify: jest.fn(),
        };

        service = new RbacService(mockDatabase as any, mockJwt as any);
    });

    describe('insertRole', () => {
        it('Deve inserir tipo de papel e papéis com sucesso', async () => {
            const tokenPayload = { id: 'admin-id' };
            mockJwt.verify.mockReturnValue(tokenPayload);
            mockDatabase.roles.findFirst.mockResolvedValue(null);
            mockDatabase.roleTypes.create.mockResolvedValue({ id: 'rt-id' });
            mockDatabase.roles.create.mockResolvedValue({ id: 'r-id' });

            const dto = {
                role_type: 'admin',
                roles: { create: true, read: true, update: true, delete: false },
            };

            const result = await service.insertRole(dto as any, 'token');
            expect(result).toEqual({
                message: 'Role type and roles inserted successfully',
                role_type: 'rt-id',
                roles: 'r-id',
            });
            expect(mockDatabase.roleTypes.create).toHaveBeenCalled();
            expect(mockDatabase.roles.create).toHaveBeenCalled();
        });

        it('Deve lançar erro quando admin já possui um papel', async () => {
            mockJwt.verify.mockReturnValue({ id: 'admin-id' });
            mockDatabase.roles.findFirst.mockResolvedValue({ id: 'existing' });

            await expect(
                service.insertRole(
                    { role_type: 'x', roles: { create: true, read: true, update: true, delete: true } } as any,
                    'token',
                ),
            ).rejects.toThrow('Admin already has a role');
        });

        it('should wrap invalid token into Bad Request via catch', async () => {
            mockJwt.verify.mockImplementation(() => { throw new Error('bad'); });
            await expect(service.insertRole({} as any, 'bad-token')).rejects.toThrow('Invalid or expired token');
        });
    });

    describe('getUserRoles', () => {
        it('Deve retornar tipo de papel para admin', async () => {
            mockJwt.verify.mockReturnValue({ id: 'admin-id' });
            const roleType = { id: 'rt1', type: 'admin', create: true, read: true, update: false, delete: false };
            mockDatabase.roleTypes.findFirst.mockResolvedValue(roleType);

            const res = await service.getUserRoles('token');
            expect(res).toEqual(roleType);
        });

        it('Deve lançar erro quando não há papéis encontrados', async () => {
            mockJwt.verify.mockReturnValue({ id: 'admin-id' });
            mockDatabase.roleTypes.findFirst.mockResolvedValue(null);

            await expect(service.getUserRoles('token')).rejects.toThrow('No roles found for this admin');
        });
    });

    describe('updateRoeles', () => {
        it('Deve atualizar papéis com sucesso', async () => {
            mockJwt.verify.mockReturnValue({ id: 'admin-id' });
            mockDatabase.roles.findFirst.mockResolvedValue({ id: 'rel-id' });
            mockDatabase.roles.update.mockResolvedValue({ id: 'new-role-id' });

            const dto = { role_type: 'new', roles: { create: false, read: true, update: true, delete: false } };

            const res = await service.updateRoeles(dto as any, 'token');
            expect(res).toEqual({
                message: 'Role type and roles inserted successfully',
                roles: 'new-role-id',
            });
            expect(mockDatabase.roles.update).toHaveBeenCalled();
        });

        it('Deve lançar erro quando admin não possui papéis', async () => {
            mockJwt.verify.mockReturnValue({ id: 'admin-id' });
            mockDatabase.roles.findFirst.mockResolvedValue(null);

            await expect(
                service.updateRoeles({ role_type: 'x', roles: { create: true, read: true, update: true, delete: true } } as any, 'token'),
            ).rejects.toThrow('No roles found for this admin');
        });
    });

    describe('verifyRoles', () => {
        it('Deve retornar relação de papéis quando encontrada', async () => {
            mockDatabase.roles.findFirst.mockResolvedValue({ id: 'role-rel' });
            const res = await service.verifyRoles('admin-id' as any);
            expect(res).toEqual({ id: 'role-rel' });
        });

        it('Deve retornar null quando nenhuma relação encontrada', async () => {
            mockDatabase.roles.findFirst.mockResolvedValue(null);
            const res = await service.verifyRoles('admin-id' as any);
            expect(res).toBeNull();
        });
    });

    describe('verifyTokenSync', () => {
        it('Deve lançar erro quando o token é inválido ou expirado', () => {
            mockJwt.verify.mockImplementation(() => { throw new Error('expired'); });
            expect(() => service.verifyTokenSync('bad')).toThrow('Invalid or expired token');
        });

        it('Deve retornar payload quando a verificação do JWT é bem-sucedida', () => {
            const payload = { id: 'id', email: 'e' };
            mockJwt.verify.mockReturnValue(payload);
            expect(service.verifyTokenSync('token')).toEqual(payload);
        });
    });
});