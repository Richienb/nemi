# Nemi

Archiving made simple for NodeJS.

```js
const { Nemi } = require("nemi");
const zip = new Nemi("myzip.zip");

zip.add("myfile.txt");
zip.close();
```
