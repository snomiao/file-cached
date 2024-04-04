import type { PathLike } from "fs";
import path from "path";
import type { FileHandle } from "fs/promises";
import { readFile, writeFile, mkdir } from "fs/promises";
import { objCachedAsync } from "obj-cached";

export function FileCacheObj(file: PathLike | FileHandle) {
  return new Proxy({} as any, {
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

export function FolderCacheObj(folder: string, ext = ".json") {
  return new Proxy({} as any, {
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
  (dir: string) =>
  <Args extends unknown[], Result>(
    fn: (...args: Args) => Promise<Result> | Result
  ) =>
    objCachedAsync(fn, FolderCacheObj(dir));
