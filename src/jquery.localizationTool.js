/**
 * @fileOverview Contains the code for jQuery.localizationTool
 *
 * @author Savio Dimatteo <darksmo@gmail.com>
 */

(function($) {
    var _keyboardPressed = false;

    var methods = {
        /**
         * Returns the ordinal number corresponding to the given language code,
         * or throws in case the given language code is not defined.
         * NOTE: this method operates on the active languages, therefore
         * $this.data('activeLanguageCodeArray') must be available when the
         * method is called.
         *
         * @name _languageCodeToOrdinal
         * @function
         * @access private
         * @param {string} lanuageCode - the language code to convert to ordinal
         * @returns {number} ordinal - the converted ordinal
         */
        '_languageCodeToOrdinal' : function (languageCode) {
            var $this = this,
                activeLanguageCodes = $this.data('activeLanguageCodeArray');

            var ordinal = $.inArray(languageCode, activeLanguageCodes);

            if (ordinal === -1) {
                $.error('Cannot convert ' + languageCode + ' into an ordinal number');
            }

            return ordinal;
        },
        /**
         * Returns the language code corresponding to the given ordinal number.
         * It throws in case the given ordinal number does not correspond to any
         * language code.
         * NOTE: this method operates on the active languages, therefore
         * $this.data('activeLanguageCodeArray') must be available when the
         * method is called.
         *
         * @name _ordinalToLanguageCode
         * @function
         * @access private
         * @param {number} ordinal - the ordinal number to convert into a language code
         * @returns {string} languageCode - the converted language code
         */
        '_ordinalToLanguageCode' : function (ordinal) {
            var $this = this,
                activeLanguageCodes = $this.data('activeLanguageCodeArray');

            if (activeLanguageCodes.length <= ordinal || ordinal < 0) {
                $.error('Cannot convert ' + ordinal + ' into a language code.');
            }

            return activeLanguageCodes[ordinal];
        },
        /**
         * Returns the html representation for the given language code.
         * @name _languageCodeToHtml
         * @function
         * @param {string} languageCode - the language code as defined in the settings object
         */
        '_languageCodeToHtml': function (languageCode) {
            var $this = this,
                settings = $this.data('settings'),
                languagesObj = settings.languages,
                languageDefinitionObj = languagesObj[languageCode];

            var htmlClass = '';
            if (languageDefinitionObj.flag.hasOwnProperty('class')) {
                htmlClass = ' ' + languageDefinitionObj.flag['class'];
            }

            var htmlImage = '';
            if (languageDefinitionObj.flag.hasOwnProperty('url')) {
                htmlImage = '<img src="' + languageDefinitionObj.flag.url + '" />';
            }

            var languageName = languageDefinitionObj.language;
            var haveCountry = languageDefinitionObj.hasOwnProperty('country');

            /*
             * Build up the html
             */
            var html = [];

            html.push('<li class="ltool-language ', languageCode, '">');

            if (settings.showFlag) {
                html.push(
                    '<div class="ltool-language-flag', htmlClass, '"></div>'
                );
                html.push(
                    htmlImage
                );
            }

            var interpolatedTemplate = methods._interpolateTemplate.call($this,
                haveCountry ? languageDefinitionObj.country : undefined,
                languageName
            );
            html.push(interpolatedTemplate);
            html.push('</li>');

            return html.join('');
        },
        /**
         * Interpolates the given country name and language name to the
         * labelTemplate specified in the settings.
         *
         * @param {string} countryName
         *   the country name
         * @param {string} languageName
         *   the language name
         *
         * @returns {string}
         *   the interpolated template
         */
        _interpolateTemplate: function (countryName, languageName) {
            var $this = this,
                settings = $this.data('settings'),
                template = settings.labelTemplate,
                countryReplacement = '',
                languageReplacement = '',
                haveCountry = typeof countryName === 'string';

            if (settings.showCountry && haveCountry) {
                countryReplacement = [
                    '<span class="ltool-language-country">',
                    '$1' + countryName.replace(/[$]/g, '&#36;') + '$2',
                    '</span>'
                ].join('');
            }
            if (settings.showLanguage) {
                var hasCountryClass = haveCountry ? 'ltool-has-country ' : "";
                languageReplacement = [
                    '<span class="', hasCountryClass, 'ltool-language-name">',
                    '$1' + languageName.replace(/[$]/g, '&#36;') + '$2' ,
                    '</span>'
                ].join('');
            }

            return '<span class="ltool-language-countryname">' +
                    template
                        .replace(/{{([^{]*)language([^}]*)}}/g, languageReplacement)
                        .replace(/{{([^{]*)country([^}]*)}}/g, countryReplacement) +
                '</span>';
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

            $this.data('selectedLanguageCode', languageCode);
        },
        /**
         * Initializes the localization tool widget.
         * @name _initializeWidget
         * @function
         * @access private
         * @param {array} languageCodeArray - the language code array of the languages to be displayed
         */
        '_initializeWidget': function (languageCodeArray) {

            var $this = this,
                settings = $this.data('settings'),
                languagesObj = settings.languages;

            var markupArray = [];

            markupArray.push('<span tabindex="0" class="ltool-dropdown-label">Change Language</span><div class="ltool-dropdown-label-arrow"></div>');
            markupArray.push('<ul class="ltool-dropdown-items">');
            var languageCode, i;
            for (i=0;languageCode=languageCodeArray[i++];) {

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

            var selectedLanguageCode = $this.data('selectedLanguageCode');

            $this.find('.ltool-language').removeClass('ltool-is-selected');
            $this.find('.' + selectedLanguageCode).addClass('ltool-is-selected');

            $this.toggleClass('ltool-is-visible');

            return $this;
        },
        '_closeDropdown' : function () {
            var $this = this;

            $this.removeClass('ltool-is-visible');
        },
        /**
         * Handles mouseout on dropdown items.
         * @name _onMouseout
         * @function
         * @access private
         */
        '_onMouseout': function (e) {
            var $this = this;

            if ($this.find(e.relatedTarget).length > 0) {
                // get rid of the current selected item!
                $this.find('.ltool-is-selected')
                    .removeClass('ltool-is-selected');

                // we will be over an element of ours
                e.preventDefault();
                return $this;
            }

            /* We will be over another element that doesn't belong to us */
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

            // extract language code from the $item
            var languageCode = $item.attr('class')
                .replace('ltool-language', '')
                .replace('ltool-is-selected', '')
                .replace(/ /g, '');

            methods._selectLanguage.call($this, languageCode);
            methods._mayTranslate.call($this, languageCode);
        },
        /**
         * Select the language before the current language in the list.
         * @name _selectPreviousLanguage
         * @function
         * @access private
         */
        '_selectPreviousLanguage' : function () {
            var $this = this;

            var currentLanguageCode = $this.data('selectedLanguageCode');
            var currentLanguageCodeOrdinal = methods._languageCodeToOrdinal.call($this, currentLanguageCode);

            if (currentLanguageCodeOrdinal === 0) {
                return;  // cannot go before the first language
            }

            var nextLanguageCode = methods._ordinalToLanguageCode.call($this, currentLanguageCodeOrdinal-1);

            // peform the selection
            $this.find('.ltool-is-selected').removeClass('ltool-is-selected');
            methods._selectLanguage.call($this, nextLanguageCode);
            methods._mayTranslate.call($this, nextLanguageCode);
            $this.find('.' + nextLanguageCode).addClass('ltool-is-selected');

            return $this;
        },
        /**
         * Select the language after the current language in the list.
         * @name _selectPreviousLanguage
         * @function
         * @access private
         */
        '_selectNextLanguage' : function () {
            var $this = this,
                activeLanguageCodes = $this.data('activeLanguageCodeArray');

            var currentLanguageCode = $this.data('selectedLanguageCode');
            var currentLanguageCodeOrdinal = methods._languageCodeToOrdinal.call($this, currentLanguageCode);

            if (currentLanguageCodeOrdinal + 1 >= activeLanguageCodes.length) {
                return;
            }

            var nextLanguageCode = methods._ordinalToLanguageCode.call($this, currentLanguageCodeOrdinal+1);

            // peform the selection
            $this.find('.ltool-is-selected').removeClass('ltool-is-selected');
            methods._selectLanguage.call($this, nextLanguageCode);
            methods._mayTranslate.call($this, nextLanguageCode);
            $this.find('.' + nextLanguageCode).addClass('ltool-is-selected');

            return $this;
        },
        /**
         * Handles keydown event
         * @name _onKeydown
         * @function
         * @param {event} e - the keydown event
         * @access private
         */
        '_onKeydown': function (e) {
            var $this = this;

            switch (e.keyCode) {
                case 13: /* enter (open-close menu) */
                    methods._onDropdownClicked.call($this);
                    e.preventDefault();
                    break;
                case 40: /* down (select next) */
                    methods._selectNextLanguage.call($this);
                    e.preventDefault();
                    break;
                case 38: /* up (select previous) */
                    methods._selectPreviousLanguage.call($this);
                    e.preventDefault();
                    break;
                case 27:
                    methods._closeDropdown.call($this);
                    e.preventDefault();
                    break;
            }

            return $this;
        },
        /**
         * Binds events to the localization tool widget.
         * @name _bindEvents
         * @function
         * @access private
         */
        '_bindEvents': function () {
            var $this = this;

            $this
                .bind('mousedown.localizationTool', function (e) {
                    _keyboardPressed = false;
                    methods._onKeydown.call($this, e);
                })
                .bind('click.localizationTool', function (e) {
                    methods._onDropdownClicked.call($this, e);
                })
                .bind('keydown.localizationTool', function (e){
                    _keyboardPressed = true;
                    methods._onKeydown.call($this, e);
                })
                .bind('mouseout.localizationTool', function (e) {
                    methods._onMouseout.call($this, e);
                })
                .bind('focusout.localizationTool', function () {
                    if (_keyboardPressed) {
                        methods._closeDropdown.call($this);
                    }
                });

            $this.find('.ltool-language')
                .bind('click.localizationTool', function (/*e*/) {
                    methods._onLanguageSelected.call($this, $(this));
                });


            return $this;
        },
        /**
         * Analizes the input strings object and decomposes its keys in
         * sections: text strings, id strings, class strings, element strings,
         * attribute strings.
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
                'textStrings' : [],
                'attributeStrings' : []
            };

            var $this = this,
                stringsObj = $this.data('settings').strings;

            // regexp for attributes matching
            var attrRegexp = new RegExp('^[a-zA-Z-]+?::');

            var stringKey;
            for (stringKey in stringsObj) {
                if (stringsObj.hasOwnProperty(stringKey)) {
                    if (stringKey.match(attrRegexp)) {   // NOTE: check first!
                        decompositionObj.attributeStrings.push(stringKey);
                    }
                    else if (stringKey.indexOf('id:') === 0) {
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
         * STRING_IDENTIFIER -> <IS_ATTRIBUTE?, ORIGINAL_HTML, [DOM_NODES]>
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
               settings = $this.data('settings'),
               stringsObj = settings.strings;

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

               if (settings.ignoreUnmatchedSelectors === true && contents.length === 0) {
                   continue;
               }

               if (contents.length !== 1) {
                   $.error(idString + ' must contain exactly one text node, found ' + contents.length + ' instead');
               }
               else if (contents[0].nodeType !== 3) {
                   $.error(idString + ' does not contain a #text node (i.e., type 3)');
               }
               else {
                   // add this to the refMapping
                   refMapping[idString] = {
                       isAttribute : false, // it's an id: selector
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

                   // keeps the text of the first dom node in the loop below
                   var domNodeText;
                   var domNodesArray = [];
                   var allNodeTextsAreEqual = true;
                   domNodeText = undefined;  // note: assigns undefined


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
                           isAttribute : false, // it's a class: or an element: selector
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
            * Time to process the attributes
            */
           var firstSelectorStringRegex = new RegExp('(class|id|element):[^:]');
           var attrString;
           for (i=0; attrString = decompositionObj.attributeStrings[i++];) {


                // let's extract the attribute name from the element selector
                var splitStringArray = attrString.split("::");
                var attributeString = splitStringArray.shift();


                // sanity check on the format
                if (splitStringArray.length === 0) {
                    $.error('sorry, you need to specify class:, element: or id: selectors in ' + attrString);
                }

                var selectorString = splitStringArray.join('::');

                if (!splitStringArray[0].match(firstSelectorStringRegex)) {
                    $.error(attrString + "Doesn't look right. Perhaps you've added extra semicolons?");
                }


                // turn selector into jQuery selector
                selectorString = selectorString.replace('id:', '#');
                selectorString = selectorString.replace('class:', '.');
                selectorString = selectorString.replace('element:', '');

                // find DOM nodes
                var $domNodes = $(selectorString + '[' + attributeString + ']');
                if ($domNodes.length === 0) {
                    $.error('The selector "' + attrString + '" does not point to an existing DOM element');
                }


                // avoid using Array.prototype.reduce as it's supported in IE9+
                var j = 0,
                    allSameAttributeValue = true;

                var attributeText = $($domNodes[0]).attr(attributeString);

                var domNodesToAdd = [];

                for (j=0; j<$domNodes.length; j++) {
                    // check the placeholder text is all the same
                    var $dom = $($domNodes[j]);
                    if (attributeText !== $dom.attr(attributeString)) {
                        allSameAttributeValue = false;
                    }

                    // also add for later...
                    domNodesToAdd.push($dom);
                }
                if (!allSameAttributeValue) {
                    $.error('Not all the attribute values selected via ' + attrString + ' are the same');
                }

                // now we have everything in place, we just add it to the rest!
                refMapping[attrString] = {
                    isAttribute : true,  // yes, we are dealing with an attribute here
                    originalText : attributeText,
                    domNodes : domNodesToAdd
                };
           }


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
                      isAttribute: false, // no it's just another dom element
                      originalText : textString,
                      domNodes : textNodesToAdd
                  };
              }
           }

           $this.data('refMappingObj', refMapping);

           return $this;
        },
        /**
         * Calls the user specified callback (if any), then translates the page.
         * If the user returned 'false' in his/her callback, the translation is
         * not performed.
         * @name _mayTranslate
         * @function
         * @access private
         * @param {string} [languageCode] - the language code to translate to
         */
        '_mayTranslate': function (languageCode) {
            var $this = this,
                settings = $this.data('settings');

            if (false !== settings.onLanguageSelected(languageCode)) {
                methods._translate.call($this, languageCode);
            }
        },
        /**
         * Returns the code of the language currently selected
         * @name getSelectedLanguageCode
         * @function
         * @access public
         * @returns {string} [languageCode] - the language code currently selected
         */
        'getSelectedLanguageCode' : function () {
            var $this = this;
            return $this.data('selectedLanguageCode');
        },
        /**
         * Translates the current page.
         * @name translate
         * @function
         * @access public
         * @param {string} [languageCode] - the language to translate to.
         */
        '_translate': function (languageCode) {
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

                    // get the translation for this string...
                    var translation;
                    if (typeof languageCode === 'undefined' || languageCode === settings.defaultLanguage) {
                        translation = refMappingObj[string].originalText;
                    }
                    else {
                        translation = stringsObj[string][languageCode];
                    }

                    var domNodes = refMappingObj[string].domNodes;

                    var $domNode, i;

                    // attribute case
                    if (refMappingObj[string].isAttribute === true) {
                        var attributeName = string.split("::", 1)[0];

                        for (i=0; $domNode = domNodes[i++];) {
                            $domNode.attr(attributeName, translation);
                            $domNode.css('direction', cssDirection);
                        }

                    }
                    else {
                        // all other cases
                        for (i=0; $domNode = domNodes[i++];) {
                            $domNode.html(translation);
                            $domNode.css('direction', cssDirection);
                        }
                    }
                }
            }

            return $this;
        },
        /**
         * Translates according to the widget configuration programmatically.
         * This is meant to be called by the user. The difference with the
         * private counterpart _translate method is that the language is
         * selected in the widget.
         */
        'translate' : function (languageCode) {
            var $this = this;

            methods._translate.call($this, languageCode);

            // must also select the language when translating via the public method
            methods._selectLanguage.call($this, languageCode);

            return $this;
        },
        /**
         * Translates a given string.
         *
         * @param {string} textToTranslate
         *  A string of text to be translated. Requires the string is defined
         *  during plugin initialization.
         * @param {string} languageCode
         *  A known language code like 'de_DE'
         *
         * @returns {string}
         *  The translated string. The method throws an error if it was not
         *  possible to translate the string.
         */
        'translateString' : function (textToTranslate, languageCode) {
            var $this = this;
            var settings = $this.data('settings');
            var stringsObj = settings.strings;

            if (!settings.languages.hasOwnProperty(languageCode)) {
                $.error('The language code ' + languageCode + ' is not known');
                return;
            }

            if (!stringsObj.hasOwnProperty(textToTranslate)) {
                $.error('The string \'' + textToTranslate + '\' was not translated in any language.');
                return;
            }

            var oTranslations = stringsObj[textToTranslate] || {};
            if (!oTranslations.hasOwnProperty(languageCode)) {
                $.error('A translation for the string \'' + textToTranslate + '\' was not defined for language ' + languageCode + ". Defined languages are: " + Object.keys(oTranslations).join(", "));
                return;
            }

            return oTranslations[languageCode];
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
         * Sorts the given array of countryLanguageCodes by country name.
         * If a language has no name goes to the bottom of the list.
         *
         * @name _sortCountryLanguagesByCountryName
         * @function
         * @access private
         * @param {object} languagesDefinition - the array countryLanguageCodes defined during initialization.
         * @param {array} arrayOfCountryLanguageCodes - the input array countryLanguageCodes.
         * @returns {array} sortedArrayOfCountryLanguageCodes - the sorted array countryLanguageCodes.
         */
        '_sortCountryLanguagesByCountryName': function (languagesDefinition, arrayOfCountryLanguageCodes) {
            return arrayOfCountryLanguageCodes.sort(function (a, b) {
                if (languagesDefinition[a].hasOwnProperty('country') && languagesDefinition[b].hasOwnProperty('country')) {
                    return languagesDefinition[a].country.localeCompare(
                        languagesDefinition[b].country
                    );
                }
                else if (languagesDefinition[a].hasOwnProperty('country')) {
                    return languagesDefinition[a].country.localeCompare(
                        languagesDefinition[b].language
                    );
                }
                // else if (languagesDefinition[b].hasOwnProperty('country')) {
                return languagesDefinition[a].language.localeCompare(
                    languagesDefinition[b].country
                );
                // }
            });
        },
        /**
         * Goes through each string defined and extracts the common subset of
         * languages that actually used. The default language is added to this
         * subset a priori. The resulting list is sorted by country name.
         *
         * @name _findSubsetOfUsedLanguages
         * @function
         * @access private
         * @param {object} stringsObj - the strings to translate
         * @returns {array} usedLanguageCodes - an array of country codes sorted based on country names.
         */
        '_findSubsetOfUsedLanguages' : function (stringsObj) {
            var $this = this;
            var string;
            var settings = $this.data('settings');

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

            // delete the default language if it's in the guaranteed languages
            var defaultIdx = $.inArray(settings.defaultLanguage, guaranteedLanguages);
            if (defaultIdx > -1) {
                // delete the default language from the array
                guaranteedLanguages.splice(defaultIdx, 1);
            }

            // add the default language in front
            guaranteedLanguages.unshift(settings.defaultLanguage);

            return methods._sortCountryLanguagesByCountryName.call(
                this,
                settings.languages,
                guaranteedLanguages
            );
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
            // NOTE: "country" is optional
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
                'ko_KR' : {
                    'country' : 'Korea, Republic of.',
                    'language' : 'Korean',
                    'countryTranslated' : '대한민국',
                    'languageTranslated' : '한국어',
                    'flag' : {
                        'class' : 'flag flag-kr'
                    }
                },
                'pt_BR' : {
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
                'en_IN' : {
                    'country' : 'India',
                    'language' : 'English',
                    'countryTranslated': 'India',
                    'languageTranslated': 'English',
                    'flag': {
                        'class' : 'flag flag-in'
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
                },
                'el_GR' : {
                    'country': 'Greece',
                    'language': 'Greek',
                    'countryTranslated': 'Ελλάδα',
                    'languageTranslated' : 'Ελληνικά',
                    'flag' : {
                        'class' : 'flag flag-gr'
                    }
                },
                'en_IE' : {
                    'country': 'Ireland',
                    'language': 'English',
                    'countryTranslated': 'Ireland',
                    'languageTranslated' : 'English',
                    'flag' : {
                        'class' : 'flag flag-ie'
                    }
                },
                'nl_NL': {
                    'country' : 'Netherlands',
                    'language': 'Dutch',
                    'countryTranslated' : 'Nederland',
                    'languageTranslated' : 'Nederlands',
                    'flag' : {
                        'class' : 'flag flag-nl'
                    }
                },
                'zh_CN': {
                    'country' : 'China',
                    'language' : 'Simplified Chinese',
                    'countryTranslated': '中国',
                    'languageTranslated': '简体中文',
                    'flag' : {
                        'class' : 'flag flag-cn'
                    }
                },
                'zh_TW': {
                    'country' : 'Taiwan',
                    'language' : 'Traditional Chinese',
                    'countryTranslated': '臺灣',
                    'languageTranslated': '繁體中文',
                    'flag' : {
                        'class' : 'flag flag-tw'
                    }
                },
                'fi_FI': {
                    'country' : 'Finland',
                    'language' : 'Finnish',
                    'countryTranslated' : 'Suomi',
                    'languageTranslated' : 'Suomi',
                    'flag' : {
                        'class' : 'flag flag-fi'
                    }
                },
                'pt_PT' : {
                    'country' : 'Portugal',
                    'language' : 'Portuguese',
                    'countryTranslated': 'Portugal',
                    'languageTranslated' : 'Português',
                    'flag' : {
                        'class' : 'flag flag-pt'
                    }
                },
                'pl_PL': {
                    'country' : 'Poland',
                    'language': 'Polish',
                    'countryTranslated' : 'Polska',
                    'languageTranslated': 'Polski',
                    'flag' : {
                        'class' : 'flag flag-pl'
                    }
                },
                'ru_RU': {
                    'country' : 'Russia',
                    'language' : 'Russian',
                    'languageTranslated': 'Русский',
                    'countryTranslated' : 'Россия',
                    'flag': {
                        'class': 'flag flag-ru'
                    }
                },
                'hi_IN': {
                    'country' : 'India',
                    'language': 'Hindi',
                    'countryTranslated': 'भारत',
                    'languageTranslated': 'हिन्द',
                    'flag': {
                        'class': 'flag flag-in'
                    }
                },
                'ta_IN': {
                    'country' : 'India',
                    'language': 'Tamil',
                    'countryTranslated': 'இந்தியா',
                    'languageTranslated': 'தமிழ்',
                    'flag': {
                        'class': 'flag flag-in'
                    }
                },
                'ml_IN': {
                    'country' : 'India',
                    'language': 'Malayalam',
                    'countryTranslated': 'ഇന്ത്യ',
                    'languageTranslated': 'മലയാളം',
                    'flag': {
                        'class': 'flag flag-in'
                    }
                },
                'tr_TR': {
                    'country' : 'Turkey',
                    'language' : 'Turkish',
                    'countryTranslated': 'Türkiye',
                    'languageTranslated': 'Türkçe',
                    'flag': {
                        'class': 'flag flag-tr'
                    }
                },
                'he_IL': {
                    'country' : 'Israel',
                    'language' : 'Hebrew',
                    'countryTranslated' : 'מדינת ישראל',
                    'languageTranslated': 'עברית',
                    'cssDirection': 'rtl',
                    'flag': {
                        'class': 'flag flag-il'
                    }
                },
                'da_DK' : {
                    'country' : 'Denmark',
                    'language' : 'Danish',
                    'countryTranslated': 'Danmark',
                    'languageTranslated': 'Dansk',
                    'flag' : {
                        'class': 'flag flag-dk'
                    }
                },
                'ro_RO': {
                    'country' : 'Romania',
                    'language' : 'Romanian',
                    'countryTranslated': 'România',
                    'languageTranslated': 'Român',
                    'flag' : {
                        'class': 'flag flag-ro'
                    }
                },
                'eo' : {
                    // NOTE: no country
                    'language' : 'Esperanto',
                    'languageTranslated' : 'Esperanto',
                    'flag' : {
                        'class': 'flag flag-esperanto'
                    }
                },
                'sk_SK' : {
                    'country' : 'Slovakia',
                    'language' : 'Slovak',
                    'countryTranslated': 'Slovensko',
                    'languageTranslated': 'Slovenčina',
                    'flag' : {
                        'class': 'flag flag-sk'
                    }
                },
                'es_MX' : {
                    'country' : 'Mexico',
                    'language' : 'Spanish',
                    'countryTranslated': 'México',
                    'languageTranslated': 'Español',
                    'flag' : {
                        'class': 'flag flag-mx'
                    }
                },
                'tl_PH' : {
                    'country' : 'Philippines',
                    'language' : 'Tagalog',
                    'countryTranslated': 'Pilipinas',
                    'languageTranslated': 'Tagalog',
                    'flag' : {
                        'class': 'flag flag-ph'
                    }
                },
                'cs_CZ' : {
                    'country' : 'Czech Republic',
                    'language' : 'Czech',
                    'countryTranslated': 'Česká republika',
                    'languageTranslated': 'Čeština',
                    'flag' : {
                        'class': 'flag flag-cz'
                    }
                }
            };

            var settings = $.extend({
                'defaultLanguage' : 'en_GB',
                /* do not throw error if a selector doesn't match */
                'ignoreUnmatchedSelectors': false,
                /* show the flag on the widget */
                'showFlag' : true,
                /* show the language on the widget */
                'showLanguage': true,
                /* show the country on the widget */
                'showCountry': true,
                /* format of the language/country label */
                'labelTemplate': '{{country}} {{(language)}}',
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
                'strings' : {},
                /*
                 * A callback called whenever the user selects the language
                 * from the dropdown menu. If false is returned, the
                 * translation will not be performed (but just the language
                 * will be selected from the widget).
                 *
                 * The countryLanguageCode is a string representing the
                 * selected language identifier like 'en_GB'
                 */
                'onLanguageSelected' : function (/*countryLanguageCode*/) { return true; }
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

                // language codes common to all translations
                var activeLanguageCodeArray = methods._findSubsetOfUsedLanguages.call(
                    $this, settings.strings
                );
                $this.data('activeLanguageCodeArray', activeLanguageCodeArray);

                methods._initializeWidget.call($this, activeLanguageCodeArray);

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
