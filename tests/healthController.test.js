const HealthController = require('../src/controllers/healthController');

describe('HealthController', () => {
  describe('getBasicHealth', () => {
    it('should return basic health status', () => {
      const req = {};
      const res = {
        json: jest.fn(),
      };

      HealthController.getBasicHealth(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          service: 'startup-multi-service-api',
        })
      );
    });
  });
});
