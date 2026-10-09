import { jest } from '@jest/globals';
import errorHandler from '../middleware/errorHandler.js';

describe('errorHandler middleware', () => {
  test('returns the provided 4xx status and message', () => {
    const req = { method: 'POST', path: '/api/forms' };
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    errorHandler({ statusCode: 400, message: 'Invalid input' }, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input' });
    expect(next).not.toHaveBeenCalled();
  });

  test('hides internal details for server errors', () => {
    const req = { method: 'GET', path: '/api/forms' };
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      errorHandler({ status: 500, message: 'Database password leaked' }, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalledTimes(1);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('defaults to status 500 for an unspecified error status', () => {
    const req = { method: 'GET', path: '/api/forms' };
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      errorHandler(new Error('Unexpected failure'), req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('passes errors onward when response headers have already been sent', () => {
    const req = { method: 'GET', path: '/api/forms' };
    const res = {
      headersSent: true,
      status: jest.fn(),
      json: jest.fn(),
    };
    const error = new Error('Response already started');
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
