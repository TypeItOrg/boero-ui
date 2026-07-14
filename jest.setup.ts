import "@testing-library/jest-dom";

class ResizeObserverMock implements ResizeObserver {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}

  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
}

if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserverMock;
}

if (!global.PointerEvent) {
  global.PointerEvent = MouseEvent as typeof PointerEvent;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = jest.fn();
}
