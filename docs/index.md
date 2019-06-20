---
layout: default
---

# About

[![Build Status](https://travis-ci.org/42BV/jarb-final-form.svg?branch=master)](https://travis-ci.org/42BV/jarb-final-form)
[![Codecov](https://codecov.io/gh/42BV/jarb-final-form/branch/master/graph/badge.svg)](https://codecov.io/gh/42BV/jarb-final-form)

[JaRB](http://www.jarbframework.org/) JaRB aims to improve database 
usage in Java enterprise applications. With JaRB you can get the
validation rules from the database into Java. With this project
you can get those rules into your [react-final-form](https://github.com/final-form/react-final-form) powered
forms as well.

# Installation

`npm install jarb-final-form --save`

# Preparation

First in your Java project make sure jarb-final-form can read
the constraints, via a GET request. This is easily done by 
exposing the `BeanConstraintController` like so:

```java
package nl._42.seeder;

import nl._42.jarb.constraint.EnableDatabaseConstraints;

import nl._42.jarb.constraint.metadata.BeanConstraintController;
import nl._42.jarb.constraint.metadata.BeanConstraintService;

@SpringBootApplication
@EnableDatabaseConstraints(basePackageClasses = Application.class)
public class Application extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public BeanConstraintController beanConstraintController(BeanConstraintService beanConstraintService) {
        return new BeanConstraintController(beanConstraintService);
    }
}

```

# Getting started.

At the start of your project, in case you are using Create React
App in the index.js, configure the constraints:

```js
import { configureConstraint } from 'jarb-final-form';

configureConstraint({
   // The URL which will provide the constraints over a GET request.
  constraintsUrl: '/api/constraints',

  // Whether or not the 'constraintsUrl' should be called with authentication.
  needsAuthentication: true,
});
```

The constraints module must be configured before the application
is rendered.

Finally you will have load the constraints from the back-end using
the `loadConstraints` function. If in order for the constraints
to be loaded you need to be logged in, you should load the constraints
as soon as you know that you are logged in:

```js
import { loadConstraints } from 'jarb-final-form';
import { login } from 'somewhere';

class Login extends Component {
  doLogin(username, password) {
    login({ username, password })
      .then(loadConstraints); // Load constraints ASAP
  }

  render() {
    // Render here which calls doLogin
  }
}
```

If you do not need a login before you can fetch the constraints
simply fetch them using `loadConstraints` as soon as possible.

# Usage

## Using JarbField

If you read the documentation of the final-form libary you will know
that you will need the `Field` Component to render form elements. This
library simply extends `Field` by adding JaRB validation rules to it.

This abstraction is called `JarbField`. JarbField wrappes 
final-form's Field, and adds the auto validation from the 
ConstraintsStore. In fact it is a very thin wrapper around
Field.

It only demands one extra property called 'jarb' which is used
to to configure the Field. The 'jarb' object needs two keys:
the 'validator' and the 'label'. 

The 'validator' follows the following format: {Entity}.{Property}. 
For example if the validator property is 'SuperHero.name' this means that
the Field will apply the constraints for the 'name' property of
the 'SuperHero' entity.
 
The 'label' is used to inform you which field was wrong, when errors occur.
You will receive the 'label' when an error occurs to create a nice
error message.

For example:

```jsx
<JarbField 
  name="Name" 
  jarb={% raw %}{{ validator: 'SuperHero.name', label: "Name" }}{% endraw %}
  component="input" 
  type="text"
/>
```

## Displaying erors

Rendering the validation errors is completely up to you.

The way it works is as follows, whenever an error occurs
the `error` prop of the Field's `meta` data will contain
an an array of objects.

For example this object could be included in that array:

```js
{
  // The type of error which occured
  "type": "ERROR_MINIMUM_LENGTH",
  // The label of the JarbField
  "label": "Description",
  // The value that the field possesed at the time of the error
  "value": '',
  // The reason why the error occured.
  "reasons": { "minimumLength": 3 }
}
``` 

Now you could create an Error Component to render the errors:

```js
import { ValidationError } from 'jarb-final-form';
import React, { Component } from 'react';

interface Props {
  meta: {
    invalid: boolean,
    error: ValidationError,
    touched: boolean
  }
}

export default function Error(props: Props) {
  render() {
    const { invalid, error, touched } = props.meta;

    if (invalid && touched) {
      return <span className="error">{ errorMessage(error) }</span>;
    }

    return null;
  }
};

// Render a nice message based on each ValidationType.
function errorMessage(error: ValidationError): string {
  switch(error.type) {
    case 'ERROR_REQUIRED':
      return `${ error.label } is required`;
    case 'ERROR_MINIMUM_LENGTH':
      return `${ error.label } must be bigger than ${ error.reasons.minimumLength } characters`;
    case 'ERROR_MAXIMUM_LENGTH':
      return `${ error.label } must be smaller than ${ error.reasons.maximumLength } characters`;
    case 'ERROR_MIN_VALUE':
      return `${ error.label } must be more than ${ error.reasons.minValue }`;
    case 'ERROR_MAX_VALUE':
      return `${ error.label } must be less than ${ error.reasons.maxValue }`;
    case 'ERROR_NUMBER':
      return `${ error.label } is not a number matching pattern: ${error.reasons.regex}`;
    case 'ERROR_NUMBER_FRACTION':
      return `${ error.label } is not a number machthing pattern: ${error.reasons.regex}`;
    default:
     return 'UNKNOWN_ERROR';
  }
}
```

Here are examples of all errors which can occur:

```js
{
  "type": "ERROR_REQUIRED",
  "label": "Name",
  "value": '',
  "reasons": { "required": "required" }
}

{
  "type": "ERROR_MINIMUM_LENGTH",
  "label": "Description",
  "value": '',
  "reasons": { "minimumLength": 3 }
}

{
  "type": "ERROR_MAXIMUM_LENGTH",
  "label": "Info",
  "value": 'aaaa',
  "reasons": { "maximumLength": 3 }
}

{
  "type": "ERROR_MIN_VALUE",
  "label": "Age",
  "value": 1,
  "reasons": { "minValue": 15 }
}

{
  "type": "ERROR_MAX_VALUE",
  "label": "Amount",
  "value": 16,
  "reasons": { "maxValue": 15 }
}

{
  "type": "ERROR_NUMBER",
  "label": "Telephone",
  "value": 'noot',
  "reasons": { "regex": /^-?\d+$/ }
}

{
  "type": "ERROR_NUMBER_FRACTION",
  "label": "Telephone",
  "value": 'noot',
  "reasons": { "regex": /^-?\d+$/, "fractionLength": 1 }
}
```
