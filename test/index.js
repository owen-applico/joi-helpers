
const Joi = require('joi'),
  ObjectID = require('mongodb').ObjectID,
  test = require('ava');


const Helpers = require('../');


test.cb('Options', t => {

  const opts = Helpers.defaultOptions;
  t.ok(typeof opts === 'object');
  t.ok(opts.language);

  t.end();
  // console.log(opts);
});

test.cb('anyValid', t => {

  const anyValid = Helpers.anyValid;
  const schema = Joi.string().trim().lowercase().label('Gender');
  const GENDER = ['male', 'female', 'other'];

  // Create New Schema
  const newSchema = anyValid(schema, GENDER);
  var Result;

  t.ok(typeof newSchema === 'object');
  t.ok(newSchema.isJoi);

  // Test #1
  Result = newSchema.validate('ssss ');
  t.ok(Result.error.details[0].message === 'Gender must be one of [male, female, other].');

  // Test #2
  Result = newSchema.validate('Male ');
  t.ok(Result.error === null);
  t.ok(Result.value === 'male');

  // Test #2
  Result = newSchema.validate('female');
  t.ok(Result.error === null);
  t.ok(Result.value === 'female');

  t.end();
  // console.log(Result);
});

test.cb('validate', t => {

  const schema = Joi.string().trim().lowercase().label('Name');
  var Result;

  // Test #1
  Result = Helpers.validate(schema, 'Karan ');
  t.ok(Result.error === null);
  t.ok(Result.value === 'karan');

  t.end();
  // console.log(Result);
});

test.cb('objectId', t => {

  const schema = Helpers.objectId();
  var Result;

  // Test #1
  Result = Helpers.validate(schema,'Karan ');
  t.ok(Result.error);
  t.ok(Result.error.length === 1);

  // Test #2
  Result = Helpers.validate(schema,'56883c825a03cb66533a1781');
  t.ok(Result.error === null);
  t.ok(Result.value === '56883c825a03cb66533a1781');

  // Test #3
  Result = Helpers.validate(schema, ObjectID('56883c825a03cb66533a1781'));
  t.ok(Result.error === null);
  t.ok(Result.value instanceof ObjectID);

  t.end();
  // console.log(Result);
});

test.cb('sqlSchemaCompile', t => {

  const sqlSchema = {
    a:
     { defaultValue: null,
       type: 'smallint',
       maxLength: null,
       nullable: false },
    b:
     { defaultValue: null,
       type: 'varchar',
       maxLength: 5,
       nullable: false },
    e: {
       defaultValue: '0',
       type: 'enum',
       maxLength: 1,
       nullable: true },
    f:
     { defaultValue: null,
       type: 'datetime',
       maxLength: null,
       nullable: true },
    g:
     { defaultValue: null,
       type: 'float',
       maxLength: null,
       nullable: true }
  };

  var Schema = Helpers.sqlSchemaCompile(sqlSchema);
  var Result;

  // // Test #1
  t.ok(typeof Schema === 'object');
  t.ok(Schema.isJoi);

  // Test #2
  Result = Helpers.validate(Schema, {});
  t.ok(Result.error.length === 2);

  // Test #3
  Result = Helpers.validate(Schema, {
    a: 12312312312,
    b: 'blah',
    g: 123
  });
  t.ok(Result.error.length === 1);

  // Test #4
  Result = Helpers.validate(Schema, {
    a: 1312.22,
    b: 'blah',
    g: 123
  });
  t.ok(Result.error.length === 1);

  // Test #5
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abc',
    g: 123.22222
  });
  t.ok(Result.error === null);
  t.ok(Result.value.g === 123.22222);

  // Test #6
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abcsssss',
  });
  t.ok(Result.error.length === 1);

  // Test #7
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abc',
    f: 'sdfsd'
  });
  t.ok(Result.error.length === 1);

  // Test #8
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abc',
    f: new Date()
  });
  t.ok(Result.value.f);

  // Test #8
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abc',
    f: '2010-08-09'
  });
  t.ok(Result.value.f);

  // Test #9
  Result = Helpers.validate(Schema, {
    a: 123,
    b: 'abc',
    f: '2009-03-24 16:36:42'
  });
  t.ok(Result.value.f);

  t.end();
  console.log(Result);
});
