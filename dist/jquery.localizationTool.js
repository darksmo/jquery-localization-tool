/*! Localization Tool - v0.0.1 - 2014-07-31
* http://darksmo.github.io/jquery-localization-tool/
* Copyright (c) 2014; Licensed MIT */
(function($) {

    var methods = {
        /**
         * Returns the html representation for the given language code.
         * @name _languageCodeToHtml
         * @function
         * @param {string} languageCode - the language code as defined in the settings object
         */
        '_languageCodeToHtml': function (languageCode) {
            var $this = this,
                languagesObj = $this.data('settings').languages,
                languageDefinitionObj = languagesObj[languageCode];

            var htmlClass = '';
            if (languageDefinitionObj.flag.hasOwnProperty('class')) {
                htmlClass = ' ' + languageDefinitionObj.flag['class'];
            }

            var htmlImage = '';
            if (languageDefinitionObj.flag.hasOwnProperty('url')) {
                htmlImage = '<img src="' + languageDefinitionObj.flag.url + '" />';
            }

            var languageName    = languageDefinitionObj.language;
            var languageCountry = languageDefinitionObj.country;

            return [
                '<li class="ltool-language ', languageCode, '">',
                '<div class="ltool-language-flag', htmlClass, '"></div>',
                htmlImage,
                '<span class="ltool-language-country">',languageCountry,'</span>',
                '<span class="ltool-language-name">', languageName ,'</span>',
                '</li>'
            ].join('');
        },
        /**
         * Displays the given language in the dropdown menu.
         * @name _selectLanguage
         * @function
         * @access private
         * @param {string} languageCode - the language code
         */
        '_selectLanguage': function (languageCode) {
            var $this = this;

            $this.find('.ltool-dropdown-label').html(
                $('.ltool-language.' + languageCode).html()
            );
        },
        /**
         * Initializes the localization tool widget.
         * @name _initializeWidget
         * @function
         * @access private
         */
        '_initializeWidget': function () {

            var $this = this,
                settings = $this.data('settings'),
                guaranteedLanguagesArray = methods._findSubsetOfUsedLanguages.call(
                    $this,
                    settings.strings
                ),
                languagesObj = settings.languages;
            
            var markupArray = [];

            markupArray.push('<span class="ltool-dropdown-label">Change Language</span><div class="ltool-dropdown-label-arrow"></div>');
            markupArray.push('<ul class="ltool-dropdown-items">');
            var languageCode, i;
            for (i=0;languageCode=guaranteedLanguagesArray[i++];) {

                if ( languagesObj.hasOwnProperty(languageCode)) {
                    markupArray.push(
                        methods._languageCodeToHtml.call($this, languageCode)
                    );
                }
                else {
                    $.error('The language \'' + languageCode + '\' must be defined');
                }
            }
            markupArray.push('</ul>');

            $(markupArray.join('')).appendTo($this);

            return $this;
        },
        /**
         * Handles dropdown click event.
         * @name _onDropdownClicked
         * @function
         * @access private
         */
        '_onDropdownClicked' : function (/*e*/) {
            var $this = this;

            $this.toggleClass('ltool-is-visible');
        },
        /**
         * Handles mouseout on dropdown items
         * @name _onMouseout
         * @function
         * @access private
         */
        '_onMouseout': function (e) {
            var $this = this;

            if ($this.find(e.relatedTarget).length > 0) {
                e.preventDefault();
                return $this;
            }

            $this.removeClass('ltool-is-visible');
        },
        /**
         * Handles user clicks on a certain dropdown item.
         * @name _onLanguageSelected
         * @function
         * @param {$element} $item - the jquery item clicked
         * @access private
         */
        '_onLanguageSelected': function ($item) {
            var $this = this;

            var languageCode = $item.attr('class')
                .replace('ltool-language', '')
                .replace(' ', '');

            methods._selectLanguage.call($this, languageCode);

            methods.translate.call($this, languageCode);
        },
        /**
         * Binds events to the localization tool widget.
         * @name _bindEvents
         * @function
         * @access private
         */
        '_bindEvents': function () {
            var $this = this;

            $this.bind('click.localizationTool', function (e) { 
                methods._onDropdownClicked.call($this, e);
            });
            $this.find('.ltool-language')
                .bind('click.localizationTool', function (/*e*/) {
                    methods._onLanguageSelected.call($this, $(this));
                });

            $this
                .bind('mouseout.localizationTool', function (e) { 
                    methods._onMouseout.call($this, e);
                });

            return $this;
        },
        /**
         * Analizes the input strings object and decomposes its keys in four
         * sections: text strings, id strings, class strings, element strings.
         * @name _decomposeStringsForReferenceMapping
         * @function
         * @access private
         * @returns {object} the decomposition object.
         */
        '_decomposeStringsForReferenceMapping' : function () {
            var decompositionObj = {
                'idStrings' : [],
                'classStrings' : [],
                'elementStrings' : [],
                'textStrings' : []
            };

            var $this = this,
                stringsObj = $this.data('settings').strings;

            var stringKey;
            for (stringKey in stringsObj) {
                if (stringsObj.hasOwnProperty(stringKey)) {
                    // analysis
                    if (stringKey.indexOf('id:') === 0) {
                        decompositionObj.idStrings.push(stringKey);
                    }
                    else if (stringKey.indexOf('class:') === 0) {
                        decompositionObj.classStrings.push(stringKey);
                    }
                    else if (stringKey.indexOf('element:') === 0) {
                        decompositionObj.elementStrings.push(stringKey);
                    }
                    else {
                        decompositionObj.textStrings.push(stringKey);
                    }
                }
            }

            return decompositionObj;
        },
        /**
         * Goes through each text node and builds a string reference mapping.
         * It is a mapping (an object) 
         * STRING_IDENTIFIER -> <ORIGINAL_HTML, [DOM_NODES]> 
         * used later for the translation. See init method for a
         * reference. The resulting object is stored internally in
         * $this.data('refMappingObj') as refMapping.
         * @name _buildStringReferenceMapping
         * @function
         * @access private
         */
        '_buildStringReferenceMapping': function () {

           var $this = this,
               refMapping = {},
               stringsObj = $this.data('settings').strings;

           // decompose the initial strings in various bits
           var decompositionObj = methods._decomposeStringsForReferenceMapping.call($this);

           /*
            * First go through each id
            */
           var idString, i;
           for (i=0; idString = decompositionObj.idStrings[i++];) {

               var idStringName = idString.substring('id:'.length);
               var $idNode = $('#' + idStringName);
               var contents = $idNode.contents();

               if (contents.length === 0 || contents.length > 1) {
                   $.error(idString + ' must contain exactly one text node, found ' + contents.length + ' instead');
               }
               else if (contents[0].nodeType !== 3) {
                   $.error(idString + ' does not contain a #text node (i.e., type 3)');
               }
               else {
                   // add this to the refMapping
                   refMapping[idString] = {
                       originalText : $idNode.text(),
                       domNodes : [ $idNode ]
                   };
               }
           }

           /*
            * Helper function to not write the same code over again...
            */
           var processMultipleElements = function (prefix, jqueryPrefix, checkForIds, checkForClasses) {

               var string;
               var decompositionKeyPrefix = prefix.replace(':','');
               for (i=0; string = decompositionObj[decompositionKeyPrefix + 'Strings'][i++];) {
                   
                   var stringName = string.substring(prefix.length);

                   var domNodesArray = [];
                   var domNodeText; // keeps the text of the first dom node in the loop below
                   var allNodeTextsAreEqual = true;

                   
                   var k=0, node; 
                   NODE:
                   for (; node = $(jqueryPrefix + stringName)[k++];) {

                       var $node = $(node);

                       if (checkForIds) {
                           var nodeId = $node.attr('id');
                    
                           // skip any node that was previously translated via an id
                           if (typeof nodeId === 'string' && stringsObj.hasOwnProperty('id:' + nodeId)) {
                               continue NODE;
                           }
                       }

                       if (checkForClasses) {
                           // skip any node that was previously translated via a class
                           var nodeClasses = $node.attr('class');

                           if (typeof nodeClasses === 'string') {

                               var nodeClassArray = nodeClasses.split(' '),
                                   nodeClass,
                                   j = 0;

                               for(;nodeClass = nodeClassArray[j++];) {
                                   if (typeof nodeClass === 'string' && stringsObj.hasOwnProperty('class:' + nodeClass)) {
                                       continue NODE;
                                   }
                               }
                           }
                       }

                       // make sure this node contains only one text content
                       var nodeContents = $node.contents();
                       if (nodeContents.length === 0 || nodeContents.length > 1) {
                           $.error('A \'' +  string + '\' node was found to contain ' + nodeContents.length + ' child nodes. This node must contain exactly one text node!');

                           continue;
                       }

                       if (nodeContents[0].nodeType !== 3) {
                           $.error('A \'' + string + '\' node does not contain a #text node (i.e., type 3)');

                           continue;
                       }

                       // this node is pushable at this point...
                       domNodesArray.push($node);

                       // also check the text is the same across the nodes considered
                       if (typeof domNodeText === 'undefined') {
                           // ... the first time we store the text of the node
                           domNodeText = $node.text();
                       }
                       else if (domNodeText !== $node.text()) {
                           // ... then we keep checking if the text node is the same
                           allNodeTextsAreEqual = false;
                       }

                   } // end for k loop

                   // make sure that the remaining classes contain the same text
                   if (!allNodeTextsAreEqual) {
                      $.error('Not all text content of elements with ' + string + ' were found to be \'' + domNodeText + '\'. So these elements will be ignored.');
                   }
                   else {
                       // all good
                       refMapping[string] = {
                           originalText : domNodeText,
                           domNodes : domNodesArray
                       };
                   }
               }

           }; // end of processMultipleElements


           /*
            * Then go through classes
            */
           processMultipleElements('class:', '.', true, false);

           /*
            * Then go through elements
            */
           processMultipleElements('element:', '', true, true);

           /*
            * Finally find the dom nodes associated to any text searched
            */
           var textString;

           for (i=0; textString = decompositionObj.textStrings[i++];) {
              // nodes that will contain the text to translate
              var textNodesToAdd = [];

              var allParentNodes = $(':contains(' + textString + ')');
              var k, parentNode;
              for (k=0; parentNode = allParentNodes[k++];) {
                  var nodeContents = $(parentNode).contents();
                  if (nodeContents.length === 1 &&
                      nodeContents[0].nodeType === 3) {

                      textNodesToAdd.push($(parentNode));
                  }
              }
              if (textNodesToAdd.length > 0) {
                  // all good
                  refMapping[textString] = {
                      originalText : textString,
                      domNodes : textNodesToAdd
                  };
              }
           }

           $this.data('refMappingObj', refMapping);

           return $this;
        },
        /**
         * Translates the current page.
         * @name translate
         * @function
         * @access public
         * @param {string} [languageCode] - the language to translate to.
         */
        'translate': function (languageCode) {
            var $this = this,
                settings = $this.data('settings'),
                stringsObj = settings.strings,
                refMappingObj = $this.data('refMappingObj');

            var cssDirection = 'ltr';
            if (typeof languageCode !== 'undefined') {
                // check if the language code exists actually
                if (!settings.languages.hasOwnProperty(languageCode)) {
                    $.error('The language code ' + languageCode + ' is not defined');
                    return $this;
                }

                // check if we are dealing with a right to left language
                if (settings.languages[languageCode].hasOwnProperty('cssDirection')) {

                    cssDirection = settings.languages[languageCode].cssDirection;
                }
            }

            // translate everything according to the reference mapping
            var string;
            for (string in refMappingObj) {
                if (refMappingObj.hasOwnProperty(string)) {

                    var translation;
                    if (typeof languageCode === 'undefined' || languageCode === settings.defaultLanguage) {
                        translation = refMappingObj[string].originalText;
                    }
                    else {
                        translation = stringsObj[string][languageCode];
                    }

                    var domNodes = refMappingObj[string].domNodes;
                    var $domNode, i;

                    for (i=0; $domNode = domNodes[i++];) {

                        $domNode.html(translation);

                        $domNode.css('direction', cssDirection);
                    }
                }
            }

            return $this;
        },
        /**
         * Destroys the dropdown widget.
         *
         * @name destroy
         * @function
         * @access public
         **/
        'destroy' : function () {
            var $this = this;

            // remove all data set with .data()
            $this.removeData();

            // unbind events
            $this.unbind('click.localizationTool', function (e) { 
                methods._onDropdownClicked.call($this, e);
            });
            $this.find('.ltool-language')
                .unbind('click.localizationTool', function (/*e*/) {
                    methods._onLanguageSelected.call($this, $(this));
                });

            $this
                .unbind('mouseout.localizationTool', function (e) { 
                    methods._onMouseout.call($this, e);
                });

            // remove markup
            $this.empty();

            return $this;
        },
        /**
         * Goes through each string defined and extracts the common subset of
         * languages that actually used. The default language is added to this
         * subset a priori
         *
         * @name _findSubsetOfUsedLanguages
         * @function
         * @access private
         * @param {object} stringsObj
         * @returns {array} usedLanguageCodes
         */
        '_findSubsetOfUsedLanguages' : function (stringsObj) {
            var $this = this;
            var string;

            // build an histogram of all the used languages in strings
            var usedLanguagesHistogram = {};
            var howManyDifferentStrings = 0;

            for (string in stringsObj) { 
                if (stringsObj.hasOwnProperty(string)) {

                    var languages = stringsObj[string],
                        language;

                    for (language in languages) {
                        if (languages.hasOwnProperty(language)) {
                            if (!usedLanguagesHistogram.hasOwnProperty(language)) {
                                usedLanguagesHistogram[language] = 0;
                            }
                        }
                        usedLanguagesHistogram[language]++;
                    }

                    howManyDifferentStrings++;
                }
            }

            // find languages that are guaranteed to appear in all strings
            var guaranteedLanguages = [],
                languageCode;

            for (languageCode in usedLanguagesHistogram) {
                if (usedLanguagesHistogram.hasOwnProperty(languageCode) &&
                    usedLanguagesHistogram[languageCode] === howManyDifferentStrings
                ) {

                    guaranteedLanguages.push(languageCode);
                }
            }

            // add the default language
            guaranteedLanguages.unshift($this.data('settings').defaultLanguage);

            return guaranteedLanguages;
        },
        /**
         * Initialises the localization tool plugin.
         * @name init
         * @function
         * @param {object} [options] - the user options
         * @access public
         * @returns jqueryObject
         */
        'init' : function(options) {
            var knownLanguages = {
                'en_GB' : {
                    'country' : 'United Kingdom',
                    'language': 'English',
                    'countryTranslated' : 'United Kingdom',
                    'languageTranslated': 'English',
                    'flag': {
                        'class' : 'flag flag-gb'
                    }
                },
                'de_DE' : {
                    'country' : 'Germany',
                    'language' : 'German',
                    'countryTranslated' : 'Deutschland',
                    'languageTranslated' : 'Deutsch',
                    'flag' : {
                        'class' : 'flag flag-de'
                    }
                },
                'es_ES' : {
                    'country' : 'Spain',
                    'language' : 'Spanish',
                    'countryTranslated': 'España',
                    'languageTranslated' : 'Español',
                    'flag' : {
                        'class' : 'flag flag-es'
                    }
                },
                'fr_FR' : {
                    'country' : 'France',
                    'language' : 'French',
                    'countryTranslated' : 'France',
                    'languageTranslated' : 'Français',
                    'flag' : {
                        'class' : 'flag flag-fr'
                    }
                },
                'br_PT' : {
                    'country' : 'Brazil',
                    'language' : 'Portuguese',
                    'countryTranslated': 'Brasil',
                    'languageTranslated' : 'Português',
                    'flag' : {
                        'class' : 'flag flag-br'
                    }
                },
                'en_AU' : {
                    'country' : 'Australia',
                    'language' : 'English',
                    'countryTranslated' : 'Australia',
                    'languageTranslated' : 'English',
                    'flag' : {
                        'class' : 'flag flag-au'
                    }
                },
                'it_IT' : {
                    'country' : 'Italy',
                    'language': 'Italian',
                    'countryTranslated': 'Italia',
                    'languageTranslated': 'Italiano',
                    'flag' : {
                        'class' : 'flag flag-it'
                    }
                },
                'jp_JP' : {
                    'country' : 'Japan',
                    'language': 'Japanese',
                    'countryTranslated': '日本',
                    'languageTranslated': '日本語',
                    'flag' : {
                        'class' : 'flag flag-jp'
                    }
                },
                'ar_TN' : {
                    'country' : 'Tunisia',
                    'language' : 'Arabic',
                    'countryTranslated': 'تونس',
                    'languageTranslated': 'عربي',
                    'cssDirection': 'rtl',
                    'flag' : {
                        'class' : 'flag flag-tn'
                    }
                }
            };

            var settings = $.extend({
                'defaultLanguage' : 'en_GB',
                'languages' : {
                    /*
                     * The format here is <country code>_<language code>.
                     * - list of country codes: http://www.gnu.org/software/gettext/manual/html_node/Country-Codes.html
                     * - list of language codes: http://www.gnu.org/software/gettext/manual/html_node/Usual-Language-Codes.html#Usual-Language-Codes
                     */
                },
                /*
                 * Strings are provided by the user of the plugin. Each entry
                 * in the dictionary has the form:
                 *
                 * [STRING_IDENTIFIER] : {
                 *      [LANGUAGE] : [TRANSLATION]
                 * }
                 *
                 * STRING_IDENTIFIER:
                 *     id:<html-id-name>           OR
                 *     class:<html-class-name>     OR
                 *     element:<html-element-name> OR
                 *     <string>
                 *
                 * LANGUAGE: one of the languages defined above (e.g., it_IT)
                 *
                 * TRANSLATION: <string>
                 *
                 */
                'strings' : {}
            }, options);

            // add more languages
            settings.languages = $.extend(knownLanguages, settings.languages);

            // check that the default language is defined
            if (!settings.languages.hasOwnProperty(settings.defaultLanguage)) {
                $.error('FATAL: the default language ' + settings.defaultLanguage + ' is not defined in the \'languages\' parameter!');
            }

            return this.each(function() {
                // save settings
                var $this = $(this);

                $this.data('settings', settings);

                methods._initializeWidget.call($this);
                methods._selectLanguage.call($this, settings.defaultLanguage);
                methods._bindEvents.call($this);
                methods._buildStringReferenceMapping.call($this);
            });
        }
    };

    var __name__ = 'localizationTool';

    /**
     * jQuery Localization Tool - a jQuery widget to translate web pages
     *
     * @memberOf jQuery.fn
     */
    $.fn[__name__] = function(method) {
        /*
         * Just a router for method calls
         */
        if (methods[method]) {
            if (this.data('initialized') === true) {
                // call a method
                return methods[method].apply(this,
                    Array.prototype.slice.call(arguments, 1)
                );
            }
            else {
                throw new Error('method ' + method + ' called on an uninitialized instance of ' + __name__);
            }
        }
        else if (typeof method === 'object' || !method) {
            // call init, user passed the settings as parameters
            this.data('initialized', true);
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Cannot call method ' + method);
        }
    };
})(jQuery);
