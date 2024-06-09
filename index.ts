import type { PathLike } from "fs";
import path from "path";
import type { FileHandle } from "fs/promises";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import { objCachedAsync } from "obj-cached";
import { F } from "rambda";
import curry from "just-curry-it";

// default cache obj
const FILE_CACHED = Symbol("FILE_CACHCED");
type g = Global & { [FILE_CACHED]: Map<PathLike, any> };
(global as Global as g)[FILE_CACHED] = new Map();

/**
 * @param file
 * @param ttl time to live in ms
 * @param fn
 * @returns cached function
 */
export const cachedInFile = curry(async function cachedInFile<
  Args extends any[],
  R
>(
  {
    file,
    /** could be yaml */
    stringify = (s) => JSON.stringify(s, null, 2),
    parse = (s) => JSON.parse(s),
    ttl,
  }: {
    file: PathLike;
    ttl?: number;
    stringify?: (data: R) => string;
    parse?: (s: string) => R;
  },
  fn: (...args: Args) => Promise<R> | R
) {
  return async (...args: Args) => {
    const mtime = (await stat(file)).mtime;
    const isOutdated = ttl && +Date.now() - +mtime > ttl;
    const cached = isOutdated
      ? null
      : await readFile(file, "utf8")
          .then((e) => parse(e))
          .catch(() => undefined);
    if (cached) return cached;

    const result = await fn(...args);
    await writeFile(file, stringify(result));
    return result;
  };
});

export function FileCacheObj(
  file: PathLike | FileHandle,
  { baseObj = {} as any } = {}
) {
  return new Proxy(baseObj, {
    get: async (target, key: string) => {
      const value = target[key];
      if (value) return value;
      return readFile(file, "utf8")
        .then((e) => JSON.parse(e)[key])
        .catch(() => undefined);
    },
    set: (target, key: string, value) => {
      target[key] = value;
      console.log({ target });
      writeFile(file, JSON.stringify(target, null, 2));
      return true;
    },
  });
}

export function FolderCacheObj(
  folder: string,
  { ext = ".json", baseObj = {} as any } = {}
) {
  return new Proxy(baseObj, {
    get: async (target, key: string) => {
      const value = target[key];
      if (value) return value;
      const file = path.join(folder, key + ext);
      return readFile(file, "utf8")
        .then((e) => JSON.parse(e))
        .catch(() => undefined);
    },
    set: (target, key: string, value) => {
      target[key] = value;
      const file = path.join(folder, key + ext);
      mkdir(folder, { recursive: true }).then(() =>
        writeFile(file, JSON.stringify(value, null, 2))
      );
      return true;
    },
  });
}

export const FolderCached =
  (folder: string, { ext = ".json", baseObj = {} as any } = {}) =>
  <Args extends unknown[], Result>(
    fn: (...args: Args) => Promise<Result> | Result
  ) =>
    objCachedAsync(fn, FolderCacheObj(folder, { ext, baseObj }));
