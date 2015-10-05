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
            'pt_BR' : 'Portuguese translation here',
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

For a Quick Start, step-by-step guide, have a look at the source html of the following file:

[https://github.com/darksmo/jquery-localization-tool/blob/master/demo/index.html](https://github.com/darksmo/jquery-localization-tool/blob/master/demo/index.html)

#### Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
defaultLanguage | string | en_GB | the `language_country` code the page to translate is initially in.
languages | object | {} | additional/custom language definitions
strings | object | {} | pointers to the original strings and their translations in various languages
showFlag | boolean | true | whether to show the flag on the widget
showLanguage | boolean | true | whether to show the language name on the widget
showCountry | boolean | true | whether to show the country name on the widget
onLanguageSelected | function | `function (/*langCountryCode*/) { return true; }` | a callback called as soon as the user selects the new language from the dropdown menu. Return true to trigger the translation or false to just select the language without translating.
ignoreUnmatchedSelectors | boolean | false | do not throw error if a provided selector doesn't match the html markup
labelTemplate | string | `{{country}} {{(language)}}` | a template string to interpolate with actual values for language and country. The `{{language}}` and `{{country}}` tokens will be replaced if present in the template string. Also it's possible to add prefixes/suffixes inside the curly braces, as the paretheses in the default value.

#### Methods

Method | Argument | Description
------ | -------- | -----------
translate | string (languageCode) | translates the text in the given language programmatically, if no language code is specified, the default (initial) translation is used.
destroy | None | destroys the localization tool

#### JSDoc

See index.html in docs/ directory

#### Dependencies

jQuery 1.6.4+

#### License

Copyright (c) 2014 Savio Dimatteo

Licensed under the MIT license.
