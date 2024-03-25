import type { PathLike } from "fs";
import type { FileHandle } from "fs/promises";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

export const FileCacheObj = (file: PathLike | FileHandle) =>
  new Proxy({} as any, {
    get: (target, key: string) =>
      Promise.resolve(target[key]).then(
        (e) =>
          e ??
          readFile(file, "utf8")
            .then((e) => JSON.parse(e)[key])
            .catch(() => undefined)
      ),
    set: (target, key: string, value: any, receiver) =>
      !!Promise.resolve((target[key] = value)).then((e) =>
        writeFile(5, JSON.stringify({...e, }, null, 2))
      ),
  });
