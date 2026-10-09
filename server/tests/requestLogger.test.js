import { jest } from '@jest/globals';
import { EventEmitter } from 'node:events';
import requestLogger from '../middleware/requestLogger.js';

describe('requestLogger middleware', () => {
  test('logs request details when the response finishes', () => {
    const req = { method: 'GET', path: '/api/forms' };
    const res = new EventEmitter();
    res.statusCode = 200;
    const next = jest.fn();
    const originalConsoleLog = console.log;
    console.log = jest.fn();

    try {
      requestLogger(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(console.log).not.toHaveBeenCalled();

      res.emit('finish');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/api/forms',
          statusCode: 200,
          durationMs: expect.any(Number),
        })
      );
    } finally {
      console.log = originalConsoleLog;
    }
  });

  test('calls next to continue the request', () => {
    const req = { method: 'POST', path: '/api/forms' };
    const res = new EventEmitter();
    res.statusCode = 201;
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
