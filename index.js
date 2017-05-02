
'use strict';


/**
 * Module dependencies.
 * @private
 */
const _ = require('lodash'),
  ObjectID = require('mongodb').ObjectId,
  extend = require('extend'),
  Joi = require('joi');

/**
 * Constants
 * @private
 */
const maxIntValues = {
  tinyint: 255,
  smallint: 65535,
  mediumint: 16777215,
  int: 4294967295,
  integer: 4294967295,
  bigint: 18446744073709551615
};


/**
 * Joi Default Options
 *
 * @public
 */
exports.defaultOptions = {

  abortEarly: false,
  convert: true,
  allowUnknown: true,
  stripUnknown: true,
  skipFunctions: true,
  language: {
    any: {
      required: '{{key}} is required.',
      empty: '{{key}} is required.',
      allowOnly: '{{key}} must be one of {{valids}}.',
      // allowOnly: 'Only specific values are allowed for {{key}}.'
    },
    object: {
      'min': '{{key}} must have at least {{limit}} children.'
    },
    string: {
      'base': '{{key}} is invalid.',
      'min': '{{key}} must be at least {{limit}} characters long.',
      'email': '{{key}} is invalid.'
      // 'guid': 'Only specific values are allowed for {{key}}.'
    },
    date: {
      base: '{{key}} is not a valid date.',
      iso: '{{key}} is not a valid ISO 8601 date.',
    },
    boolean: {
      base: '{{key}} is not a valid boolean.',
    },
    number: {
      base: '{{key}} is not a valid number.',
      integer: '{{key}} is not a valid integer.',
    },
    array: {
      unique: '{{key}} contains a duplicate item.',
      length: '{{key}} must contain {{limit}} items.',
      min: '{{key}} must contain at least {{limit}} items.'
    }
  }
};


/**
 * Compile Joi
 *
 * @public
 */
exports.compile = schema => {

  // If Already a Joi Object,
  // Deep Extend with Schema's Custom Language
  const opts = extend(true, {},
    exports.defaultOptions,
    {
      language: (schema._settings && schema._settings.language)
        ? schema._settings.language
        : undefined
    });

  return Joi.compile(schema).options(opts);

  // if (schema.isJoi) {
  //   return Joi.compile(schema).options({ language: opts.language });
  // }

  // else {
  //   return Joi.compile(schema).options(opts);
  // }
};


/**
 * Validate with Extra Things
 *
 * @param schema {Joi Schema}
 * @param data {Any}
 *
 * @public
 */
exports.validate = (schema, data) => {

  const result = schema.validate(data);

  // Validation Passed
  if (result.error === null) return result;

  // Dedupe Errors
  result.error = _.uniqBy(result.error.details, 'message');
  return result;
};


/**
 * anyValid Schema
 * Issue Workaround: https://github.com/hapijs/joi/issues/565
 *
 * @param schema {Joi Schema}
 * @param validsArray {Array}
 *
 * @public
 */
exports.anyValid = (schema, validsArray) => {

  return schema
  .regex(new RegExp('^('+validsArray.join('|')+')$'))
  .options({
    language: {
      string: {
        regex: {
          base: '{{key}} must be one of [' + validsArray.join(', ') +'].'
        }
      }
    }
  });
};

/**
 * objectId Joi Type
 *
 * @public
 */
exports.objectId = () => {

  return Joi.alternatives()
    .try(
      Joi.object().type(ObjectID),
      Joi.string().trim().regex(/^[0-9a-fA-F]{24}$/)
    )
    .options({
      language: {
        object: {
          base: '{{key}} is not a valid id.',
          type: '{{key}} is not a valid id.'
        },
        string: {
          base: '{{key}} is not a valid id.',
          regex: {
            base: '{{key}} is not a valid id.'
          }
        },
        any: {
          empty: '{{key}} is not a valid id.'
        }
      }
    });
};


/**
 * SQL Schema - Compile Joi
 *
 * @public
 */
exports.sqlSchemaCompile = sqlSchema => {

  const keys = {};

  _.forEach(sqlSchema, (item, key) => {

    // Lowercase type
    const type = item.type.toLowerCase();

    switch(type) {
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'int':
      case 'integer':
      case 'bigint':
        keys[key] = Joi.number().integer()
                       .min(-1*(((maxIntValues[type] - 1)/2) + 1))
                       .max(maxIntValues[type]);
        break;

      case 'float':
      case 'double':
      case 'real':
      case 'numeric':
      case 'decimal':
        keys[key] = Joi.number();
        break;

      case 'boolean':
      case 'bit':
        keys[key] = Joi.boolean();
        break;

      case 'char':
      case 'varchar':
      case 'text':
      case 'tinytext':
      case 'enum':
        keys[key] = Joi.string().trim();
        if (typeof item.maxLength !== 'undefined') {
          keys[key] = keys[key].max(Number(item.maxLength));
        }
        break;

      case 'datetime':
      case 'date':
      // case 'timestamp':
        keys[key] = Joi.date().iso();
        break;

      default:
        keys[key] = Joi.any();
    };

    // Account for Nullable
    if (item.nullable === false) {
      keys[key] = keys[key].invalid(null).required();
    }
    else {
      keys[key] = keys[key].allow(null);
    }

    // Account for Default Value
    if (item.defaultValue !== null &&
        (typeof defaultValue === 'boolean' ||
         typeof defaultValue === 'number' ||
         typeof defaultValue === 'string' ||
         typeof defaultValue === 'object')) {
      keys[key] = keys[key].default(item.defaultValue);
    }
  });

  // Compile the Schema
  return exports.compile(Joi.object().keys(keys));
};
