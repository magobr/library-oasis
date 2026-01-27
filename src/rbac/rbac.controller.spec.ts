import { RbacController } from './rbac.controller';

describe('RbacController', () => {
    let controller: RbacController;
    let mockService: {
        insertRole: jest.Mock;
        getUserRoles: jest.Mock;
        updateRoeles: jest.Mock;
    };

    beforeEach(() => {
        mockService = {
            insertRole: jest.fn(),
            getUserRoles: jest.fn(),
            updateRoeles: jest.fn(),
        } as any;
        controller = new RbacController(mockService as any);
    });

    it('insertRole deve chamar rbacService.insertRole com role_types e a parte do token após "Bearer"', () => {
        const roleTypes = { name: 'editor' };
        mockService.insertRole.mockReturnValue({ ok: true });
        const adminHeader = 'Bearer abc.def.ghi';

        const result = controller.insertRole(roleTypes as any, adminHeader);

        expect(mockService.insertRole).toHaveBeenCalledWith(roleTypes, 'abc.def.ghi');
        expect(result).toEqual({ ok: true });
    });

    it('getUserRoles deve chamar rbacService.getUserRoles com a parte do token após "Bearer"', () => {
        mockService.getUserRoles.mockReturnValue(['role1', 'role2']);
        const adminHeader = 'Bearer token123';

        const result = controller.getUserRoles(adminHeader);

        expect(mockService.getUserRoles).toHaveBeenCalledWith('token123');
        expect(result).toEqual(['role1', 'role2']);
    });

    it('updateRoles deve chamar rbacService.updateRoeles (typo) com role_types e a parte do token após "Bearer "', () => {
        const updateDto = { roles: ['a'] };
        mockService.updateRoeles.mockReturnValue({ updated: true });
        const adminHeader = 'Bearer upd.token';

        const result = controller.updateRoles(updateDto as any, adminHeader);

        expect(mockService.updateRoeles).toHaveBeenCalledWith(updateDto, 'upd.token');
        expect(result).toEqual({ updated: true });
    });

    it('os métodos devem passar token undefined quando a string admin não contém "Bearer"', () => {
        const roleTypes = { name: 'x' };
        mockService.insertRole.mockReturnValue('r1');
        mockService.getUserRoles.mockReturnValue('r2');
        mockService.updateRoeles.mockReturnValue('r3');

        const noBearer = 'no-bearer-header';

        controller.insertRole(roleTypes as any, noBearer);
        controller.getUserRoles(noBearer);
        controller.updateRoles(roleTypes as any, noBearer);

        expect(mockService.insertRole).toHaveBeenCalledWith(roleTypes, undefined);
        expect(mockService.getUserRoles).toHaveBeenCalledWith(undefined);
        expect(mockService.updateRoeles).toHaveBeenCalledWith(roleTypes, undefined);
    });
});