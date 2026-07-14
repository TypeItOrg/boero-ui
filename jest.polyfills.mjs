import { TextDecoder, TextEncoder } from "node:util";
import { createRequire } from "node:module";
import { ReadableStream, TransformStream, WritableStream } from "node:stream/web";

const require = createRequire(import.meta.url);

function assignGlobalIfMissing(name, value) {
  if (!globalThis[name]) {
    globalThis[name] = value;
  }
}

assignGlobalIfMissing("TextEncoder", TextEncoder);
assignGlobalIfMissing("TextDecoder", TextDecoder);
assignGlobalIfMissing("ReadableStream", ReadableStream);
assignGlobalIfMissing("WritableStream", WritableStream);
assignGlobalIfMissing("TransformStream", TransformStream);

class MessagePortMock extends EventTarget {
  onmessage = null;
  onmessageerror = null;
  #otherPort;

  setOtherPort(otherPort) {
    this.#otherPort = otherPort;
  }

  postMessage(message) {
    queueMicrotask(() => {
      if (!this.#otherPort) return;

      const event = new MessageEvent("message", { data: message });

      this.#otherPort.dispatchEvent(event);
      this.#otherPort.onmessage?.call(this.#otherPort, event);
    });
  }

  start() {}

  close() {
    this.onmessage = null;
    this.onmessageerror = null;
  }
}

class MessageChannelMock {
  constructor() {
    this.port1 = new MessagePortMock();
    this.port2 = new MessagePortMock();

    this.port1.setOtherPort(this.port2);
    this.port2.setOtherPort(this.port1);
  }
}

class BroadcastChannelMock extends EventTarget {
  onmessage = null;
  onmessageerror = null;

  constructor(name) {
    super();
    this.name = name;
  }

  postMessage(message) {
    const event = new MessageEvent("message", { data: message });

    this.dispatchEvent(event);
    this.onmessage?.call(this, event);
  }

  close() {
    this.onmessage = null;
    this.onmessageerror = null;
  }
}

assignGlobalIfMissing("MessageChannel", MessageChannelMock);
assignGlobalIfMissing("MessagePort", MessagePortMock);
assignGlobalIfMissing("BroadcastChannel", BroadcastChannelMock);

const { fetch, Headers, Request, Response } = require("undici");

assignGlobalIfMissing("fetch", fetch);
assignGlobalIfMissing("Headers", Headers);
assignGlobalIfMissing("Request", Request);
assignGlobalIfMissing("Response", Response);
