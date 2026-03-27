import { describe, it, expect } from 'vitest';
import { waitForCaptureJs, waitForSelectorJs } from './dom-helpers.js';

describe('waitForCaptureJs', () => {
  it('returns a non-empty string', () => {
    const code = waitForCaptureJs(1000);
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
    expect(code).toContain('__opencli_xhr');
    expect(code).toContain('resolve');
    expect(code).toContain('reject');
  });

  it('resolves "captured" when __opencli_xhr is populated before deadline', async () => {
    const g = globalThis as any;
    g.__opencli_xhr = [];
    g.window = g; // stub window for Node eval
    const code = waitForCaptureJs(1000);
    const promise = eval(code) as Promise<string>;
    g.__opencli_xhr.push({ data: 'test' });
    await expect(promise).resolves.toBe('captured');
    delete g.__opencli_xhr;
    delete g.window;
  });

  it('rejects when __opencli_xhr stays empty past deadline', async () => {
    const g = globalThis as any;
    g.__opencli_xhr = [];
    g.window = g;
    const code = waitForCaptureJs(50); // 50ms timeout
    const promise = eval(code) as Promise<string>;
    await expect(promise).rejects.toThrow('No network capture within 0.05s');
    delete g.__opencli_xhr;
    delete g.window;
  });

  it('resolves immediately when __opencli_xhr already has data', async () => {
    const g = globalThis as any;
    g.__opencli_xhr = [{ data: 'already here' }];
    g.window = g;
    const code = waitForCaptureJs(1000);
    await expect(eval(code) as Promise<string>).resolves.toBe('captured');
    delete g.__opencli_xhr;
    delete g.window;
  });
});

describe('waitForSelectorJs', () => {
  it('returns a non-empty string', () => {
    const code = waitForSelectorJs('#app', 1000);
    expect(typeof code).toBe('string');
    expect(code).toContain('#app');
    expect(code).toContain('querySelector');
  });

  it('rejects when document.querySelector returns null within timeout', async () => {
    const g = globalThis as any;
    g.document = { querySelector: (_: string) => null };
    const code = waitForSelectorJs('#missing', 50);
    await expect(eval(code) as Promise<string>).rejects.toThrow('Selector not found: #missing');
    delete g.document;
  });

  it('resolves "found" when document.querySelector returns an element', async () => {
    const g = globalThis as any;
    const fakeEl = { tagName: 'DIV' };
    g.document = { querySelector: (_: string) => fakeEl };
    const code = waitForSelectorJs('[data-testid="primaryColumn"]', 1000);
    await expect(eval(code) as Promise<string>).resolves.toBe('found');
    delete g.document;
  });
});
