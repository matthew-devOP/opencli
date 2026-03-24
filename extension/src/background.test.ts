import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Listener<T extends (...args: any[]) => void> = { addListener: (fn: T) => void };

type MockTab = {
  id: number;
  windowId: number;
  url?: string;
  title?: string;
  active?: boolean;
  status?: string;
};

class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(_url: string) {}
  send(_data: string): void {}
  close(): void {
    this.onclose?.();
  }
}

function createChromeMock() {
  let nextTabId = 10;
  const tabs: MockTab[] = [
    { id: 1, windowId: 1, url: 'https://automation.example', title: 'automation', active: true, status: 'complete' },
    { id: 2, windowId: 2, url: 'https://user.example', title: 'user', active: true, status: 'complete' },
    { id: 3, windowId: 1, url: 'chrome://extensions', title: 'chrome', active: false, status: 'complete' },
  ];

  const query = vi.fn(async (queryInfo: { windowId?: number } = {}) => {
    return tabs.filter((tab) => queryInfo.windowId === undefined || tab.windowId === queryInfo.windowId);
  });
  const create = vi.fn(async ({ windowId, url, active }: { windowId?: number; url?: string; active?: boolean }) => {
    const tab: MockTab = {
      id: nextTabId++,
      windowId: windowId ?? 999,
      url,
      title: url ?? 'blank',
      active: !!active,
      status: 'complete',
    };
    tabs.push(tab);
    return tab;
  });
  const update = vi.fn(async (tabId: number, updates: { active?: boolean; url?: string }) => {
    const tab = tabs.find((entry) => entry.id === tabId);
    if (!tab) throw new Error(`Unknown tab ${tabId}`);
    if (updates.active !== undefined) tab.active = updates.active;
    if (updates.url !== undefined) tab.url = updates.url;
    return tab;
  });

  const chrome = {
    tabs: {
      query,
      create,
      update,
      remove: vi.fn(async (_tabId: number) => {}),
      get: vi.fn(async (tabId: number) => {
        const tab = tabs.find((entry) => entry.id === tabId);
        if (!tab) throw new Error(`Unknown tab ${tabId}`);
        return tab;
      }),
      onUpdated: { addListener: vi.fn(), removeListener: vi.fn() } as Listener<(id: number, info: chrome.tabs.TabChangeInfo) => void>,
    },
    windows: {
      get: vi.fn(async (windowId: number) => ({ id: windowId })),
      create: vi.fn(async ({ url, focused, width, height, type }: any) => ({ id: 1, url, focused, width, height, type })),
      remove: vi.fn(async (_windowId: number) => {}),
      onRemoved: { addListener: vi.fn() } as Listener<(windowId: number) => void>,
    },
    alarms: {
      create: vi.fn(),
      onAlarm: { addListener: vi.fn() } as Listener<(alarm: { name: string }) => void>,
    },
    runtime: {
      onInstalled: { addListener: vi.fn() } as Listener<() => void>,
      onStartup: { addListener: vi.fn() } as Listener<() => void>,
    },
    cookies: {
      getAll: vi.fn(async () => []),
    },
  };

  return { chrome, tabs, query, create, update };
}

describe('background tab isolation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('lists only automation-window web tabs', async () => {
    const { chrome } = createChromeMock();
    vi.stubGlobal('chrome', chrome);

    const mod = await import('./background');
    mod.__test__.setAutomationWindowId('site:twitter', 1);

    const result = await mod.__test__.handleTabs({ id: '1', action: 'tabs', op: 'list', workspace: 'site:twitter' }, 'site:twitter');

    expect(result.ok).toBe(true);
    expect(result.data).toEqual([
      {
        index: 0,
        tabId: 1,
        url: 'https://automation.example',
        title: 'automation',
        active: true,
      },
    ]);
  });

  it('creates new tabs inside the automation window', async () => {
    const { chrome, create } = createChromeMock();
    vi.stubGlobal('chrome', chrome);

    const mod = await import('./background');
    mod.__test__.setAutomationWindowId('site:twitter', 1);

    const result = await mod.__test__.handleTabs({ id: '2', action: 'tabs', op: 'new', url: 'https://new.example', workspace: 'site:twitter' }, 'site:twitter');

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalledWith({ windowId: 1, url: 'https://new.example', active: true });
  });

  it('treats normalized same-url navigate as already complete', async () => {
    const { chrome, tabs, update } = createChromeMock();
    tabs[0].url = 'https://www.bilibili.com/';
    tabs[0].title = 'bilibili';
    tabs[0].status = 'complete';
    vi.stubGlobal('chrome', chrome);

    const mod = await import('./background');
    mod.__test__.setAutomationWindowId('site:bilibili', 1);

    const result = await mod.__test__.handleNavigate(
      { id: 'same-url', action: 'navigate', url: 'https://www.bilibili.com', workspace: 'site:bilibili' },
      'site:bilibili',
    );

    expect(result).toEqual({
      id: 'same-url',
      ok: true,
      data: {
        title: 'bilibili',
        url: 'https://www.bilibili.com/',
        tabId: 1,
        timedOut: false,
      },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('reports sessions per workspace', async () => {
    const { chrome } = createChromeMock();
    vi.stubGlobal('chrome', chrome);

    const mod = await import('./background');
    mod.__test__.setAutomationWindowId('site:twitter', 1);
    mod.__test__.setAutomationWindowId('site:zhihu', 2);

    const result = await mod.__test__.handleSessions({ id: '3', action: 'sessions' });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ workspace: 'site:twitter', windowId: 1 }),
      expect.objectContaining({ workspace: 'site:zhihu', windowId: 2 }),
    ]));
  });
});

describe('normalizeUrlForComparison', () => {
  let normalize: ((url?: string) => string) | undefined;

  beforeEach(async () => {
    const mod = await import('./background');
    normalize = mod.__test__.normalizeUrlForComparison;
  });

  it('removes hash fragments', () => {
    expect(normalize!('https://example.com#section')).toBe('https://example.com/');
    expect(normalize!('https://example.com/path#anchor')).toBe('https://example.com/path');
  });

  it('removes trailing slashes from non-root paths', () => {
    expect(normalize!('https://example.com/path/')).toBe('https://example.com/path');
    expect(normalize!('https://example.com/path///')).toBe('https://example.com/path');
  });

  it('keeps root slash for root path', () => {
    expect(normalize!('https://example.com/')).toBe('https://example.com/');
    expect(normalize!('https://example.com')).toBe('https://example.com/');
  });

  it('removes default ports', () => {
    expect(normalize!('https://example.com:443/')).toBe('https://example.com/');
    expect(normalize!('http://example.com:80/')).toBe('http://example.com/');
    expect(normalize!('https://example.com:8443/')).toBe('https://example.com:8443/');
  });

  it('preserves search params', () => {
    expect(normalize!('https://example.com?q=test')).toBe('https://example.com/?q=test');
    expect(normalize!('https://example.com/path?a=1&b=2#top')).toBe('https://example.com/path?a=1&b=2');
  });

  it('handles non-standard URLs (fallback)', () => {
    expect(normalize!('data:text/html,<html></html>')).toBe('data:text/html,<html></html>');
    expect(normalize!('chrome://extensions')).toBe('chrome://extensions');
    expect(normalize!('about:blank#foo')).toBe('about:blank');
  });

  it('returns empty string for empty input', () => {
    expect(normalize!('')).toBe('');
    expect(normalize!(undefined)).toBe('');
  });
});

describe('isTargetUrl', () => {
  let isTarget: ((currentUrl: string | undefined, targetUrl: string) => boolean) | undefined;

  beforeEach(async () => {
    const mod = await import('./background');
    isTarget = mod.__test__.isTargetUrl;
  });

  it('compares URLs with different trailing slashes', () => {
    expect(isTarget!('https://example.com/', 'https://example.com')).toBe(true);
    expect(isTarget!('https://example.com/path/', 'https://example.com/path')).toBe(true);
  });

  it('compares URLs with different hash fragments', () => {
    expect(isTarget!('https://example.com#section', 'https://example.com')).toBe(true);
    expect(isTarget!('https://example.com/', 'https://example.com#top')).toBe(true);
  });

  it('compares URLs with default ports', () => {
    expect(isTarget!('https://example.com:443/', 'https://example.com')).toBe(true);
    expect(isTarget!('http://example.com:80/', 'http://example.com')).toBe(true);
  });

  it('returns false for different URLs', () => {
    expect(isTarget('https://example.com', 'https://other.com')).toBe(false);
    expect(isTarget('https://example.com/path', 'https://example.com/other')).toBe(false);
  });

  it('preserves search params in comparison', () => {
    expect(isTarget('https://example.com?q=1', 'https://example.com?q=2')).toBe(false);
    expect(isTarget('https://example.com?q=test', 'https://example.com?q=test')).toBe(true);
  });
});
