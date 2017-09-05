(function($) {

  var commonFixtures = {
    'pluginDropdown' : '<div id="dropdown"></div>',
    'idsOnly' : [
        '<h1 id="mainHeading">Hello World!</h1>',
        '<h2 id="secondaryHeading">This is a fixture</h2>',
        '<p id="paragraph">This is a paragraph</p>'
    ].join(''),

  };

  var Q = QUnit;

  /*
   * Some helpers here...
   */
  var addDropdownWidgetFunc = function () {
    // append dropdown widget to qunit-fixture
    var $fixture = $('#qunit-fixture');

    $fixture.append(commonFixtures.pluginDropdown);
  };

  var findLanguagesWithNoCountry = function (languageObject) {
    var result = [];
    for (var countryLanguageCode in languageObject) {
        if (languageObject.hasOwnProperty(countryLanguageCode)) {
            if (false === languageObject[countryLanguageCode].hasOwnProperty('country')) {
               result.push(countryLanguageCode);
            }
        }
    }
    return result;
  };

  
  //////////////////////////////////////////////////////////////////////////////
  Q.module('basic tests', { beforeEach: addDropdownWidgetFunc });
  Q.test('is chainable', function (assert) {
      assert.ok($('#dropdown').localizationTool().addClass('initialized'),
        'add class from chaining');

      assert.equal($('#dropdown').hasClass('initialized'), true, 
        'element is chainable after initialization');
  });

  //////////////////////////////////////////////////////////////////////////////
  Q.module('_decomposeStringsForReferenceMapping', {
    beforeEach: function () {
        addDropdownWidgetFunc();
    }
  });
  Q.test('decomposes ids/strings/elements/text as expected', function (assert) {
    // some fixtures to let the plugin be initialized correctly
    $('#qunit-fixture').append([
        '<p id="hello">Hi Man!</p>',
        '<pre>some text</pre>',
        '<div class="the_class">random text</div>',
        '<p>various bits decomposed as expected</p>'
    ].join(''));

    var decompositionObj = $('#dropdown').localizationTool({
        'strings' : {
            'id::id:hello' : {},
            'id:hello' : {},
            'element:pre' : {},
            'class:the_class' : {},
            'some text element here' : {}
        }
    })
    .localizationTool('_decomposeStringsForReferenceMapping');


    assert.deepEqual(decompositionObj, {
       idStrings : ['id:hello'],
       elementStrings: ['element:pre'],
       classStrings: ['class:the_class'],
       textStrings: ['some text element here'],
       attributeStrings: ['id::id:hello']
    }, 'various bits decomposed as expected');

  });



  //////////////////////////////////////////////////////////////////////////////
  Q.module('_buildStringReferenceMapping', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  Q.test('reference mapping run contains ids', function (assert) {
    $('#qunit-fixture').append(commonFixtures.idsOnly);

    // causes reference mapping to be run
    var refMappingObj = $('#dropdown').localizationTool({
        strings : {
            'id:mainHeading' : {},
            'id:secondaryHeading' : {},
            'id:paragraph': {}
        }
    }).data('refMappingObj');

    // let's see if it contains the 3 ids
    assert.equal(refMappingObj.hasOwnProperty('id:mainHeading'), true, 'id:mainHeading found');
    assert.equal(refMappingObj.hasOwnProperty('id:secondaryHeading'), true, 'id:secondaryHeading found');
    assert.equal(refMappingObj.hasOwnProperty('id:paragraph'), true, 'id:paragraph found');
  });

  Q.test('entry of reference mapping is correct', function(assert) {
    $('#qunit-fixture').append(commonFixtures.idsOnly);

    // causes reference mapping to be run
    var refMappingObj = $('#dropdown').localizationTool({
        strings : {
            'id:mainHeading' : {},
        }
    }).data('refMappingObj');

    // let's see if it contains the 3 ids
    assert.deepEqual(refMappingObj['id:mainHeading'], {
        originalText : 'Hello World!',
        isAttribute: false,
        domNodes: [ $('#mainHeading') ]
    }, 'got expected structure');
  });



  //////////////////////////////////////////////////////////////////////////////
  Q.module('init', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  Q.test('no exception thrown when translating multiple class', function (assert) {
    $('#qunit-fixture').append([
        '<div class="title">hello</div>',
        '<div class="foo">world</div>'
    ].join(''));

    // causes reference mapping to be run
    var thrown = 0;
    try {
        $('#dropdown').localizationTool({
            strings : {
                'class:title' : {
                    'it_IT': 'ciao',
                    'en_GB': 'hello',
                },
                'class:foo' : {
                    'it_IT': 'mondo',
                    'en_GB': 'world'
                }
            }
        });
    }
    catch (e) {
        thrown = 1;
    }

    assert.equal(thrown, 0, 'no exceptions thrown');

  });

  Q.test('flag is disabled', function (assert) {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showFlag' : false
    });

    assert.equal(
        $('#qunit-fixture').find('.ltool-language-flag').length,
        0, 
        'flag is not displayed'
    );
  });

  Q.test('language is disabled', function (assert) {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showLanguage' : false
    });

    assert.equal(
        $('#qunit-fixture').find('.ltool-language-name').length,
        0, 
        'language is not displayed'
    );
  });

  Q.test('country is disabled', function (assert) {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showCountry' : false
    });

    assert.equal(
        $('#qunit-fixture').find('.ltool-language-country').length,
        0, 
        'country is not displayed'
    );
  });

  Q.test('default language appears once', function (assert) {

    $('#qunit-fixture').append([
        '<div id="title">hello</div>',
        '<div id="subtitle">world</div>'
    ].join(''));

    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'defaultLanguage' : 'it_IT',
        'strings' : {
            'id:title' : {
                'en_GB': 'hello',
                'it_IT': 'ciao'
            },
            'id:subtitle': {
                'en_GB': 'world',
                'it_IT': 'mondo'
            }
        }
    });

    assert.equal(
        $('#qunit-fixture').find('.it_IT').length,
        1, 
        'Italian appears only once'
    );
  });

  Q.test('languages with no country are displayed without paretheses on the widget', function (assert) {
    // initialize widget
    $('#dropdown').localizationTool();

    // find out languages without a country specified
    var allLanguages = $('#dropdown').data('settings').languages;
    var languageCountryCodes = findLanguagesWithNoCountry(allLanguages);

    // now check that the markup for each country code is rendered without parentheses.
    var idx=0, lcc;
    for (; lcc = languageCountryCodes[idx++];) {
        $('#dropdown')
            .localizationTool('destroy')
            .localizationTool({
                defaultLanguage : lcc
            });

        assert.equal(0, $('#dropdown .ltool-language-name.ltool-has-country').length, "no country found for " + lcc);
    }

  });

  //////////////////////////////////////////////////////////////////////////////
  Q.module('_sortCountryLanguagesByCountryName', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  Q.test('languages are sorted as expected', function (assert) {
    $('#dropdown').localizationTool();

    var initialArray = ['de_DE', 'en_GB', 'it_IT'];

    var sortedArray = $('#dropdown').localizationTool('_sortCountryLanguagesByCountryName',
        { 'de_DE' : { 'country' : 'Germany' },
          'en_GB' : { 'country' : 'United Kingdom' },
          'it_IT' : { 'country' : 'Italy' }
        },
        initialArray
    );

    assert.deepEqual(sortedArray, ['de_DE', 'it_IT', 'en_GB'], 'case 1');

    var sortedArray2 = $('#dropdown').localizationTool('_sortCountryLanguagesByCountryName',
        { 'de_DE' : { 'country' : 'Zermany' },
          'en_GB' : { 'country' : 'United Kingdom' },
          'it_IT' : { 'country' : 'Ataly' }
        },
        initialArray
    );

    assert.deepEqual(sortedArray2, ['it_IT', 'en_GB', 'de_DE'], 'case 2');

  });

  Q.test('languages are sorted as expected when languages have no countries', function (assert) {
    $('#dropdown').localizationTool();

    var initialArray = ['de_DE', 'en_GB', 'eo', 'it_IT'];

    var sortedArray = $('#dropdown').localizationTool('_sortCountryLanguagesByCountryName',
        { 'de_DE' : { 'country' : 'Germany' },
          'en_GB' : { 'country' : 'United Kingdom' },
          'it_IT' : { 'country' : 'Italy' },
          'eo' : { 'language' : 'Esperanto' } // a language with no country
        },
        initialArray
    );

    assert.deepEqual(sortedArray, ['eo', 'de_DE', 'it_IT', 'en_GB'], 'eo comes first ');

  });

  //////////////////////////////////////////////////////////////////////////////
  Q.module('translate', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  Q.test('language selected callback is called after selection', function (assert) {

    $('#qunit-fixture').append([
        '<div id="title">hello</div>',
        '<div id="subtitle">world</div>'
    ].join(''));

    var gotCalledWith;

    $('#dropdown').localizationTool({
        'onLanguageSelected' : function (countryCode) {
            gotCalledWith = countryCode;
            return false;
        },
        'strings' : {
            'id:title' : {
                'en_GB': 'hello',
                'it_IT': 'ciao'
            },
            'id:subtitle': {
                'en_GB': 'world',
                'it_IT': 'mondo'
            }
        }
    });

    $('#dropdown').localizationTool('_onLanguageSelected', $('<li class="en_GB"></li>'));

    assert.equal(gotCalledWith, 'en_GB', 'got called');
    
  });

  Q.test('ids are translated as expected', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h1 id="translateThis">This is something</h1>',
        '<p id="translateThisToo">This is something bad!</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:translateThis' : {
                it_IT : 'Ciò &egrave; qualcosa',
            },
            'id:translateThisToo' : {
                it_IT : "Ci&ograve; è qualcos'altro"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    assert.equal($('#translateThis').html(), 'Ciò è qualcosa', 'translated as expected');
    assert.equal($('#translateThisToo').html(), "Ciò è qualcos'altro");

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    assert.equal($('#translateThis').html(), 'This is something', 'translated back as expected');
    assert.equal($('#translateThisToo').html(), 'This is something bad!');

  });

  Q.test('attributes are translated', function (assert) {

    $('#qunit-fixture').append([
        '<h1 class="localized">This is something</h1>',
        '<input type="text" class="localized" placeholder="insert your email here"></input>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class::class:localized' : { // translate the class attribute
                it_IT: "localizzato"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check
    assert.equal($('h1').hasClass('localized'), false, 'no "localized" exists on h1');
    assert.equal($('input[type=text]').hasClass('localized'), false, 'no "localized" exists on input');

    assert.equal($('h1').hasClass('localizzato'), true, '"localizzato" found on h1');
    assert.equal($('input[type=text]').hasClass('localizzato'), true, '"localizzato" found on input');

  });

  Q.test('specific attributes are translated', function (assert) {

    $('#qunit-fixture').append([
        '<h1 class="localized">This is something</h1>',
        '<input type="text" class="localized" placeholder="insert your email here"></input>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'placeholder::class:localized' : {
                it_IT: "localizzato"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check
    assert.equal($('#qunit-fixture input[type=text]').attr('placeholder'), 'localizzato', 'placeholder attribute was translated');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    assert.equal($('#qunit-fixture input[type=text]').attr('placeholder'), 'insert your email here', 'placeholder attribute was translated back');

  });

  Q.test('classes are translated as expected', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h1 class="localized">This is something</h1>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class:localized' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    $('.localized').each(function (i, e) {
        assert.equal($(e).html(), 'Questo è qualcosa', 'translated as expected ' + i);
    });

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('.localized').each(function (i, e) {
        assert.equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  Q.test('ids have precedence over class translation', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h1 id="priority" class="localized">This is something</h1>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:priority': {
                it_IT : "Priority!"
            },
            'class:localized' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    assert.equal($('#priority').html(), 'Priority!', 'id translated according to id rule');
    assert.equal($('p.localized').html(), 'Questo è qualcosa', 'the remaining class is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('.localized').each(function (i, e) {
        assert.equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  Q.test('throws error when attempting to translate classes elements containing different text', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something else</p>'
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('throws error when attempting to translate classes elements containing elements other than text', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This <b>is</b> something</p>',
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('throws error when attempting to translate multiple classes elements and one of them contains multiple sub-elements', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This <b>is</b> something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('elements are translated as expected', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h5>This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    $('h5').each(function (i, e) {
        assert.equal($(e).html(), 'Questo è qualcosa', 'translated as expected ' + i);
    });

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        assert.equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  Q.test('classes have precedence over element translation', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h5 class="priority">This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class:priority': {
                it_IT : "Priority!"
            },
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    assert.equal($('h5.priority').html(), 'Priority!', 'id translated according to id rule');
    assert.equal($('h5:not(.priority)').html(), 'Questo è qualcosa', 'the remaining element is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        assert.equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  Q.test('ids have precedence over element translation', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h5 id="priority">This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:priority': {
                it_IT : "Priority!"
            },
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    assert.equal($('h5#priority').html(), 'Priority!', 'id translated according to id rule');
    assert.equal($('h5:not(#priority)').html(), 'Questo è qualcosa', 'the remaining class is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        assert.equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  Q.test('throws error when attempting to translate elements containing different text', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something else</p>'
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('throws error when attempting to translate elements containing elements other than text', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p>This <b>is</b> something</p>',
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'element:p' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('throws error when attempting to translate multiple classes elements and one of them contains multiple sub-elements', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<p">This <b>is</b> something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>'
    ].join(''));

    // initialize
    assert.throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'element:p' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  Q.test('the widget displays the translation language when translate is called programmatically', function (assert) {
    // fixture
    $('#qunit-fixture').append([
        '<h1 class="translateme">hello</h1>',
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class:translateme' : {
                it_IT : "ciao"
            }
        }
    });

    var htmlBeforeTranslation = $('#dropdown .ltool-dropdown-label').html();

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    var htmlAfterTranslation = $('#dropdown .ltool-dropdown-label').html();

    assert.notEqual(htmlAfterTranslation, htmlBeforeTranslation, 'the widget has actually changed its html');
    assert.equal(htmlAfterTranslation, "<div class=\"ltool-language-flag flag flag-it\"></div><span class=\"ltool-language-countryname\"><span class=\"ltool-language-country\">Italy</span> <span class=\"ltool-has-country ltool-language-name\">(Italian)</span></span>", 'got expected html');
  });

  
  //////////////////////////////////////////////////////////////////////////////
  Q.module('_findSubsetOfUsedLanguages', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  Q.test('one language in common', function (assert) {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'es_ES' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'de_DE' : 'translation4',
                   'es_ES' : 'translation5',
                   'pt_BR' : 'translation6'
                },
                'string3' : {
                   'en_US' : 'translation7',
                   'es_ES' : 'translation8',
                   'en_AU' : 'translation9'
                }
            }
        );

    assert.deepEqual(commonLanguages, ['es_ES', 'en_GB']);
  });

  Q.test('no language in common', function (assert) {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'de_DE' : 'translation4',
                   'es_ES' : 'translation5',
                   'pt_BR' : 'translation6'
                },
                'string3' : {
                   'en_US' : 'translation7',
                   'es_ES' : 'translation8',
                   'en_AU' : 'translation9'
                }
            }
        );

    assert.deepEqual(commonLanguages, ['en_GB']);
  });

  Q.test('all languages in common', function (assert) {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string3' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                }
            }
        );

    assert.deepEqual(commonLanguages, [ "fr_FR", "it_IT", "jp_JP", "en_GB" ]);

  });

  Q.test('no strings defined', function (assert) {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages', {});

    assert.deepEqual(commonLanguages, ['en_GB']);
  });




  //////////////////////////////////////////////////////////////////////////////
  Q.module('_languageCodeToOrdinal', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});
  Q.test('converts language codes to ordinal numbers', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'string1' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string2' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string3' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            }
        }
    });

    assert.equal($dropdown.localizationTool('_languageCodeToOrdinal', 'it_IT'),
        1, 'got expected ordinal number for it_IT'
    );
    assert.equal($dropdown.localizationTool('_languageCodeToOrdinal', 'jp_JP'),
        2, 'got expected ordinal number for jp_JP'
    );
    assert.equal($dropdown.localizationTool('_languageCodeToOrdinal', 'fr_FR'),
        0, 'got expected ordinal number for fr_FR'
    );
    assert.equal($dropdown.localizationTool('_languageCodeToOrdinal', 'en_GB'),
        3, 'default language'
    );

    assert.throws(function () {
        $dropdown.localizationTool('_languageCodeToOrdinal', 'fooFie!');
    });
  });

  Q.module('_interpolateTemplate', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});

  [
    {
        template: '{{country}}{{language}}',
        country: 'Italy',
        language: 'Italian',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-language-country\">Italy</span><span class=\"ltool-has-country ltool-language-name\">Italian</span></span>"
    },
    {
        template: '{{country}}',
        country: 'Italy',
        language: 'Italian',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-language-country\">Italy</span></span>" 
    },
    {
        template: '{{language}}',
        country: 'Italy',
        language: 'Italian',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-has-country ltool-language-name\">Italian</span></span>" 
    },
    {
        template: 'FIXED TEXT',
        country: 'Italy',
        language: 'Italian',
        expected: "<span class=\"ltool-language-countryname\">FIXED TEXT</span>" 
    },
    {
        template: '{{language}}{{country}}{{language}}',
        country: 'IT',
        language: 'italian',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-has-country ltool-language-name\">italian</span><span class=\"ltool-language-country\">IT</span><span class=\"ltool-has-country ltool-language-name\">italian</span></span>"
    },
    {
        template: '{{country}}-{{language}}',
        country: '$1Italy$2',
        language: '$1Italian$2',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-language-country\">&#36;1Italy&#36;2</span>-<span class=\"ltool-has-country ltool-language-name\">&#36;1Italian&#36;2</span></span>"
    },
    {
        template: '{{(country)}}{{$%^language}}',
        country: 'Italy',
        language: 'Italian',
        expected: "<span class=\"ltool-language-countryname\"><span class=\"ltool-language-country\">(Italy)</span><span class=\"ltool-has-country ltool-language-name\">$%^Italian</span></span>"
    }
  ].forEach(function (oFixture) {
      Q.test('returns expected markup for ' + oFixture.template, function (assert) {
        var $dropdown = $('#dropdown').localizationTool({
            labelTemplate: oFixture.template
        });

        var interpolated = $dropdown.localizationTool('_interpolateTemplate', oFixture.country, oFixture.language);

        assert.strictEqual(interpolated, oFixture.expected, 'got expected string');
      });
  });



  //////////////////////////////////////////////////////////////////////////////
  Q.module('_ordinalToLanguageCode', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});
  Q.test('converts language codes to ordinal numbers', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'string1' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string2' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string3' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            }
        }
    });

    assert.equal($dropdown.localizationTool('_ordinalToLanguageCode', 1),
        'it_IT', 'got expected language code number for ordinal 1'
    );
    assert.equal($dropdown.localizationTool('_ordinalToLanguageCode', 2),
        'jp_JP', 'got expected language code number for ordinal 2'
    );
    assert.equal($dropdown.localizationTool('_ordinalToLanguageCode', 0),
        'fr_FR', 'got expected language code number for ordinal 0'
    );
    assert.equal($dropdown.localizationTool('_ordinalToLanguageCode', 3),
        'en_GB', 'got expected language code number for ordinal 3'
    );

    // NOTE: string input
    assert.equal($dropdown.localizationTool('_ordinalToLanguageCode', "2"),
        'jp_JP', 'got expected language code number for ordinal 2'
    );

    assert.throws(function () {
        $dropdown.localizationTool('_ordinalToLanguageCode', 4);
    }, 'out of right bound of array');

    assert.throws(function () {
        $dropdown.localizationTool('_ordinalToLanguageCode', -1);
    }, 'out of left bound of array');
  });


  //////////////////////////////////////////////////////////////////////////////
  Q.module('translateString', { beforeEach: function () {
    addDropdownWidgetFunc();
  }});
  Q.test('translates a string with provided translation', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'this is some text' : {
               'it_IT' : 'this is some translation 1',
               'jp_JP' : 'this is some translation 2',
               'fr_FR' : 'this is some translation 3'
            }
        }
    });

    assert.equal($dropdown.localizationTool('translateString',
        'this is some text',
        'it_IT'
    ), 'this is some translation 1', 'got the expected string');

  });

  Q.test('throws an error when translation is made on an unknown language', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'this is some text' : {
               'it_IT' : 'this is some translation 1',
               'jp_JP' : 'this is some translation 2',
               'fr_FR' : 'this is some translation 3'
            }
        }
    });
    assert.throws(function () {
        $dropdown.localizationTool('translateString',
            'this is some text',
            'fooLanguage'  // this language is not knwon
        );
    }, /The language code fooLanguage is not known/);
  });

  Q.test('throws an error when translation is not defined for the given language', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'this is some text' : {
               'it_IT' : 'this is some translation 1',
               'jp_JP' : 'this is some translation 2',
               'fr_FR' : 'this is some translation 3'
            }
        }
    });
    assert.throws(function () {
        $dropdown.localizationTool('translateString',
            'this is some text',
            'de_DE'
        );
    }, /A translation for the string 'this is some text' was not defined for language de_DE. Defined languages are: it_IT, jp_JP, fr_FR$/);
  });

  Q.test('throws an error when string is not translated in any language', function (assert) {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'this is some text' : {
               'it_IT' : 'this is some translation 1',
               'jp_JP' : 'this is some translation 2',
               'fr_FR' : 'this is some translation 3'
            }
        }
    });
    assert.throws(function () {
        $dropdown.localizationTool('translateString',
            'this is some other text',
            'de_DE'  // this language is not knwon
        );
    }, /The string 'this is some other text' was not translated in any language./);
  });

}(jQuery));
