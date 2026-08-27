const HealthController = require('../src/controllers/healthController');

describe('HealthController', () => {
  describe('getBasicHealth', () => {
    it('should return basic health status', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      HealthController.getBasicHealth({}, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 'healthy',
        week: 3,
      });
    });
  });
});