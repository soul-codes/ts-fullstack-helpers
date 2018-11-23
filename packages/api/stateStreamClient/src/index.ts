export interface StateStreamOptions {
  reconnectInterval?: number | ((numFailedAttempts: number) => number);
}

export type StateStreamEvent<Data> =
  | {
      type: "data";
      data: Data;
    }
  | { type: "status"; status: "up" | "down" };

export default class StateStream<Data> {
  constructor(
    readonly url: string,
    readonly listener: (ev: StateStreamEvent<Data>) => void,
    readonly options: StateStreamOptions = {}
  ) {
    this._tryConnect();
  }

  destroy() {
    this._status = "destroyed";
    this._currentWebSocket && this._currentWebSocket.close();
  }

  /**
   * Force reconnection to the state stream server. If an ongoing connection is
   * happening, it is stopped and started again.
   */
  forceReconnect() {
    return this._tryConnect();
  }

  /**
   * Get the connection promise at the next successful or failed connection
   * attempt if the stream is currently initializing or down. The promise
   * immediately resolves to false when if the stream is destroyed, and resolves
   * to true if the stream is up and running.
   */
  get promise() {
    if (this._status === "down" || this._status === "init") {
      return this._promise;
    }
    return Promise.resolve(this._status === "up");
  }

  private _tryConnect() {
    let newWebSocketInstance: WebSocket;

    if (this._currentWebSocket) {
      try {
        this._currentWebSocket.close();
      } catch (error) {
        // ignore
      }
    }

    let resolve: (success?: boolean) => void;
    this._promise = new Promise<boolean>(r => (resolve = r));

    try {
      newWebSocketInstance = new WebSocket(this.url);
    } catch (error) {
      return void this._handleDown();
    }

    this._currentWebSocket = newWebSocketInstance;
    newWebSocketInstance.onmessage = ev => {
      if (this._status !== "up") {
        resolve(true);
        this._status = "up";
        (this.listener || null)({ type: "status", status: "up" });
      }
      const data = JSON.parse(ev.data.toString()) as Data;
      (this.listener || null)({ type: "data", data });
    };

    newWebSocketInstance.onclose = () => {
      resolve(false);
      this._handleDown();
    };
  }

  private _handleDown() {
    if (this._status !== "destroyed" && this._currentWebSocket) {
      const didJustGoDown = this._status !== "down";
      this._status = "down";

      if (didJustGoDown) {
        this._retryCount = 0;
      }
      const retryIntervalSettings =
        this.options.reconnectInterval || defaultReconnectInterval;
      const retryInterval =
        typeof retryIntervalSettings === "number"
          ? retryIntervalSettings
          : retryIntervalSettings(this._retryCount);

      setTimeout(() => {
        if (this._status === "down") {
          this._retryCount++;
          this._tryConnect();
        }
      }, retryInterval);

      if (didJustGoDown) {
        this.listener({ type: "status", status: "down" });
      }
    }
  }

  private _currentWebSocket?: WebSocket;
  private _status?: "init" | "up" | "down" | "destroyed" = "init";
  private _retryCount = 0;
  private _promise: Promise<boolean> | null = null;
}

function defaultReconnectInterval(numFailedAttempts: number) {
  const result = numFailedAttempts * 1000;
  return result > 15000 ? 15000 : result;
}
