import * as Stream from "stream";

interface ReadableOptions<Chunk> {
  highWaterMark?: number;
  encoding?: string;
  objectMode?: boolean;
  read?(this: Readable<Chunk>, size: number): void;
  destroy?(
    this: Readable<Chunk>,
    error: Error | null,
    callback: (error: Error | null) => void
  ): void;
}

export interface Readable<Chunk> {
  unshift(chunk: Chunk): void;
  push(chunk: Chunk | null, encooding?: string): boolean;

  pipe<T extends Writable<Chunk>>(
    destination: T,
    options?: { end?: boolean }
  ): T;
  chain<ChainedChunk>(
    destination: Duplex<ChainedChunk, Chunk>
  ): Duplex<ChainedChunk, Chunk>;

  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (chunk: Chunk) => void): this;
  addListener(event: "end", listener: () => void): this;
  addListener(event: "readable", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  emit(event: "close"): boolean;
  emit(event: "data", chunk: Chunk): boolean;
  emit(event: "end"): boolean;
  emit(event: "readable"): boolean;
  emit(event: "error", err: Error): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (chunk: Chunk) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (chunk: Chunk) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (chunk: Chunk) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (chunk: Chunk) => void): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (chunk: Chunk) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
}

interface WritableOptions<Chunk> extends Stream.WritableOptions {
  write?(
    this: Writable<Chunk>,
    chunk: Chunk,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void;
  writev?(
    this: Writable<Chunk>,
    chunks: Array<{ chunk: Chunk; encoding: string }>,
    callback: (error?: Error | null) => void
  ): void;
  destroy?(
    this: Writable<Chunk>,
    error: Error | null,
    callback: (error: Error | null) => void
  ): void;
  final?(this: Writable<Chunk>, callback: (error?: Error | null) => void): void;
}

export interface Writable<Chunk> {
  write(chunk: Chunk, cb?: (error: Error | null | undefined) => void): boolean;
  write(
    chunk: Chunk,
    encoding?: string,
    cb?: (error: Error | null | undefined) => void
  ): boolean;

  end(cb?: () => void): void;
  end(chunk: Chunk, cb?: () => void): void;
  end(chunk: Chunk, encoding?: string, cb?: () => void): void;

  addListener(event: "close", listener: () => void): this;
  addListener(event: "drain", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: "finish", listener: () => void): this;
  addListener(event: "pipe", listener: (src: Readable<Chunk>) => void): this;
  addListener(event: "unpipe", listener: (src: Readable<Chunk>) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  emit(event: "close"): boolean;
  emit(event: "drain"): boolean;
  emit(event: "error", err: Error): boolean;
  emit(event: "finish"): boolean;
  emit(event: "pipe", src: Readable<Chunk>): boolean;
  emit(event: "unpipe", src: Readable<Chunk>): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;

  on(event: "close", listener: () => void): this;
  on(event: "drain", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "finish", listener: () => void): this;
  on(event: "pipe", listener: (src: Readable<Chunk>) => void): this;
  on(event: "unpipe", listener: (src: Readable<Chunk>) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "drain", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: "finish", listener: () => void): this;
  once(event: "pipe", listener: (src: Readable<Chunk>) => void): this;
  once(event: "unpipe", listener: (src: Readable<Chunk>) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "drain", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: "finish", listener: () => void): this;
  prependListener(
    event: "pipe",
    listener: (src: Readable<Chunk>) => void
  ): this;
  prependListener(
    event: "unpipe",
    listener: (src: Readable<Chunk>) => void
  ): this;
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "drain", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: "finish", listener: () => void): this;
  prependOnceListener(
    event: "pipe",
    listener: (src: Readable<Chunk>) => void
  ): this;
  prependOnceListener(
    event: "unpipe",
    listener: (src: Readable<Chunk>) => void
  ): this;
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "drain", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: "finish", listener: () => void): this;
  removeListener(event: "pipe", listener: (src: Readable<Chunk>) => void): this;
  removeListener(
    event: "unpipe",
    listener: (src: Readable<Chunk>) => void
  ): this;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
}

interface DuplexOptions<Read, Write> {
  allowHalfOpen?: boolean;
  readableObjectMode?: boolean;
  writableObjectMode?: boolean;
  read?(this: Duplex<Read, Write>, size: number): void;
  write?(
    this: Duplex<Read, Write>,
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void;
  writev?(
    this: Duplex<Read, Write>,
    chunks: Array<{ chunk: any; encoding: string }>,
    callback: (error?: Error | null) => void
  ): void;
  final?(
    this: Duplex<Read, Write>,
    callback: (error?: Error | null) => void
  ): void;
  destroy?(
    this: Duplex<Read, Write>,
    error: Error | null,
    callback: (error: Error | null) => void
  ): void;
}

export type Duplex<Read, Write> = Readable<Read> & Writable<Write>;

type TransformCallback = (error?: Error, data?: any) => void;

interface TransformOptions<In, Out> extends DuplexOptions<Out, In> {
  transform?(
    this: Transform<In, Out>,
    chunk: In,
    encoding: string,
    callback: TransformCallback
  ): void;
  flush?(this: Transform<In, Out>, callback: TransformCallback): void;
}

export interface Transform<In, Out> extends Duplex<Out, In> {}

export function readable<Chunk>(
  options: ReadableOptions<Chunk>
): Readable<Chunk> {
  return new Stream.Readable(options as any) as any;
}

export function writable<Chunk>(
  options: WritableOptions<Chunk>
): Writable<Chunk> {
  return new Stream.Writable(options as any) as any;
}

export function duplex<Read, Write>(
  options: DuplexOptions<Read, Write>
): Duplex<Read, Write> {
  return createChain(new Stream.Duplex(options as any));
}

export function transform<In, Out>(
  options: TransformOptions<In, Out>
): Transform<In, Out> {
  return createChain(new Stream.Transform(options as any));
}

export function strict<Chunk>(stream: Stream.Readable): Readable<Chunk>;
export function strict<Chunk>(stream: Stream.Writable): Writable<Chunk>;
export function strict<Read, Write>(stream: Stream.Duplex): Duplex<Read, Write>;
export function strict<In, Out>(stream: Stream.Transform): Transform<In, Out>;
export function strict(
  stream: any
): Readable<any> | Writable<any> | Duplex<any, any> | Transform<any, any> {
  return createChain(stream);
}

function createChain(stream: Stream.Duplex): any {
  (stream as any).chain = (dest: Stream.Writable) => {
    const proxy = new Stream.PassThrough();
    let chained: Stream;
    proxy.on("pipe", (upstream: Stream.Readable) => {
      upstream.unpipe(proxy);
      chained = upstream.pipe(stream).pipe(dest);
    });
    proxy.pipe = function(dest, options) {
      return chained.pipe(
        dest,
        options
      );
    };
    return proxy;
  };
  return stream;
}
