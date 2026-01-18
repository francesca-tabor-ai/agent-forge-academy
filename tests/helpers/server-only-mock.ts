/**
 * Mock for 'server-only' module
 * 
 * This file mocks the server-only module for test environments.
 * In production, server-only throws an error when imported in client components,
 * but in tests we need to allow imports of server-only modules.
 */

// Empty export - just allows the import to succeed in tests
export {};
