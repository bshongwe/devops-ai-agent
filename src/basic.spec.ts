describe('Basic Tests', () => {
  it('should pass basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have test environment setup', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have Jest working', () => {
    expect(jest).toBeDefined();
    expect(typeof jest.fn).toBe('function');
  });

  it('should handle promises', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
