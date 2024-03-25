# file-cached

cache your results promises in a json file

## Usage Example

```typescript
import { FileCacheObj } from "file-cached"
import { objCachedAsync } from "obj-cached"

const cacheObj = FileCacheObj(import.meta.dir + '/cache.json')

const result = await objCachedAsync(async () => {
    // do sth heavy
}, cacheObj)()

```
