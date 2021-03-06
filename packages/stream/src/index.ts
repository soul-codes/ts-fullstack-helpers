import * as Stream from "stream";

export interface Bufferable<Chunk> {
  promiseBuffer(): Promise<Chunk[]>;
}

export interface Promisable {
  promise(): Promise<void>;
}

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

export interface Readable<Chunk> extends Bufferable<Chunk>, Promisable {
  unshift(chunk: Chunk): void;
  push(chunk: Chunk, encooding?: string): boolean;

  pipe<T extends Writable<Chunk> | Duplex<any, Chunk>>(
    destination: T,
    options?: { end?: boolean }
  ): T;

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

interface WritableOptions<Chunk> {
  highWaterMark?: number;
  decodeStrings?: boolean;
  objectMode?: boolean;
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

export interface Writable<Chunk> extends Promisable {
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
  return strict(new Stream.Readable(options as any)) as any;
}

export function writable<Chunk>(
  options: WritableOptions<Chunk>
): Writable<Chunk> {
  return strict(new Stream.Writable(options as any)) as any;
}

export function duplex<Read, Write>(
  options: DuplexOptions<Read, Write>
): Duplex<Read, Write> {
  return strict(new Stream.Duplex(options as any)) as any;
}

export function transform<In, Out>(
  options: TransformOptions<In, Out>
): Transform<In, Out> {
  return strict(new Stream.Transform(options as any)) as any;
}

export function strict<Chunk>(stream: Stream.Readable): Readable<Chunk>;
export function strict<Chunk>(stream: Stream.Writable): Writable<Chunk>;
export function strict<Read, Write>(stream: Stream.Duplex): Duplex<Read, Write>;
export function strict<In, Out>(stream: Stream.Transform): Transform<In, Out>;
export function strict(
  stream: Stream.Transform | Stream.Readable | Stream.Writable | Stream.Duplex
): Readable<any> | Writable<any> | Duplex<any, any> | Transform<any, any> {
  return Object.assign(stream, {
    promiseBuffer: () => promiseBuffer(stream as any),
    promise: () => promise(stream as any)
  }) as any;
}

export async function promiseBuffer<Chunk>(
  readable: Readable<Chunk>
): Promise<Chunk[]> {
  return new Promise<Chunk[]>((resolve, reject) => {
    const result: Chunk[] = [];
    readable.on("data", chunk => result.push(chunk));
    readable.on("end", () => {
      resolve(result);
    });
    readable.on("error", reject);
  });
}

export async function promise<
  T extends Readable<any> | Writable<any> | Duplex<any, any>
>(stream: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    stream.on("finish", () => resolve(stream));
    stream.on("error", () => reject(stream));
  });
}
