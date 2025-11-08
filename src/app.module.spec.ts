import 'reflect-metadata';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof AppModule).toBe('function');
  });

  it('should have proper module metadata', () => {
    const metadata = Reflect.getMetadata('imports', AppModule);
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
  });
});
