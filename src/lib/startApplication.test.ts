import { describe, expect, it, vi } from 'vitest';
import { startApplication } from './startApplication';

describe('startApplication', () => {
  it('waits for translations before rendering', async () => {
    let resolveTranslations: (() => void) | undefined;
    const translationsReady = new Promise<void>(resolve => {
      resolveTranslations = resolve;
    });
    const render = vi.fn();
    const started = startApplication(translationsReady, render);

    expect(render).not.toHaveBeenCalled();
    resolveTranslations?.();
    await started;

    expect(render).toHaveBeenCalledOnce();
  });
});
