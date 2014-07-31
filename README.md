jquery.localizationTool.js
-------

[1]: <https://github.com/darksmo/jquery-localization-tool>

Simple localization dropdown for your website. Translates strings in the languages you provide. This widget is built with the single page scenario in mind. It supports right-to-left text direction when languages like Arabic are selected.

[![Build Status](https://travis-ci.org/darksmo/jquery-localization-tool.svg?branch=master)](https://travis-ci.org/darksmo/jquery-localization-tool)

#### Example

Initialize with:

```html
<div id="localizationToolbar"></div>

<div id="someId">Original string goes here</div>
```

```javascript
$("#localizationToolbar").localizationTool({
    strings : {
        'id:someId': {
            'it_IT' : 'Italian translation here',
            'de_DE' : 'German translation here',
            'fr_FR' : 'French translation here',
            'es_ES' : 'Spanish translation here',
            'en_AU' : 'Australian english translation here',
            'br_PT' : 'Portuguese translation here',
            'en_GB' : 'British english translation here',
            'jp_JP' : 'Japanese translation here',
            'ar_TN' : 'Arabic translation here',
        },
        /* ... more strings can follow */
    }
});
 ```

Destroy with:

```javascript
$("#localizationToolbar").localizationTool('destroy');
```

#### Demo

For live demos please visit the project webpage:

[http://darksmo.github.io/jquery-localization-tool/](http://darksmo.github.io/jquery-localization-tool/)

For a Quick Start have a look at the source html of the following file:

[https://github.com/darksmo/jquery-localization-tool/blob/master/demo/index.html](https://github.com/darksmo/jquery-localization-tool/blob/master/demo/index.html)

#### Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
defaultLanguage | string | en_GB | the `language_country` code the page to translate is initially in.
languages | object | {} | additional/custom language definitions
strings | object | {} | pointers to the original strings and their translations in various languages

#### Methods

Method | Argument | Description
------ | -------- | -----------
translate | string (languageCode) | translates the text in the given language programmatically
destroy | None | destroys the localization tool

#### JSDoc

See index.html in docs/ directory

#### Dependencies

jQuery 1.6.4+

#### License

Copyright (c) 2014 Savio Dimatteo

Licensed under the MIT license.
