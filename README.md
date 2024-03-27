# file-cached

Simply cache your object in ./cache.json file.

## Usage Example

### with obj-cached

```typescript
import { FileCacheObj } from "file-cached";
import { objCachedAsync } from "obj-cached";

const cacheObj = FileCacheObj(import.meta.dir + "/cache.json");

const result = await objCachedAsync(async () => {
  // do sth heavy
}, cacheObj)();
```

### standalone

```typescript
import { FileCacheObj } from "file-cached";

const cacheObj = FileCacheObj(import.meta.dir + "/cache.json");

console.log(cacheObj["abc"]); // undefined
// "./cache.json" not existed

cacheObj["abc"] = 123;
// "./cache.json" = {abc: 123}

console.log(cacheObj["abc"]); // 123

cacheObj["def"] = "456";
// "./cache.json" = {abc: 123, def: "456"}

console.log(cacheObj["def"]); // 456
```
