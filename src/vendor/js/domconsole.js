function init() {
  var result = (function() {
    if (typeof window !== 'undefined') {
      'use strict';
      var util = {
        /**
         * Make your URL absolute.
         * @memberof util
         * @param {String} url The URL to convert to absolute.
         * @returns {String} the absolute URL including host/protocol.
         */
        getAbsoluteURL: function(url) {
          var a = window.document.createElement('a');
          a.href = url;
          return a.href;
        },
        /**
         * Get the hostname from a URL
         * @memberof util
         * @param {String} url The URL.
         * @returns {String} the hostname from the URL.
         */
        getHostname: function(url) {
          var a = window.document.createElement('a');
          a.href = url;
          return a.hostname;
        },
        /**
         * Checks if an element exist in an array.
         *
         * @memberof util
         * @param {String} element the element.
         * @param {Array} array the array.
         * @returns {Boolean} true if the element exist.
         */
        exists: function(element, array) {
          return array.some(function(e) {
            return e === element;
          });
        },
        /**
         * Returns an array filter function for finding tags with an attribute specified value, matching case insensitive.
         * @param attributeName the name of the attribute to look for (html attribute values are always case insensitive).
         * @param attributeValue the value to match against, ignoring case.
         * @returns {Function} function that can be passed to Array#filter
         */
        caseInsensitiveAttributeValueFilter: function(attributeName, attributeValue) {
          return function(item) {
            var attribute = item.getAttribute(attributeName) || '';
            if (attribute.toLowerCase() === attributeValue.toLowerCase()) {
              return item;
            }
            return undefined;
          };
        },
        /**
         * Is the connection used for the main document using HTTP/2? Only
         * works in Chrome and Firefox Nightly + browsers that supports Resource Timing
         * API v2.
         * @memberof util
         * @returns {Boolean} true if the connection is HTTP/2
         */
        isHTTP2: function() {
          var type = util.getConnectionType().toLowerCase();
          return type === 'h2' || type.startsWith('spdy');
        },
        /**
         * Get the connection type used for the main document. Only
         * works in Chrome and Firefox Nightly + browsers that supports Resource Timing
         * API v2.
         * @memberof util
         * @returns {String} http/1 or h2 for http 1 and 2 respectively. 'unknown' if browser lacks api to determine it.
         */
        getConnectionType: function() {
          // it's easy in Chrome
          if (window.chrome && window.chrome.loadTimes) {
            return window.chrome.loadTimes().connectionInfo;
          }
          // if you support resource timing v2
          // it's easy kind of easy too
          else if (window.performance && window.performance.getEntriesByType &&
            window.performance.getEntriesByType('resource')) {
            var resources = window.performance.getEntriesByType('resource');
            // now we "only" need to know if it is v2
            if (resources.length > 1 && resources[0].nextHopProtocol) {
              // if it's the same domain, say it's ok
              var host = document.domain;

              for (var i = 0, len = resources.length; i < len; i += 1) {
                if (host === util.getHostname(resources[i].name)) {
                  return resources[i].nextHopProtocol;
                }
              }
            }
          }
          return 'unknown';
        },
        /**
         * Get Javascript requests that are loaded synchronously. All URLs are absolute.
         * @memberof util
         * @param {Object} parentElement the parent element that has all the scripts.
         * @returns {Array} an array with the URL to each Javascript file that is loaded sync.
         */
        getSynchJSFiles: function(parentElement) {
          var scripts = Array.prototype.slice.call(parentElement.getElementsByTagName('script'));

          return scripts.filter(function(s) {
              return ((!s.async) && s.src);
            })
            .map(function(s) {
              return util.getAbsoluteURL(s.src)
            });
        },
        /**
         * Get Javascript requests that are loaded asynchronously. All URLs are absolute.
         * @memberof util
         * @param {Object} parentElement the parent element that has all the scripts.
         * @returns {Array} an array with the URL to each Javascript file that are loaded async.
         */
        getAsynchJSFiles: function(parentElement) {
          var scripts = Array.prototype.slice.call(parentElement.getElementsByTagName('script'));

          return scripts.filter(function(s) {
              return (s.async && s.src);
            })
            .map(function(s) {
              return util.getAbsoluteURL(s.src)
            });
        },
        /**
         * Get Resource Hints hrefs by type
         * @memberof util
         * @param {String} type the name of the Resources hint: dns-prefetch, preconnect, prefetch, prerender
         * @returns {Array} an array of matching hrefs
         */
        getResourceHintsHrefs: function(type) {
          var links = Array.prototype.slice.call(window.document.head.getElementsByTagName('link'));

          return links.filter(function(link) {
              return (link.rel === type);
            })
            .map(function(link) {
              return link.href
            });
        },
        /**
         * Get CSS requests. All URLs are absolute.
         * @memberof util
         * @param {Object} parentElement the parent element that has all the scripts.
         * @returns {Array} an array with the URL to each CSS file that is loaded sync.
         */
        getCSSFiles: function(parentElement) {
          var links = Array.prototype.slice.call(parentElement.getElementsByTagName('link'));

          return links.filter(function(link) {
              // make sure we skip data:
              return (link.rel === 'stylesheet' && !link.href.startsWith('data:'));
            })
            .map(function(link) {
              return util.getAbsoluteURL(link.href)
            });
        },
        plural: function(value) {
          return (value !== 1) ? 's' : '';
        },
        /**
         * Get the size of an asset. Will try to use the Resource Timing V2. If that's
         * not available or the asset size is unknown we report 0.
         **/
        getTransferSize: function(url) {
          var entries = window.performance.getEntriesByName(url, 'resource');
          if (entries.length === 1 && entries[0].nextHopProtocol) {
            return entries[0].transferSize;
          } else {
            return 0;
          }
        }
      };

      return (function(util) {
        var advice = {},
          errors = {};


        var accessibilityResults = {},
          accessibilityErrors = {};

        try {
          accessibilityResults["altImages"] = (function(util) {
            'use strict';

            var images = Array.prototype.slice.call(window.document.getElementsByTagName('img'));
            var score = 0;
            var offending = [];
            var missing = 0;
            var tooLong = 0;
            var advice = '';
            var unique = {};

            images.forEach(function(image) {
              if (!image.alt || image.alt === '') {
                score += 10;
                missing++;
                if (image.src) {
                  offending.push(image.src);
                  unique[image.src] = 1;
                }
              }
              //  because of restrictions within the JAWS screen reader
              else if (image.alt && image.alt.length > 125) {
                score += 5;
                offending.push(image.src);
                tooLong++;
              }
            });

            if (missing > 0) {
              advice = 'The page has ' + missing + ' image' + util.plural(missing) + ' that lack alt attribute(s) and ' + Object.keys(unique).length + ' of them are unique.'
            }
            if (tooLong > 0) {
              advice += 'The page has ' + tooLong + ' image' + util.plural(tooLong) + ' where the alt text are too long (longer than 125 characters).'
            }

            return {
              id: 'altImages',
              title: 'Always use alt attribute on image tags',
              description: 'All img tags require an alt attribute. This goes without exception. Everything else is an error. If you have an img tag in your HTML without an alt attribute, add it now. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/',
              advice: advice,
              score: Math.max(0, 100 - score),
              weight: 5,
              offending: offending,
              tags: ['accessibility', 'images']
            };

          })(util);

        } catch (err) {
          accessibilityErrors["altImages"] = err.message;
        }
        try {
          accessibilityResults["headings"] = (function() {
            'use strict';
            var headings = ['h6', 'h5', 'h4', 'h3', 'h2', 'h1'];
            var score = 0;
            var totalHeadings = 0;
            var message = '';
            headings.forEach(function(heading) {
              totalHeadings += Array.prototype.slice.call(window.document.getElementsByTagName(heading)).length;
            });

            if (totalHeadings === 0) {
              score = 100;
              message = 'The page is missing headings. Use them to get a better structure of your content.';
            } else {
              var hadLowerHeading = false,
                messages = [];

              headings.forEach(function(heading) {
                var tags = Array.prototype.slice.call(window.document.getElementsByTagName(heading));
                if (hadLowerHeading && tags.length === 0) {
                  score += 10;
                  messages.push('The page is missing a ' + heading + ' and has heading(s) with lower priority.');
                }
                if (tags.length > 0) {
                  hadLowerHeading = true;
                }
              });

              message = messages.join(' ');
            }

            return {
              id: 'headings',
              title: 'Use headings tags to structure your page',
              description: 'Headings gives your document a logical, easy to follow structure. Have you ever wondered how Wikipedia puts together its table of contents for each article? They use the logical heading structure for that, too! The H1 through H6 elements are unambiguous in telling screen readers, search engines and other technologies what the structure of your document is. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/',
              advice: message,
              score: Math.max(0, 100 - score),
              weight: 4,
              offending: [],
              tags: ['accessibility', 'html']
            };

          })();

        } catch (err) {
          accessibilityErrors["headings"] = err.message;
        }
        try {
          accessibilityResults["labelOnInput"] = (function() {
            'use strict';

            function getMatchingLabel(id, labels) {
              return labels.filter(function(entry) {
                return (entry.for && entry.for === id);
              });
            }

            var labels = Array.prototype.slice.call(window.document.getElementsByTagName('label'));

            var score = 0;
            var offending = [];
            var inputs = Array.prototype.slice.call(window.document.getElementsByTagName('input'));
            inputs.forEach(function(input) {
              if (input.type === 'text' || input.type === 'password' || input.type === 'radio' || input.type === 'checkbox' || input.type === 'search') {

                // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
                if (input.parentElement.nodeName != 'LABEL' && (input.id && getMatchingLabel(input.id, labels).length === 0)) {
                  score += 10;
                }
              }
            });
            return {
              id: 'labelOnInput',
              title: 'Always set labels on input in forms',
              description: 'Most input elements, as well as the select and textarea elements, need an associated label element that states their purpose. The only exception is those that produce a button, like the reset and submit buttons do. Others, be it text, checkbox, password, radio (button), search etc. require a label element to be present. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/',
              advice: score > 0 ? 'There are ' + score / 10 + ' input(s) that are missing labels on a form.' : '',
              score: Math.max(0, 100 - score),
              weight: 3,
              offending: offending,
              tags: ['accessibility', 'form']
            };

          })();

        } catch (err) {
          accessibilityErrors["labelOnInput"] = err.message;
        }
        try {
          accessibilityResults["landmarks"] = (function() {
            'use strict';

            var landmarks = ['article', 'aside', 'footer', 'header', 'nav', 'main'];
            var totalLandmarks = 0;
            landmarks.forEach(function(landmark) {
              totalLandmarks += Array.prototype.slice.call(window.document.getElementsByTagName(landmark)).length;
            });

            return {
              id: 'landmarks',
              title: 'Structure your content by using landmarks',
              description: 'Landmarks can be article, aside, footer, header, nav or main tag. Adding such landmarks appropriately can help further provide sense to your document and help users more easily navigate it. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/',
              advice: totalLandmarks === 0 ? 'The page doesn\'t use any landmarks.' : '',
              score: totalLandmarks > 0 ? 100 : 0,
              weight: 5,
              offending: [],
              tags: ['accessibility', 'html']
            };

          })();

        } catch (err) {
          accessibilityErrors["landmarks"] = err.message;
        }
        try {
          accessibilityResults["neverSuppressZoom"] = (function(util) {
            'use strict';

            var metas = Array.prototype.slice.call(document.querySelectorAll('meta[name][content]'));
            metas = metas.filter(util.caseInsensitiveAttributeValueFilter('name', 'viewport'));

            var score = 100;
            var offending = [];
            metas.forEach(function(meta) {
              if (meta.content.indexOf('user-scalable=no') > -1 || meta.content.indexOf('initial-scale=1.0; maximum-scale=1.0') > -1) {
                score = 0;
                offending.push(meta.content);
              }
            });

            return {
              id: 'neverSuppressZoom',
              title: 'Don\'t suppress pinch zoom',
              description: 'A key feature of mobile browsing is being able to zoom in to read content and out to locate content within a page. http://www.iheni.com/mobile-accessibility-tip-dont-suppress-pinch-zoom/',
              advice: score === 0 ? 'What! The page suppresses zooming, you really shouldn\'t do that.' : '',
              score: score,
              weight: 8,
              offending: offending,
              tags: ['accessibility']
            };

          })(util);

        } catch (err) {
          accessibilityErrors["neverSuppressZoom"] = err.message;
        }
        try {
          accessibilityResults["sections"] = (function() {
            'use strict';
            var headings = ['h6', 'h5', 'h4', 'h3', 'h2', 'h1'];
            var score = 0;
            var message = '';
            var sections = Array.prototype.slice.call(window.document.getElementsByTagName('section'));
            var totalSections = sections.length;

            if (totalSections === 0) {
              message = 'The page doesn\'t use sections. You could use them to get a better structure of your content.';
              score = 100;
            } else {
              sections.forEach(function(section) {
                var hasHeading = false;
                headings.forEach(function(heading) {
                  var tags = Array.prototype.slice.call(section.getElementsByTagName(heading));
                  if (tags.length > 0) {
                    hasHeading = true;
                  }
                });
                if (!hasHeading) {
                  score += 10;
                }
              })
              if (score > 0) {
                message = 'The page is missing heading(s) within a section tag on the page. It happens ' + score / 10 + ' times.';
              }
            }

            return {
              id: 'sections',
              title: 'Use headings tags within section tags to better structure your page',
              description: 'Section tags should have at least one heading element as a direct descendant.',
              advice: message,
              score: Math.max(0, 100 - score),
              weight: 0,
              offending: [],
              tags: ['accessibility', 'html']
            };

          })();

        } catch (err) {
          accessibilityErrors["sections"] = err.message;
        }
        try {
          accessibilityResults["table"] = (function() {
            'use strict';

            var tables = Array.prototype.slice.call(window.document.getElementsByTagName('table'));
            var score = 0;
            var offending = [];
            tables.forEach(function(table) {
              // we are missing a caption
              if (table.getElementsByTagName('caption').length === 0) {
                score += 5;
                if (table.id) {
                  offending.push(table.id);
                }
              }
              var trs = table.getElementsByTagName('tr');
              if (trs[0] && trs[0].getElementsByTagName('th').length === 0) {
                score += 5;
                if (table.id) {
                  offending.push(table.id);
                }
              }

            });

            return {
              id: 'table',
              title: 'Use caption and th in tables',
              description: 'Add a caption element to give the table a proper heading or summary. Use th elements to denote column and row headings. Make use of their scope and other attributes to clearly associate what belongs to which. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/',
              advice: score > 0 ? 'The page has tables that are missing caption, please use them to give them a proper heading or summary.' : '',
              score: Math.max(0, 100 - score),
              weight: 5,
              offending: offending,
              tags: ['accessibility', 'html']
            };

          })();

        } catch (err) {
          accessibilityErrors["table"] = err.message;
        }

        advice["accessibility"] = {
          'adviceList': accessibilityResults
        };
        if (Object.keys(accessibilityErrors).length > 0) {
          errors["accessibility"] = accessibilityErrors;
        }



        var bestpracticeResults = {},
          bestpracticeErrors = {};

        try {
          bestpracticeResults["charset"] = (function() {
            'use strict';
            var score = 100;
            var message = '';
            var charSet = document.characterSet;
            if (charSet === null) {
              message = 'The page is missing a character set. If you use Chrome/Firefox we know you are missing it, if you use another browser, it well could be an implementation problem.';
              score = 0;
            } else if (charSet !== 'UTF-8') {
              message = 'You are not using charset UTF-8?';
              score = 50;
            }
            return {
              id: 'charset',
              title: 'Use charset for your document',
              description: 'The Unicode Standard (UTF-8) covers (almost) all the characters, punctuations, and symbols in the world. Please use that.',
              advice: message,
              score: score,
              weight: 2,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["charset"] = err.message;
        }
        try {
          bestpracticeResults["doctype"] = (function() {
            'use strict';
            var score = 100;
            var message = '';
            var docType = document.doctype;
            if (docType === null) {
              message = 'The page is missing a doc type. Please use <!DOCTYPE html>';
              score = 0;
            } else if (document.firstChild.nodeType !== 10) {
              message = 'The page should have the the doctype declaration first in the HTML file and it should be declared using HTML5 standard: <!DOCTYPE html>';
              score = 50;
            }


            return {
              id: 'doctype',
              title: 'Use a doctype for your document',
              description: 'The <!DOCTYPE> declaration is not an HTML tag; it is an instruction to the web browser about what version of HTML the page is written in.',
              advice: message,
              score: score,
              weight: 2,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["doctype"] = err.message;
        }
        try {
          bestpracticeResults["https"] = (function() {
            'use strict';
            var url = document.URL;
            var score = 100;
            var message = '';
            if (url.indexOf('https://') === -1) {
              score = 0;
              message = 'What!! The page is not using HTTPS. Every unencrypted HTTP request reveals information about user’s behavior, read more about it at https://https.cio.gov/everything/. You can get a totally free SSL/TLS certificate from https://letsencrypt.org/.';
            }

            return {
              id: 'https',
              title: 'Serve your content secure',
              description: 'A page should always use HTTPS ( https://https.cio.gov/everything/). Plus you will need it for HTTP/2!',
              advice: message,
              score: score,
              weight: 10,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["https"] = err.message;
        }
        try {
          bestpracticeResults["httpsH2"] = (function() {
            'use strict';
            var url = document.URL;
            var connectionType = util.getConnectionType();
            var score = 100;
            var message = '';
            if (url.indexOf('https://') > -1 && connectionType.indexOf('h2') === -1) {
              score = 0;
              message = 'The page is using HTTPS but not HTTP/2. Change to HTTP/2 to follow new best practice and make the site faster.';
            }

            return {
              id: 'httpsH2',
              title: 'Serve your content secure and use HTTP/2',
              description: 'Using HTTP/2 together with HTTPS is the new best practice.',
              advice: message,
              score: score,
              weight: 2,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["httpsH2"] = err.message;
        }
        try {
          bestpracticeResults["language"] = (function() {
            'use strict';
            var html = document.getElementsByTagName('html');
            if (html.length > 0) {
              var language = html[0].getAttribute('lang');
              var score = 100;
              var message = '';
              if (language === null) {
                score = 0;
                message = 'The page is missing a language definition in the HTML tag. Define it <html lang="YOUR_LANGUAGE_CODE"> '
              }
            } else {
              score = 0;
              message = 'What! The page is missing the HTML tag!';
            }

            return {
              id: 'language',
              title: 'Set the language code for your document',
              description: 'According to the W3C recommendation you should declare the primary language for each Web page with the lang attribute inside the <html> tag. https://www.w3.org/International/questions/qa-html-language-declarations#basics',
              advice: message,
              score: score,
              weight: 3,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["language"] = err.message;
        }
        try {
          bestpracticeResults["metaDescription"] = (function(util) {
            'use strict';
            var maxLength = 155;
            var score = 100;
            var message = '';
            var metas = Array.prototype.slice.call(document.querySelectorAll('meta[name][content]'));
            metas = metas.filter(util.caseInsensitiveAttributeValueFilter('name', 'description'));

            var description = metas.length > 0 ? metas[0].getAttribute('content') : '';
            if (description.length === 0) {
              message = 'The page is missing a meta description.';
              score = 0;
            } else if (description.length > maxLength) {
              message = 'The meta description is too long. It has ' + description.length + ' characters, the recommended max is ' + maxLength;
              score = 50;
            }

            // http://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf
            // https://d2eeipcrcdle6.cloudfront.net/seo-cheat-sheet.pdf

            return {
              id: 'metaDescription',
              title: 'Meta description',
              description: 'Use a page description to make the page more relevant for a search engine',
              advice: message,
              score: score,
              weight: 5,
              offending: [],
              tags: ['bestpractice']
            };
          })(util);

        } catch (err) {
          bestpracticeErrors["metaDescription"] = err.message;
        }
        try {
          bestpracticeResults["optimizely"] = (function(util) {
            'use strict';
            var score = 100;
            var scripts = util.getSynchJSFiles(document.head);
            var advice = '';
            var offending = [];
            scripts.forEach(function(script) {
              if (util.getHostname(script) === 'cdn.optimizely.com') {
                offending.push(script);
                score = 0;
                advice = 'The page is using Optimizely. Use it with care because it hurts your performance. Only turn it on (= load the javascript) when you run your A/B tests. Then when you are finished make sure to turn it off.';
              }
            });

            return {
              id: 'optimizely',
              title: 'Only use optimizely when you need it',
              description: 'Use Optimizely with care because it hurts your performance. Only turn it on (= load the javascript) when you run your A/B tests',
              advice: advice,
              score: score,
              weight: 2,
              offending: offending,
              tags: ['bestpractice']
            };
          })(util);

        } catch (err) {
          bestpracticeErrors["optimizely"] = err.message;
        }
        try {
          bestpracticeResults["pageTitle"] = (function() {
            'use strict';
            var max = 60;
            var score = 100;
            var message = '';
            var title = document.title;
            if (title.length === 0) {
              message = 'The page is missing a title.';
              score = 0;

            } else if (title.length > max) {
              message = 'The title is too long by ' + (title.length - max) + ' characters. The recommended max is ' + max;
              score = 50;
            }

            return {
              id: 'pageTitle',
              title: 'Page title',
              description: 'Use a title to make the page more relevant for a search engine.',
              advice: message,
              score: score,
              weight: 5,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["pageTitle"] = err.message;
        }
        try {
          bestpracticeResults["spdy"] = (function() {
            'use strict';
            var connectionType = util.getConnectionType();
            var score = 100;
            var message = '';
            if (connectionType.indexOf('spdy') !== -1) {
              score = 0;
              message = 'The page is using SPDY. Chrome dropped support for SPDY in Chrome 51. Change to HTTP/2 asap.';
            }

            return {
              id: 'spdy',
              title: 'EOL for SPDY in Chrome',
              description: 'Chrome dropped supports for SPDY in Chrome 51, upgrade to H2 asap.',
              advice: message,
              score: score,
              weight: 1,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["spdy"] = err.message;
        }
        try {
          bestpracticeResults["url"] = (function() {
            'use strict';
            var score = 100;
            var message = '';
            var url = document.URL;

            // ok all Java lovers, please do not use the sessionid in your URLS
            if (url.indexOf('?') > -1 && (url.indexOf('jsessionid') > url.indexOf('?'))) {
              score = 0;
              message = 'The page has the session id for the user as a parameter, please change so the session handling is done only with cookies. ';
            }

            var parameters = (url.match(/&/g) || []).length;
            if (parameters > 1) {
              score -= 50;
              message += 'The page is using more than two request parameters. You should really rethink and try to minimize the number of parameters. ';
            }

            if (url.length > 100) {
              score -= 10;
              message += 'The URL is ' + url.length + ' characters long. Try to make it less than 100 characters. '
            }

            if (url.indexOf(' ') > -1 || url.indexOf('%20') > -1) {
              score -= 10;
              message += 'Could the developer or the CMS be on Windows? Avoid using spaces in the URLs, use hyphens or underscores. '
            }

            return {
              id: 'url',
              title: 'Have a good URL format',
              description: 'A clean URL is good for the user and for SEO. Make them human readable, avoid too long URLs, spaces in the URL, too many request parameters, and never ever have the session id in your URL.',
              advice: message,
              score: score < 0 ? 0 : score,
              weight: 2,
              offending: [],
              tags: ['bestpractice']
            };
          })();

        } catch (err) {
          bestpracticeErrors["url"] = err.message;
        }

        advice["bestpractice"] = {
          'adviceList': bestpracticeResults
        };
        if (Object.keys(bestpracticeErrors).length > 0) {
          errors["bestpractice"] = bestpracticeErrors;
        }



        var infoResults = {},
          infoErrors = {};

        try {
          infoResults["amp"] = (function() {
            'use strict';
            var html = document.getElementsByTagName('html')[0];
            if (html && html.getAttribute('amp-version')) {
              return html.getAttribute('amp-version');
            } else {
              return false;
            }
          })();

        } catch (err) {
          infoErrors["amp"] = err.message;
        }
        try {
          infoResults["browser"] = (function() {
            'use strict';
            var browser = 'unknown';
            var match = window.navigator.userAgent.match(/(Chrome|Firefox)\/(\S+)/);
            browser = match ? match[1] + ' ' + match[2] : browser;
            return browser;
          })();

        } catch (err) {
          infoErrors["browser"] = err.message;
        }
        try {
          infoResults["connectionType"] = (function(util) {
            'use strict';
            return util.getConnectionType();
          })(util);

        } catch (err) {
          infoErrors["connectionType"] = err.message;
        }
        try {
          infoResults["documentHeight"] = (function() {
            'use strict';
            return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
          })();

        } catch (err) {
          infoErrors["documentHeight"] = err.message;
        }
        try {
          infoResults["documentTitle"] = (function() {
            'use strict';
            return document.title;
          })();

        } catch (err) {
          infoErrors["documentTitle"] = err.message;
        }
        try {
          infoResults["documentWidth"] = (function() {
            'use strict';
            return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
          })();

        } catch (err) {
          infoErrors["documentWidth"] = err.message;
        }
        try {
          infoResults["domDepth"] = (function() {
            'use strict';

            function domDepth(document) {
              var aElems = document.getElementsByTagName('*');
              var i = aElems.length;
              var totalParents = 0;
              var maxParents = 0;
              while (i--) {
                var parents = numParents(aElems[i]);
                if (parents > maxParents) {
                  maxParents = parents;
                }
                totalParents += parents;
              }
              var average = totalParents / aElems.length;
              return {
                avg: average,
                max: maxParents
              };
            }

            function numParents(elem) {
              var n = 0;
              if (elem.parentNode) {
                while ((elem = elem.parentNode)) {
                  n++;
                }
              }
              return n;
            }
            var depth = domDepth(document);
            return {
              avg: Math.round(depth.avg),
              max: depth.max
            };
          })();

        } catch (err) {
          infoErrors["domDepth"] = err.message;
        }
        try {
          infoResults["domElements"] = (function() {
            'use strict';
            return document.getElementsByTagName('*').length;
          })();

        } catch (err) {
          infoErrors["domElements"] = err.message;
        }
        try {
          infoResults["head"] = (function(util) {
            'use strict';
            /*
              Get requests inside of head that will influence the start render
            */
            return {
              jssync: util.getSynchJSFiles(document.head),
              jsasync: util.getAsynchJSFiles(document.head),
              css: util.getCSSFiles(document.head)
            };
          })(util);

        } catch (err) {
          infoErrors["head"] = err.message;
        }
        try {
          infoResults["iframes"] = (function() {
            'use strict';
            return document.getElementsByTagName('iframe').length;
          })();

        } catch (err) {
          infoErrors["iframes"] = err.message;
        }
        try {
          infoResults["localStorageSize"] = (function() {
            'use strict';

            function storageSize(storage) {
              // if local storage is disabled
              if (storage) {
                var keys = storage.length || Object.keys(storage).length;
                var bytes = 0;
                for (var i = 0; i < keys; i++) {
                  var key = storage.key(i);
                  var val = storage.getItem(key);
                  bytes += key.length + val.length;
                }
                return bytes;
              } else return 0;
            }
            return storageSize(window.localStorage);
          })();

        } catch (err) {
          infoErrors["localStorageSize"] = err.message;
        }
        try {
          infoResults["resourceHints"] = (function(util) {
            'use strict';
            return {
              'dns-prefetch': util.getResourceHintsHrefs('dns-prefetch'),
              preconnect: util.getResourceHintsHrefs('preconnect'),
              prefetch: util.getResourceHintsHrefs('prefetch'),
              prerender: util.getResourceHintsHrefs('prerender')
            };
          })(util);

        } catch (err) {
          infoErrors["resourceHints"] = err.message;
        }
        try {
          infoResults["responsive"] = (function() {
            'use strict';

            // we now do the same check as WebPageTest
            var isResponsive = true;
            var bsw = document.body.scrollWidth;
            var wiw = window.innerWidth;
            if (bsw > wiw)
              isResponsive = false;
            var nodes = document.body.children;
            for (var i in nodes) {
              if (nodes[i].scrollWidth > wiw)
                isResponsive = false;
            }

            return isResponsive;
          })();

        } catch (err) {
          infoErrors["responsive"] = err.message;
        }
        try {
          infoResults["sessionStorageSize"] = (function() {
            'use strict';

            function storageSize(storage) {
              var keys = storage.length || Object.keys(storage).length;
              var bytes = 0;
              for (var i = 0; i < keys; i++) {
                var key = storage.key(i);
                var val = storage.getItem(key);
                bytes += key.length + val.length;
              }
              return bytes;
            }
            return storageSize(window.sessionStorage);
          })();

        } catch (err) {
          infoErrors["sessionStorageSize"] = err.message;
        }
        try {
          infoResults["windowSize"] = (function() {
            'use strict';
            var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            return width + 'x' + height;
          })();

        } catch (err) {
          infoErrors["windowSize"] = err.message;
        }

        advice["info"] = infoResults;
        if (Object.keys(infoErrors).length > 0) {
          errors["info"] = infoErrors;
        }



        var performanceResults = {},
          performanceErrors = {};

        try {
          performanceResults["avoidScalingImages"] = (function(util) {
            'use strict';
            var message = '';
            var minLimit = 100;
            var score = 0;
            var offending = [];
            var images = Array.prototype.slice.call(document.getElementsByTagName('img'));
            for (var i = 0; i < images.length; i++) {
              var img = images[i];
              // skip images that are 0 (carousel etc)
              if ((img.clientWidth + minLimit) < img.naturalWidth && img.clientWidth > 0) {
                // message = message + ' ' + util.getAbsoluteURL(img.currentSrc) + ' [browserWidth:' + img.clientWidth + ' naturalWidth: ' + img.naturalWidth +']';
                offending.push(util.getAbsoluteURL(img.currentSrc));
                score += 10;
              }
            }

            if (score > 0) {
              message = 'The page has ' + (score / 10) + ' image(s) that are scaled more than ' + minLimit + ' pixels. It would be better if those images are sent so the browser don\'t need to scale them.';
            }

            return {
              id: 'avoidScalingImages',
              title: 'Don\'t scale images in the browser',
              description: 'Scaling images inside the browser takes extra CPU time and will hurt performance on mobile as well as make your users download extra kilobytes',
              advice: message,
              score: Math.max(0, 100 - score),
              weight: 5,
              offending: offending,
              tags: ['performance', 'image']
            };
          })(util);

        } catch (err) {
          performanceErrors["avoidScalingImages"] = err.message;
        }
        try {
          performanceResults["cssPrint"] = (function(util) {
            'use strict';
            var offending = [];

            var links = document.getElementsByTagName('link');
            for (var i = 0, len = links.length; i < len; i += 1) {
              if (links[i].media === 'print') {
                offending.push(util.getAbsoluteURL(links[i].href));
              }
            }

            var score = offending.length * 10;

            return {
              id: 'cssPrint',
              title: 'Do not load print stylesheets, use @media type print instead',
              description: 'Loading a specific stylesheet for printing slows down the page, even though it is not used',
              advice: offending.length > 0 ? 'The page has ' + offending.length + ' print stylesheets. You should include that stylesheet using @media type print instead.' : '',
              score: Math.max(0, 100 - score),
              weight: 1,
              offending: offending,
              tags: ['performance', 'css']
            };

          })(util);

        } catch (err) {
          performanceErrors["cssPrint"] = err.message;
        }
        try {
          performanceResults["fastRender"] = (function(util) {
            'use strict';
            var message = '',
              score = 0,
              offending = [],
              styles = util.getCSSFiles(document.head),
              scripts = util.getSynchJSFiles(document.head),
              docDomain = document.domain,
              domains = [],
              blockingCSS = 0,
              blockingJS = 0,
              // TODO do the preconnect really matter when you are inside of head?
              preconnects = util.getResourceHintsHrefs('preconnect'),
              preconnectDomains = preconnects.map(function(preconnect) {
                return util.getHostname(preconnect);
              });

            function testByType(assetUrl) {
              var domain = util.getHostname(assetUrl);
              // if it is from different domain or not
              if (domain !== docDomain) {
                offending.push(assetUrl);
                // is this the first time this domain is used?
                if (!util.exists(domain, domains)) {
                  // hurt depending on if it's preconnected or not
                  score += util.exists(domain, preconnectDomains) ? 5 : 10;
                  domains.push(domain);
                }
                score += 5;
              } else {
                offending.push(assetUrl);
                score += 5;
              }
            }

            // TODO do we have a way to check if we different domains act as one for H2?
            // know we don't even check it
            if (util.isHTTP2()) {
              if (styles.length > 0) {
                message = 'Make sure that the server pushes your CSS resources for faster rendering. ';
                // check the size
                styles.forEach(function(url) {
                  if (util.getTransferSize(url) > 14500) {
                    offending.push(url);
                    score += 5;
                    blockingCSS++;
                    message += 'The style ' + url + ' is larger than the magic number TCP window size 14.5 kB. Make the file smaller and the page will render faster. '
                  }

                })
              }
              if (scripts.length > 0) {
                score += scripts.length * 10;
                scripts.forEach(function(url) {
                  offending.push(url);
                  blockingJS++;
                });
                message += 'Avoid loading synchronously Javascript inside of head, you shouldn\'t need Javascript to render your page!';
              }
            }
            // we are using HTTP/1
            else {
              styles.forEach(function(style) {
                testByType(style);
              });
              blockingCSS = styles.length;
              scripts.forEach(function(script) {
                testByType(script);
              });
              blockingJS = scripts.length;

            }

            if (offending.length > 0) {
              message += 'The page has ' + blockingCSS + ' render blocking CSS request(s) and ' + blockingJS + ' blocking Javascript request(s) inside of head.';
            }


            return {
              id: 'fastRender',
              title: 'Avoid slowing down the rendering critical path',
              description: 'Every file requested inside of head will postpone the rendering of the page. Try to avoid loading Javascript synchronously, request files from the same domain as the main document, and inline CSS or server push for really fast rendering.',
              advice: message,
              score: Math.max(0, 100 - score),
              weight: 10,
              offending: offending,
              tags: ['performance']
            };
          })(util);

        } catch (err) {
          performanceErrors["fastRender"] = err.message;
        }
        try {
          performanceResults["inlineCss"] = (function() {
            'use strict';
            var message = '';
            var score = 0;
            var offending = [];

            var cssFilesInHead = util.getCSSFiles(document.head);
            var styles = Array.prototype.slice.call(window.document.head.getElementsByTagName('style'));

            // if we use HTTP/2, do CSS request in head and inline CSS
            if (util.isHTTP2() && cssFilesInHead.length > 0 && styles.length > 0) {
              score += 5;
              message = 'The page both inline CSS and do CSS request even though it uses a HTTP/2ish connection. Make sure you are using server push for your CSS files (when your server supports push). If you have many users on slow connections, it can be better to only inline the CSS. Run your own tests and check the waterfall graph to see what happens.';
            }

            // If we got inline styles with HTTP/2 recommend that we push CSS responses instead if  ...
            else if (util.isHTTP2() && styles.length > 0 && cssFilesInHead.length === 0) {
              message += 'The page inline CSS and uses HTTP/2. Do you have a lot of users with slow connections on the site, it is good to inline CSS when using HTTP/2. If not and your server supports server push, use it to push the CSS files instead.'
            }
            // we have HTTP/2 and do CSS requests in HEAD.
            else if (util.isHTTP2() && cssFilesInHead.length > 0) {
              message += 'Make sure you push the CSS requests inside of HEAD (if your server supports push). Else it\'s better to inline the CSS.'
            }

            // If we have HTTP/1
            if (!util.isHTTP2()) {
              // and files served inside of head, let inline them instead
              if (cssFilesInHead.length > 0 && styles.length === 0) {
                score += 10 * cssFilesInHead.length;
                message = 'The page loads ' + cssFilesInHead.length + ' CSS request(s) inside of head, try to inline the CSS for first render and lazy load the rest. ';
                offending.push.apply(offending, cssFilesInHead);
              }
              // if we inline CSS and request CSS files inside of head
              if (styles.length > 0 && cssFilesInHead.length > 0) {
                score += 10;
                message += 'The page has both inline styles as well as it is requesting ' + cssFilesInHead.length + ' CSS file(s) inside of head. Let\'s only inline CSS for really fast render.';
                offending.push.apply(offending, cssFilesInHead);
              }
            }

            return {
              id: 'inlineCss',
              title: 'Inline CSS for faster first render on HTTP/1',
              description: 'Always inline the CSS when you use HTTP/1. Using HTTP/2 it is complicated. Do your users have a slow connection? Then it\s better to inline.',
              advice: message,
              score: Math.max(0, 100 - score),
              weight: 7,
              offending: offending,
              tags: ['performance', 'css']
            };
          })();

        } catch (err) {
          performanceErrors["inlineCss"] = err.message;
        }
        try {
          performanceResults["jquery"] = (function() {
            'use strict';
            var versions = [];
            // check that we got an JQuery
            if (typeof window.jQuery == 'function') {
              versions.push(window.jQuery.fn.jquery);
              var old = window.jQuery;
              while (old.fn && old.fn.jquery) {
                old = window.jQuery.noConflict(true);
                if ((!window.jQuery) || (!window.jQuery.fn)) break;
                if (old.fn.jquery === window.jQuery.fn.jquery) {
                  break;
                }
                versions.push(window.jQuery.fn.jquery);
              }
            }

            // TODO also add check for JQuery version. If we have a really old version (1 year old?) then show it!

            return {
              id: 'jquery',
              title: 'Avoid use more than one JQuery version per page',
              description: 'You may not think this is true, but there are pages that uses more than one JQuery versions.',
              advice: versions.length > 1 ? 'The page uses ' + versions.length + ' versions of JQuery! You only need at max one, so if please remove the other version(s).' : '',
              score: versions.length > 1 ? 0 : 100,
              weight: 4,
              offending: versions,
              tags: ['JQuery', 'performance']
            };

          })();

        } catch (err) {
          performanceErrors["jquery"] = err.message;
        }
        try {
          performanceResults["spof"] = (function(util) {
            'use strict';
            var score = 0;
            var offending = [];
            var offendingDomains = [];

            // simplify and only look for css & js spof
            var docDomain = document.domain;

            // do we have any CSS loaded inside of head from a different domain?
            var styles = util.getCSSFiles(document.head);
            styles.forEach(function(style) {
              var styleDomain = util.getHostname(style);
              if (styleDomain !== docDomain) {
                offending.push(style);
                if (offendingDomains.indexOf(styleDomain) === -1) {
                  offendingDomains.push(styleDomain);
                  score += 10;
                }
              }
            });

            // do we have any JS loaded inside of head from a different domain?
            var scripts = util.getSynchJSFiles(document.head);
            scripts.forEach(function(script) {
              var scriptDomain = util.getHostname(script);
              if (scriptDomain !== docDomain) {
                offending.push(script);
                if (offendingDomains.indexOf(scriptDomain) === -1) {
                  offendingDomains.push(scriptDomain);
                  score += 10;
                }
              }
            });

            return {
              id: 'spof',
              title: 'Avoid Frontend single point of failure',
              description: 'A page should not have a single point of failure a.k.a load content from a provider that can cause the page to stop working.',
              advice: offending.length > 0 ? 'The page has ' + offending.length + ' requests inside of head that can cause a SPOF. Load them async or move them outside of head.' : '',
              score: Math.max(0, 100 - score),
              weight: 7,
              offending: offending,
              tags: ['performance', 'css', 'js']
            };
          })(util);

        } catch (err) {
          performanceErrors["spof"] = err.message;
        }
        try {
          performanceResults["thirdPartyAsyncJs"] = (function(util) {
            'use strict';
            var patterns = [
              'ajax.googleapis.com',
              'apis.google.com',
              '.google-analytics.com',
              'connect.facebook.net',
              'platform.twitter.com',
              'code.jquery.com',
              'platform.linkedin.com',
              '.disqus.com',
              'assets.pinterest.com',
              'widgets.digg.com',
              '.addthis.com',
              'code.jquery.com',
              'ad.doubleclick.net',
              '.lognormal.com',
              'embed.spotify.com'
            ];

            function is3rdParty(url) {
              var hostname = util.getHostname(url);
              var re;
              for (var i = 0; i < patterns.length; i++) {
                re = new RegExp(patterns[i]);
                if (re.test(hostname)) {
                  return true;
                }
              }
              return false;
            }
            var score = 0;
            var offending = [];
            var scripts = util.getSynchJSFiles(document);

            for (var i = 0, len = scripts.length; i < len; i++) {
              if (is3rdParty(scripts[i])) {
                offending.push(scripts[i]);
                score += 10;
              }
            }

            return {
              id: 'thirdPartyAsyncJs',
              title: 'Always load third party Javascript asynchronously',
              description: 'Use JavaScript snippets that load the JS files asynchronously in order to speed up the user experience and avoid blocking the initial load.',
              advice: offending.length > 0 ? 'The page has ' + offending.length + ' synchronous 3rd party Javascript request(s). Change it to be asynchronous instead.' : '',
              score: Math.max(0, 100 - score),
              weight: 5,
              offending: offending,
              tags: ['performance', 'js']
            };
          })(util);

        } catch (err) {
          performanceErrors["thirdPartyAsyncJs"] = err.message;
        }
        try {
          performanceResults["userTiming"] = (function() {
            'use strict';
            var doWeUseUserTimingAPI = false;
            var message = 'Start using the User Timing API to measure specifics metrics for your page.';
            if (window.performance && window.performance.getEntriesByType) {
              if (window.performance.getEntriesByType('measure').length > 0 ||
                window.performance.getEntriesByType('mark').length > 0) {
                doWeUseUserTimingAPI = true;
                message = '';
              }
            } else {
              message = 'NOTE: User timing is not supported in this browser.';
            }

            return {
              id: 'userTiming',
              title: 'Use the User Timing API to check your performance',
              description: 'The User Timing API is a perfect way to start measuring specific and custom metrics for your site.',
              advice: message,
              score: doWeUseUserTimingAPI ? 100 : 0,
              weight: 1,
              offending: [],
              tags: ['performance']
            };
          })();

        } catch (err) {
          performanceErrors["userTiming"] = err.message;
        }

        advice["performance"] = {
          'adviceList': performanceResults
        };
        if (Object.keys(performanceErrors).length > 0) {
          errors["performance"] = performanceErrors;
        }



        var timingsResults = {},
          timingsErrors = {};

        try {
          timingsResults["firstPaint"] = (function() {
            var firstPaint, timing = window.performance.timing;

            if (window.chrome && window.chrome.loadTimes) {
              var loadTimes = window.chrome.loadTimes();
              firstPaint = (loadTimes.firstPaintTime - loadTimes.requestTime) * 1000;

              if (firstPaint > 0) {
                return firstPaint;
              }
            } else if (typeof timing.msFirstPaint === 'number') {
              firstPaint = timing.msFirstPaint - timing.navigationStart;

              if (firstPaint > 0) {
                return firstPaint;
              }
            }

            return undefined;
          })();

        } catch (err) {
          timingsErrors["firstPaint"] = err.message;
        }
        try {
          timingsResults["fullyLoaded"] = (function() {
            // lets use the Resource Timing API, so it is important that we run
            // this after all request/responses finished
            if (window.performance && window.performance.getEntriesByType) {
              var resources = window.performance.getEntriesByType('resource');
              var max = 0;

              for (var i = 1; i < resources.length; i++) {
                if (resources[i].responseEnd > max) {
                  max = resources[i].responseEnd;
                }
              }
              return max;
            } else {
              return -1;
            }
          })();

        } catch (err) {
          timingsErrors["fullyLoaded"] = err.message;
        }
        try {
          timingsResults["navigationTimings"] = (function() {
            var t = window.performance.timing;
            var metrics = {
              navigationStart: 0,
              unloadEventStart: t.unloadEventStart > 0 ? t.unloadEventStart - t.navigationStart : undefined,
              unloadEventEnd: t.unloadEventEnd > 0 ? t.unloadEventEnd - t.navigationStart : undefined,
              redirectStart: t.redirectStart > 0 ? t.redirectStart - t.navigationStart : undefined,
              redirectEnd: t.redirectEnd > 0 ? t.redirectEnd - t.navigationStart : undefined,
              fetchStart: t.fetchStart - t.navigationStart,
              domainLookupStart: t.domainLookupStart - t.navigationStart,
              domainLookupEnd: t.domainLookupEnd - t.navigationStart,
              connectStart: t.connectStart - t.navigationStart,
              connectEnd: t.connectEnd - t.navigationStart,
              secureConnectionStart: t.secureConnectionStart ? t.secureConnectionStart - t.navigationStart : undefined,
              requestStart: t.requestStart - t.navigationStart,
              responseStart: t.responseStart - t.navigationStart,
              responseEnd: t.responseEnd - t.navigationStart,
              domLoading: t.domLoading - t.navigationStart,
              domInteractive: t.domInteractive - t.navigationStart,
              domContentLoadedEventStart: t.domContentLoadedEventStart - t.navigationStart,
              domContentLoadedEventEnd: t.domContentLoadedEventEnd - t.navigationStart,
              domComplete: t.domComplete - t.navigationStart,
              loadEventStart: t.loadEventStart - t.navigationStart,
              loadEventEnd: t.loadEventEnd - t.navigationStart
            };

            // Selenium converts undefined to null so lets just remove
            // the undefined keys
            Object.keys(metrics).forEach(function(key) {
              if (metrics[key] === undefined) {
                delete metrics[key];
              }
            });

            return metrics;

          })();

        } catch (err) {
          timingsErrors["navigationTimings"] = err.message;
        }
        try {
          timingsResults["rumSpeedIndex"] = (function() {
            /******************************************************************************
             Copyright (c) 2014, Google Inc.
             All rights reserved.
             Redistribution and use in source and binary forms, with or without
             modification, are permitted provided that the following conditions are met:
             * Redistributions of source code must retain the above copyright notice,
             this list of conditions and the following disclaimer.
             * Redistributions in binary form must reproduce the above copyright notice,
             this list of conditions and the following disclaimer in the documentation
             and/or other materials provided with the distribution.
             * Neither the name of the <ORGANIZATION> nor the names of its contributors
             may be used to endorse or promote products derived from this software
             without specific prior written permission.
             THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
             AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
             IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
             DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
             FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
             DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
             SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
             CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
             OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
             OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
             ******************************************************************************/

            /******************************************************************************
             *******************************************************************************
             Calculates the Speed Index for a page by:
             - Collecting a list of visible rectangles for elements that loaded
             external resources (images, background images, fonts)
             - Gets the time when the external resource for those elements loaded
             through Resource Timing
             - Calculates the likely time that the background painted
             - Runs the various paint rectangles through the SpeedIndex calculation:
             https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index
             TODO:
             - Improve the start render estimate
             - Handle overlapping rects (though maybe counting the area as multiple paints
             will work out well)
             - Detect elements with Custom fonts and the time that the respective font
             loaded
             - Better error handling for browsers that don't support resource timing
             *******************************************************************************
             ******************************************************************************/

            var RUMSpeedIndex = function(win) {
              win = win || window;
              var doc = win.document;

              /****************************************************************************
               Support Routines
               ****************************************************************************/
              // Get the rect for the visible portion of the provided DOM element
              var GetElementViewportRect = function(el) {
                var intersect = false;
                if (el.getBoundingClientRect) {
                  var elRect = el.getBoundingClientRect();
                  intersect = {
                    'top': Math.max(elRect.top, 0),
                    'left': Math.max(elRect.left, 0),
                    'bottom': Math.min(elRect.bottom, (win.innerHeight || doc.documentElement.clientHeight)),
                    'right': Math.min(elRect.right, (win.innerWidth || doc.documentElement.clientWidth))
                  };
                  if (intersect.bottom <= intersect.top ||
                    intersect.right <= intersect.left) {
                    intersect = false;
                  } else {
                    intersect.area = (intersect.bottom - intersect.top) * (intersect.right - intersect.left);
                  }
                }
                return intersect;
              };

              // Check a given element to see if it is visible
              var CheckElement = function(el, url) {
                if (url) {
                  var rect = GetElementViewportRect(el);
                  if (rect) {
                    rects.push({
                      'url': url,
                      'area': rect.area,
                      'rect': rect
                    });
                  }
                }
              };

              // Get the visible rectangles for elements that we care about
              var GetRects = function() {
                // Walk all of the elements in the DOM (try to only do this once)
                var elements = doc.getElementsByTagName('*');
                var re = /url\((http.*)\)/ig;
                for (var i = 0; i < elements.length; i++) {
                  var el = elements[i];
                  var style = win.getComputedStyle(el);

                  // check for Images
                  if (el.tagName == 'IMG') {
                    CheckElement(el, el.src);
                  }
                  // Check for background images
                  if (style['background-image']) {
                    re.lastIndex = 0;
                    var matches = re.exec(style['background-image']);
                    if (matches && matches.length > 1)
                      CheckElement(el, matches[1]);
                  }
                  // recursively walk any iFrames
                  if (el.tagName == 'IFRAME') {
                    try {
                      var rect = GetElementViewportRect(el);
                      if (rect) {
                        var tm = RUMSpeedIndex(el.contentWindow);
                        if (tm) {
                          rects.push({
                            'tm': tm,
                            'area': rect.area,
                            'rect': rect
                          });
                        }
                      }
                    } catch (e) { // hepp
                    }
                  }
                }
              };

              // Get the time at which each external resource loaded
              var GetRectTimings = function() {
                var timings = {};
                var requests = win.performance.getEntriesByType("resource");
                for (var i = 0; i < requests.length; i++)
                  timings[requests[i].name] = requests[i].responseEnd;
                for (var j = 0; j < rects.length; j++) {
                  if (!('tm' in rects[j]))
                    rects[j].tm = timings[rects[j].url] !== undefined ? timings[rects[j].url] : 0;
                }
              };

              // Get the first paint time.
              var GetFirstPaint = function() {
                // If the browser supports a first paint event, just use what the browser reports
                if ('msFirstPaint' in win.performance.timing)
                  firstPaint = win.performance.timing.msFirstPaint - navStart;
                if ('chrome' in win && 'loadTimes' in win.chrome) {
                  var chromeTimes = win.chrome.loadTimes();
                  if ('firstPaintTime' in chromeTimes && chromeTimes.firstPaintTime > 0) {
                    var startTime = chromeTimes.startLoadTime;
                    if ('requestTime' in chromeTimes)
                      startTime = chromeTimes.requestTime;
                    if (chromeTimes.firstPaintTime >= startTime)
                      firstPaint = (chromeTimes.firstPaintTime - startTime) * 1000.0;
                  }
                }
                // For browsers that don't support first-paint or where we get insane values,
                // use the time of the last non-async script or css from the head.
                if (firstPaint === undefined || firstPaint < 0 || firstPaint > 120000) {
                  firstPaint = win.performance.timing.responseStart - navStart;
                  var headURLs = {};
                  var headElements = doc.getElementsByTagName('head')[0].children;
                  for (var i = 0; i < headElements.length; i++) {
                    var el = headElements[i];
                    if (el.tagName == 'SCRIPT' && el.src && !el.async)
                      headURLs[el.src] = true;
                    if (el.tagName == 'LINK' && el.rel == 'stylesheet' && el.href)
                      headURLs[el.href] = true;
                  }
                  var requests = win.performance.getEntriesByType("resource");
                  var doneCritical = false;
                  for (var j = 0; j < requests.length; j++) {
                    if (!doneCritical &&
                      headURLs[requests[j].name] &&
                      (requests[j].initiatorType == 'script' || requests[j].initiatorType == 'link')) {
                      var requestEnd = requests[j].responseEnd;
                      if (firstPaint === undefined || requestEnd > firstPaint)
                        firstPaint = requestEnd;
                    } else {
                      doneCritical = true;
                    }
                  }
                }
                firstPaint = Math.max(firstPaint, 0);
              };

              // Sort and group all of the paint rects by time and use them to
              // calculate the visual progress
              var CalculateVisualProgress = function() {
                var paints = {
                  '0': 0
                };
                var total = 0;
                for (var i = 0; i < rects.length; i++) {
                  var tm = firstPaint;
                  if ('tm' in rects[i] && rects[i].tm > firstPaint)
                    tm = rects[i].tm;
                  if (paints[tm] === undefined)
                    paints[tm] = 0;
                  paints[tm] += rects[i].area;
                  total += rects[i].area;
                }
                // Add a paint area for the page background (count 10% of the pixels not
                // covered by existing paint rects.
                var pixels = Math.max(doc.documentElement.clientWidth, win.innerWidth || 0) *
                  Math.max(doc.documentElement.clientHeight, win.innerHeight || 0);
                if (pixels > 0) {
                  pixels = Math.max(pixels - total, 0) * pageBackgroundWeight;
                  if (paints[firstPaint] === undefined)
                    paints[firstPaint] = 0;
                  paints[firstPaint] += pixels;
                  total += pixels;
                }
                // Calculate the visual progress
                if (total) {
                  for (var time in paints) {
                    if (paints.hasOwnProperty(time)) {
                      progress.push({
                        'tm': time,
                        'area': paints[time]
                      });
                    }
                  }
                  progress.sort(function(a, b) {
                    return a.tm - b.tm;
                  });
                  var accumulated = 0;
                  for (var j = 0; j < progress.length; j++) {
                    accumulated += progress[j].area;
                    progress[j].progress = accumulated / total;
                  }
                }
              };

              // Given the visual progress information, Calculate the speed index.
              var CalculateSpeedIndex = function() {
                if (progress.length) {
                  SpeedIndex = 0;
                  var lastTime = 0;
                  var lastProgress = 0;
                  for (var i = 0; i < progress.length; i++) {
                    var elapsed = progress[i].tm - lastTime;
                    if (elapsed > 0 && lastProgress < 1)
                      SpeedIndex += (1 - lastProgress) * elapsed;
                    lastTime = progress[i].tm;
                    lastProgress = progress[i].progress;
                  }
                } else {
                  SpeedIndex = firstPaint;
                }
              };

              /****************************************************************************
               Main flow
               ****************************************************************************/
              var rects = [];
              var progress = [];
              var firstPaint;
              var SpeedIndex;
              var pageBackgroundWeight = 0.1;
              try {
                var navStart = win.performance.timing.navigationStart;
                GetRects();
                GetRectTimings();
                GetFirstPaint();
                CalculateVisualProgress();
                CalculateSpeedIndex();
              } catch (e) { // hepp
              }
              /* Debug output for testing
               var dbg = '';
               dbg += "Paint Rects\n";
               for (var i = 0; i < rects.length; i++)
               dbg += '(' + rects[i].area + ') ' + rects[i].tm + ' - ' + rects[i].url + "\n";
               dbg += "Visual Progress\n";
               for (var i = 0; i < progress.length; i++)
               dbg += '(' + progress[i].area + ') ' + progress[i].tm + ' - ' + progress[i].progress + "\n";
               dbg += 'First Paint: ' + firstPaint + "\n";
               dbg += 'Speed Index: ' + SpeedIndex + "\n";
               console.log(dbg);
               */
              return SpeedIndex;
            };

            return RUMSpeedIndex() || -1;
          })();

        } catch (err) {
          timingsErrors["rumSpeedIndex"] = err.message;
        }
        try {
          timingsResults["timings"] = (function() {
            var t = window.performance.timing;

            return {
              domainLookupTime: (t.domainLookupEnd - t.domainLookupStart),
              redirectionTime: (t.fetchStart - t.navigationStart),
              serverConnectionTime: (t.connectEnd - t.connectStart),
              serverResponseTime: (t.responseEnd - t.requestStart),
              pageDownloadTime: (t.responseEnd - t.responseStart),
              domInteractiveTime: (t.domInteractive - t.navigationStart),
              domContentLoadedTime: (t.domContentLoadedEventStart - t.navigationStart),
              pageLoadTime: (t.loadEventStart - t.navigationStart),
              frontEndTime: (t.loadEventStart - t.responseEnd),
              backEndTime: (t.responseStart - t.navigationStart)
            };
          })();

        } catch (err) {
          timingsErrors["timings"] = err.message;
        }
        try {
          timingsResults["userTimings"] = (function() {
            var measures = [];
            var marks = [];

            if (window.performance && window.performance.getEntriesByType) {

              var myMarks = Array.prototype.slice.call(window.performance.getEntriesByType('mark'));

              myMarks.forEach(function(mark) {
                marks.push({
                  name: mark.name,
                  startTime: mark.startTime
                });
              });

              var myMeasures = Array.prototype.slice.call(window.performance.getEntriesByType('measure'));

              myMeasures.forEach(function(measure) {
                measures.push({
                  name: measure.name,
                  duration: measure.duration,
                  startTime: measure.startTime
                })
              });
            }

            return {
              marks: marks,
              measures: measures
            };

          })();

        } catch (err) {
          timingsErrors["userTimings"] = err.message;
        }

        advice["timings"] = timingsResults;
        if (Object.keys(timingsErrors).length > 0) {
          errors["timings"] = timingsErrors;
        }



        'use strict';

        /*global advice*/
        (function(advice) {
          var totalScore = 0,
            totalWeight = 0;

          Object.keys(advice).forEach(function(category) {
            var categoryScore = 0,
              categoryWeight = 0,
              adviceList = advice[category].adviceList;

            if (adviceList) {
              Object.keys(adviceList).forEach(function(adviceName) {
                var advice = adviceList[adviceName];

                totalScore += advice.score * advice.weight;
                categoryScore += advice.score * advice.weight;

                totalWeight += advice.weight;
                categoryWeight += advice.weight;
              });
            }
            if (categoryWeight > 0) {
              advice[category].score = Math.round(categoryScore / categoryWeight)
            }
          });

          advice.score = Math.round(totalScore / totalWeight);
        })(advice);
        return {
          'advice': advice,
          'errors': errors,
          'url': document.URL,
          'version': "0.22.4"
        };
      })(util);
    } else {
      console.error('Missing window or window document');
    }
  })();

  return result
};

module.exports = init
