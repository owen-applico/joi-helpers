# joi-helpers
A set of helpers for Joi https://github.com/hapijs/joi

----

## Usage

```js
const Helpers = require('../');

/**
 * Joi Default Options
 *
 * @public
 */
const defaultOptions = Helpers.defaultOptions;


/**
 * anyValid Schema
 * Issue Workaround: https://github.com/hapijs/joi/issues/565
 *
 * @param schema {Joi Schema}
 * @param validsArray {Array}
 *
 * @public
 */
exports.anyValid


/**
 * Validate with Extra Things
 *
 * @param schema {Joi Schema}
 * @param data {Any}
 *
 * @public
 */
Helpers.validate


/**
 * objectId Joi Type
 *
 * @public
 */
Helpers.objectId
```


#### Run Tests

```bash
$ npm test
```
