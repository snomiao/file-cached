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
export function cachedInFile<Args extends any[], R>(
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
  return async function (...args: Args) {
    const stats = await stat(file).catch(() => null);

    if (stats) {
      const mtime = stats.mtime;
      const isOutdated = ttl && +Date.now() - +mtime > ttl;
      const cached = isOutdated
        ? null
        : await readFile(file, "utf8")
            .then((e) => parse(e) as R)
            .catch(() => undefined);
      if (cached) return cached;
    }
    const result = await fn(...args);
    await writeFile(file, stringify(result));
    return result;
  };
}
