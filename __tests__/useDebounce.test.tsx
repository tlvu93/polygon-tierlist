import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { vi } from 'vitest';

describe('useDebounce', () => {
  it('fires callback after delay', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, 100));

    act(() => {
      result.current('test');
    });

    expect(callback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(callback).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });

  it('cancels callback on unmount', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce(callback, 100));

    act(() => {
      result.current('value');
    });

    unmount();
    await vi.advanceTimersByTimeAsync(100);

    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
