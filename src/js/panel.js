/* global chrome, anchorme */

!function(e){"use strict";String.prototype.endsWith||(String.prototype.endsWith=function(e,t){var i=this.toString();("number"!=typeof t||!isFinite(t)||Math.floor(t)!==t||t>i.length)&&(t=i.length),t-=e.length;var n=i.indexOf(e,t);return-1!==n&&n===t}),String.prototype.startsWith||(String.prototype.startsWith=function(e,t){return t=t||0,this.substr(t,e.length)===e});var t={};t.occurrences=function(e,t,i){if(e+="",t+="",t.length<=0)return e.length+1;for(var n=0,r=0,a=i?1:t.length;;){if(r=e.indexOf(t,r),!(r>=0))break;n++,r+=a}return n},t.dontbreakHTML=function(e){for(var t=["src","href","cite","formaction","icon","manifest","poster","codebase","background","profile","usemap"],i=t.length;i--;){var n=[t[i]+'=" ',t[i]+"=' "],r=[t[i]+'="',t[i]+"='"];e=e.split(n[0]).join(r[0]),e=e.split(n[1]).join(r[1])}return e},t.removeCharifItEndsWithIt=function(e,i){return e.endsWith(i)?(e=e.substring(0,e.length-1),t.removeCharifItEndsWithIt(e,i)):e},t.TLDs=[".com",".org",".edu",".gov",".uk",".net",".ca",".de",".jp",".fr",".au",".us",".ru",".ch",".it",".nl",".se",".no",".es",".io",".aero",".mil",".biz",".cat",".coop",".info",".jobs",".mobi",".museum",".name",".pro",".travel",".ac",".ad",".ae",".af",".ag",".ai",".al",".am",".an",".ao",".ap",".aq",".ar",".as",".at",".aw",".az",".ax",".ba",".bb",".bd",".be",".bf",".bg",".bh",".bi",".bj",".bm",".bn",".bo",".br",".bs",".bt",".bv",".bw",".by",".bz",".cc",".cd",".cf",".cg",".ci",".ck",".cl",".cm",".cn",".co",".cr",".cs",".cu",".cv",".cx",".cy",".cz",".dj",".dk",".dm",".do",".dz",".ec",".ee",".eg",".eh",".er",".et",".eu",".fi",".fj",".fk",".fm",".fo",".ga",".gb",".gd",".ge",".gf",".gg",".gh",".gi",".gl",".gm",".gn",".gp",".gq",".gr",".gs",".gt",".gu",".gw",".gy",".hk",".hm",".hn",".hr",".ht",".hu",".id",".ie",".il",".im",".in",".io",".iq",".ir",".is",".je",".jm",".jo",".ke",".kg",".kh",".ki",".km",".kn",".kp",".kr",".kw",".ky",".kz",".la",".lb",".lc",".li",".lk",".lr",".ls",".lt",".lu",".lv",".ly",".ma",".mc",".md",".mg",".mh",".mk",".ml",".mm",".mn",".mo",".mp",".mq",".mr",".ms",".mt",".mu",".mv",".mw",".mx",".my",".mz",".na",".nc",".ne",".nf",".ng",".ni",".np",".nr",".nu",".nz",".om",".pa",".pe",".pf",".pg",".ph",".pk",".pl",".pm",".pn",".pr",".ps",".pt",".pw",".py",".qa",".re",".ro",".rw",".sa",".sb",".sc",".sd",".sg",".sh",".si",".sj",".sk",".sl",".sm",".sn",".so",".sr",".st",".sv",".sy",".sz",".tc",".td",".tf",".tg",".th",".tj",".tk",".tl",".tm",".tn",".to",".tp",".tr",".tt",".tv",".tw",".tz",".ua",".ug",".um",".uy",".uz",".va",".vc",".ve",".vg",".vi",".vn",".vu",".wf",".ws",".ye",".yt",".yu",".za",".zm",".zw",".guru",".berlin",".photography",".tips",".today",".email",".technology",".company",".clothing",".me",".asia",".abb",".academy",".active",".actor",".ads",".adult",".afl",".agency",".aig",".airforce",".alsace",".amsterdam",".android",".apartments",".app",".aquarelle",".archi",".army",".associates",".attorney",".auction",".audio",".auto",".autos",".axa",".azure",".band",".bank",".bar",".barcelona",".barclays",".bargains",".bauhaus",".bayern",".bbc",".bbva",".bcn",".beer",".bentley",".best",".bharti",".bible",".bid",".bike",".bing",".bingo",".bio",".black",".blackfriday",".bloomberg",".blue",".bmw",".bnl",".bnpparibas",".boats",".bond",".boo",".boutique",".bradesco",".bridgestone",".broker",".brother",".brussels",".budapest",".build",".builders",".business",".buzz",".bzh",".cab",".cafe",".cal",".camera",".camp",".canon",".capetown",".capital",".caravan",".cards",".care",".career",".careers",".cars",".cartier",".casa",".cash",".casino",".catering",".cba",".cbn",".center",".ceo",".cern",".cfa",".cfd",".channel",".chat",".cheap",".chloe",".christmas",".chrome",".church",".cisco",".citic",".city",".claims",".cleaning",".click",".clinic",".cloud",".club",".coach",".codes",".coffee",".college",".cologne",".community",".computer",".condos",".construction",".consulting",".contractors",".cooking",".cool",".corsica",".country",".coupons",".courses",".credit",".creditcard",".cricket",".crown",".crs",".cruises",".cuisinella",".cw",".cymru",".cyou",".dabur",".dad",".dance",".date",".dating",".datsun",".day",".dclk",".deals",".degree",".delivery",".delta",".democrat",".dental",".dentist",".desi",".design",".dev",".diamonds",".diet",".digital",".direct",".directory",".discount",".dnp",".docs",".dog",".doha",".domains",".doosan",".download",".drive",".durban",".dvag",".earth",".eat",".education",".emerck",".energy",".engineer",".engineering",".enterprises",".epson",".equipment",".erni",".esq",".estate",".eus",".events",".everbank",".exchange",".expert",".exposed",".express",".fail",".faith",".fan",".fans",".farm",".fashion",".feedback",".film",".finance",".financial",".firmdale",".fish",".fishing",".fit",".fitness",".flights",".florist",".flowers",".flsmidth",".fly",".foo",".football",".forex",".forsale",".forum",".foundation",".frl",".frogans",".fund",".furniture",".futbol",".fyi",".gal",".gallery",".game",".garden",".gbiz",".gdn",".gent",".genting",".ggee",".gift",".gifts",".gives",".glass",".gle",".global",".globo",".gmail",".gmo",".gmx",".gold",".goldpoint",".golf",".goo",".goog",".google",".gop",".graphics",".gratis",".green",".gripe",".guge",".guide",".guitars",".hamburg",".hangout",".haus",".healthcare",".help",".here",".hermes",".hiphop",".hitachi",".hiv",".hockey",".holdings",".holiday",".homedepot",".homes",".honda",".horse",".host",".hosting",".hoteles",".hotmail",".house",".how",".hsbc",".ibm",".icbc",".icu",".ifm",".iinet",".immo",".immobilien",".industries",".infiniti",".ing",".ink",".institute",".insure",".int",".international",".investments",".irish",".ist",".istanbul",".iwc",".java",".jcb",".jetzt",".jewelry",".jlc",".jll",".joburg",".jprs",".juegos",".kaufen",".kddi",".kim",".kitchen",".kiwi",".koeln",".komatsu",".krd",".kred",".kyoto",".lacaixa",".land",".lasalle",".lat",".latrobe",".law",".lawyer",".lds",".lease",".leclerc",".legal",".lgbt",".liaison",".lidl",".life",".lighting",".limited",".limo",".link",".live",".loan",".loans",".lol",".london",".lotte",".lotto",".love",".ltda",".lupin",".luxe",".luxury",".madrid",".maif",".maison",".management",".mango",".market",".marketing",".markets",".marriott",".mba",".media",".meet",".melbourne",".meme",".memorial",".men",".menu",".miami",".microsoft",".mini",".mma",".moda",".moe",".monash",".money",".montblanc",".mormon",".mortgage",".moscow",".motorcycles",".mov",".movie",".movistar",".mtn",".mtpc",".nadex",".nagoya",".navy",".nec",".netbank",".network",".neustar",".new",".news",".nexus",".ngo",".nhk",".nico",".ninja",".nissan",".nra",".nrw",".ntt",".nyc",".office",".okinawa",".omega",".one",".ong",".onl",".online",".ooo",".oracle",".orange",".organic",".osaka",".otsuka",".ovh",".page",".panerai",".paris",".partners",".parts",".party",".pharmacy",".philips",".photo",".photos",".physio",".piaget",".pics",".pictet",".pictures",".pink",".pizza",".place",".play",".plumbing",".plus",".pohl",".poker",".porn",".post",".praxi",".press",".prod",".productions",".prof",".properties",".property",".pub",".qpon",".quebec",".racing",".realtor",".realty",".recipes",".red",".redstone",".rehab",".reise",".reisen",".reit",".ren",".rent",".rentals",".repair",".report",".republican",".rest",".restaurant",".review",".reviews",".rich",".ricoh",".rio",".rip",".rocks",".rodeo",".rs",".rsvp",".ruhr",".run",".ryukyu",".saarland",".sakura",".sale",".samsung",".sandvik",".sap",".sarl",".saxo",".sca",".scb",".school",".schule",".schwarz",".science",".seat",".sener",".services",".sew",".sex",".sexy",".shiksha",".shoes",".show",".shriram",".singles",".site",".ski",".sky",".skype",".sncf",".soccer",".social",".software",".sohu",".solar",".solutions",".sony",".soy",".space",".spiegel",".spreadbetting",".starhub",".statoil",".studio",".study",".style",".su",".sucks",".supplies",".supply",".support",".surf",".surgery",".suzuki",".swatch",".swiss",".sx",".sydney",".systems",".taipei",".tatar",".tattoo",".tax",".taxi",".team",".tech",".tel",".telefonica",".temasek",".tennis",".thd",".theater",".tickets",".tienda",".tires",".tirol",".tokyo",".tools",".top",".toray",".toshiba",".tours",".town",".toys",".trade",".trading",".training",".trust",".tui",".ubs",".university",".uno",".uol",".vacations",".vegas",".ventures",".versicherung",".vet",".viajes",".video",".villas",".vision",".vista",".vistaprint",".vlaanderen",".vodka",".vote",".voting",".voto",".voyage",".wales",".walter",".wang",".watch",".webcam",".website",".wed",".wedding",".weir",".wien",".wiki",".win",".windows",".wme",".work",".works",".world",".wtc",".wtf",".xbox",".xerox",".xin",".xxx",".xyz",".yandex",".youtube",".zip",".zone",".zuerich"],t.checks={},t.checks.ip=function(e){if(t.occurrences(e,".")>2){var i=e.split("."),n=i[0],r=i[1],a=i[2];if(i[3].indexOf(":")>0)var s=i[3].indexOf(":"),o=i[3].substring(0,s),l=i[3].substring(s);else if(i[3].indexOf("/")>0)var c=i[3].indexOf("/"),o=i[3].substring(0,c),l=i[3].substring(c);else var o=i[3],l=!1;return(l===!1||"/"===l.charAt(0)||":"===l.charAt(0))&&!isNaN(n)&&!isNaN(r)&&!isNaN(a)&&!isNaN(o)&&254>=n-1&&254>=r-1&&254>=a-1&&254>=o-1&&n.length>0&&r.length>0&&a.length>0&&o.length>0?!0:!1}return!1},t.checks.email=function(e,i){if(e=e.toLowerCase(),1==t.occurrences(e,"@")){e=t.removeCharifItEndsWithIt(e,"."),e=t.removeCharifItEndsWithIt(e,","),e=t.removeCharifItEndsWithIt(e,";");for(var n=e.indexOf("@"),r=e.substring(0,n),a=e.substring(n+1,e.length),s=!0,o=0;o<r.length;o++){var l=r[o];-1==="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'*+-/=?^_`{|}~.".indexOf(l)&&(o=r.length,s=!1)}for(var o=0;o<a.length;o++){var c=a[o];-1==="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.:".indexOf(c)&&(o=a.length,s=!1)}if(s){for(var d=!1,o=0;i>o;o++){var u=t.TLDs[o];e.endsWith(u)&&(o=t.TLDs.length,d=!0)}return d===!0?!0:!1}return!1}return!1},t.checks.url=function(e,i){if(e=e.toLowerCase(),e.indexOf(".")>0&&(e.indexOf("/")>3||e.indexOf("/")<0)){if(e=t.removeCharifItEndsWithIt(e,"."),e=t.removeCharifItEndsWithIt(e,","),e=t.removeCharifItEndsWithIt(e,";"),1==t.occurrences(e,".")&&e.indexOf(".")===e.length-1)return!1;var n=!0;if(e.indexOf("/")>3){var r=e.indexOf("/"),a=e.substring(0,r);if(a.indexOf("..")>-1)return!1;for(var s=0;s<a.length;s++){var o=a[s];-1==="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.:".indexOf(o)&&(s=a.length,n=!1)}}else{if(e.indexOf("..")>-1)return!1;for(var s=0;s<e.length;s++){var o=e[s];-1==="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.:".indexOf(o)&&(s=e.length,n=!1)}}if(n){if(e.endsWith(".com"))return!0;for(var s=0;i>s;s++){var l=t.TLDs[s];if(e.endsWith(l)||e.indexOf(l+"/")>-1||e.indexOf(l+":")>-1)return s=t.TLDs.length,!0}return!1}return!1}return!1},t.order=function(e,i){for(var n=e.split(" "),r=0;r<n.length;r++){var a=n[r],s=!1,o=!1;if(a.indexOf(".")>-1){for(var l=!0,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=%",d=0;d<a.length;d++){var u=a[d];-1===c.indexOf(u)&&(d=a.length,l=!1)}if(l&&(i.urls&&(a.startsWith("http://")||a.startsWith("HTTP://"))?s=!0:i.urls&&(a.startsWith("https://")||a.startsWith("HTTPS://"))?s=!0:i.urls&&(a.startsWith("ftp://")||a.startsWith("FTP://"))?s=!0:i.urls&&(a.startsWith("file:///")||a.startsWith("FILE:///"))?s=!0:i.emails&&(a.startsWith("mailto:")||a.startsWith("MAILTO:"))?s=!0:t.checks.ip(a)&&i.ips&&a.indexOf(".")>0?(s=!0,o=i.defaultProtocol):t.checks.email(a,i.TLDs)&&i.emails&&a.indexOf(".")>-1&&a.indexOf("@")>-1?(s=!0,o="mailto:"):t.checks.url(a,i.TLDs)&&i.urls&&(s=!0,o=i.defaultProtocol),s)){var f=o?o+a:a;f=t.removeCharifItEndsWithIt(f,"."),f=t.removeCharifItEndsWithIt(f,","),f=t.removeCharifItEndsWithIt(f,";");var h=i.truncate<=1?a:a.substring(0,i.truncate)+"...";if(i.attributes){n[r]="<a href='"+f+"'";for(var m in i.attributes)n[r]=n[r]+" "+m+"='"+i.attributes[m]+"' ";n[r]=n[r]+">"+h+"</a>"}else n[r]="<a href='"+f+"'>"+h+"</a>"}}}return n.join(" ")},t.js=function(e,i){"object"!=typeof i?i={attributes:!1,html:!0,ips:!0,emails:!0,urls:!0,TLDs:20,truncate:0,defaultProtocol:"http://"}:("object"!=typeof i.attributes&&(i.attributes=!1),"boolean"!=typeof i.html&&(i.html=!0),"boolean"!=typeof i.ips&&(i.ips=!0),"boolean"!=typeof i.emails&&(i.emails=!0),"boolean"!=typeof i.urls&&(i.urls=!0),"number"!=typeof i.TLDs&&(i.TLDs=20),"string"!=typeof i.defaultProtocol&&(i.defaultProtocol="http://"),"number"!=typeof i.truncate&&(i.truncate=0)),console.log(i.truncate),i.html&&(e.indexOf("</a>")>-1||e.indexOf("<img ")>-1||e.indexOf("<blockquote ")>-1||e.indexOf("<del ")>-1||e.indexOf("<iframe ")>-1||e.indexOf("<script  ")>-1||e.indexOf("<audio ")>-1||e.indexOf("<button ")>-1||e.indexOf("<command ")>-1||e.indexOf("<embed ")>-1||e.indexOf("<html ")>-1||e.indexOf("<video ")>-1||e.indexOf("<applet ")>-1||e.indexOf("<area ")>-1||e.indexOf("<base ")>-1||e.indexOf("<body ")>-1||e.indexOf("<frame ")>-1||e.indexOf("<head ")>-1||e.indexOf("<usemap ")>-1||e.indexOf("<link ")>-1||e.indexOf("<input ")>-1||e.indexOf("<source ")>-1||e.indexOf("<q ")>-1)&&(e=t.dontbreakHTML(e)),e=e.split("\n").join(" \n "),e=e.split("(").join(" ( "),e=e.split(")").join(" ) "),e=e.split("<").join(" < "),e=e.split(">").join(" > ");var n=t.order(e,i);return n=n.split(" \n ").join("\n"),n=n.split(" ( ").join("("),n=n.split(" ) ").join(")"),n=n.split(" < ").join("<"),n=n.split(" > ").join(">")},"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=t),exports.anchorme=t):"function"==typeof define&&define.amd?define("anchorme",[],function(){return t}):e.anchorme=t}("object"==typeof window?window:this); // eslint-disable-line

document.getElementsByClassName('js-analyse')[0].addEventListener('click', function (e) {
  chrome.runtime.sendMessage({
    command: 'init',
    tabId: chrome.devtools.tabId
  },
  function (response) {
    e.target.innerText = 'Re-Analyse'
    outputResults(response)
  }
  )
}, false)

function outputResults (result) {
  // Get content containers
  var $results = document.getElementsByClassName('js-results')[0]
  var $score = document.getElementsByClassName('js-score')[0]

  // Reset content (for re-analysing)
  $results.innerHTML = ''
  $score.innerHTML = ''

  // Create fragments to reduce reflow
  var output = document.createDocumentFragment()
  var postOutput = document.createDocumentFragment()
  var scoreOutput = document.createDocumentFragment()

  // Append Score
  var scoreText = document.createTextNode(result.advice.score)
  scoreOutput.appendChild(scoreText)
  $score.appendChild(scoreOutput)
  colourScore($score, result.advice.score)
  delete result.advice.score

  // Append Advice
  var keys = Object.keys(result.advice).sort()

  keys.forEach(function (key) {
    var $title
    var adviceList
    var $adviceSection

    if (result.advice[key].adviceList) {
      $title = document.createElement('h2')

      $title.appendChild(document.createTextNode(key))
      $title.classList.add('js-toggle', 'toggle')
      $title.appendChild(createScore(result.advice[key].score))
      output.appendChild($title)

      $adviceSection = document.createElement('div')
      $adviceSection.classList.add('advice-section')
      $adviceSection.style.display = 'none'

      adviceList = Object.keys(result.advice[key].adviceList).sort()
      adviceList.forEach(function (advice) {
        var adviceObj = result.advice[key].adviceList[advice]

        // Add Advice title
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(adviceObj.title))
        $adviceTitle.classList.add('js-toggle', 'toggle')
        $adviceTitle.appendChild(createScore(adviceObj.score))
        $adviceSection.appendChild($adviceTitle)

        var $adviceSubSection = document.createElement('div')
        $adviceSubSection.classList.add('advice-section', 'advice-sub-section')
        $adviceSubSection.style.display = 'none'

        // Add Advice summary
        var $adviceAdvice = document.createElement('p')
        $adviceAdvice.innerHTML = anchorme.js(adviceObj.advice, {'attributes': {'target': '_blank'}})
        $adviceSubSection.appendChild($adviceAdvice)

        // Add Advice description
        var $adviceDescription = document.createElement('p')
        $adviceDescription.classList.add('description')
        $adviceDescription.innerHTML = anchorme.js(adviceObj.description, {'attributes': {'target': '_blank'}})
        $adviceSubSection.appendChild($adviceDescription)

        // Add Advice Offending Areas
        if (adviceObj.offending.length > 0) {
          var $adviceOffendigTitle = document.createElement('h4')
          $adviceOffendigTitle.appendChild(document.createTextNode('Offending Areas'))
          $adviceSubSection.appendChild($adviceOffendigTitle)

          var $adviceOffending = document.createElement('pre')
          var offendingList = adviceObj.offending.join('\n')
          $adviceOffending.appendChild(document.createTextNode(offendingList))
          $adviceSubSection.appendChild($adviceOffending)
        }
        $adviceSection.appendChild($adviceSubSection)
      })
      output.appendChild($adviceSection)
    } else {
      $title = document.createElement('h2')
      $title.appendChild(document.createTextNode(key.toString()))
      $title.classList.add('js-toggle', 'toggle')
      postOutput.appendChild($title)

      $adviceSection = document.createElement('div')
      $adviceSection.classList.add('advice-section')
      $adviceSection.style.display = 'none'

      if (typeof result.advice[key] === 'object') {
        // Output list of results
        var $adviceValueList = document.createElement('pre')

        adviceList = Object.keys(result.advice[key]).sort()
        var formattedValues = []

        adviceList.forEach(function (advice) {
          var adviceValue = result.advice[key][advice]
          if (typeof adviceValue === 'object') {
            adviceList = Object.keys(result.advice[key][advice]).sort()
            adviceList.forEach(function (subadvice) {
              var adviceSubValue = result.advice[key][advice][subadvice]
              if (Array.isArray(adviceSubValue) && adviceSubValue.length > 0) {
                formattedValues.push(subadvice + ': ' + adviceSubValue.join('\n') + '\n')
              } else {
                formattedValues.push(subadvice + ': ' + adviceSubValue + '\n')
              }
            })
          } else {
            formattedValues.push(advice + ': ' + adviceValue + '\n')
          }
        })
        var valuesList = formattedValues.join('\n')
        $adviceValueList.appendChild(document.createTextNode(valuesList))
        $adviceSection.appendChild($adviceValueList)
      } else {
        // Output single result
        var adviceValue = result.advice[key]
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(key + ': ' + adviceValue))
        $adviceSection.appendChild($adviceTitle)
      }
      postOutput.appendChild($adviceSection)
    }
  })
  output.appendChild(postOutput)
  $results.appendChild(output)

  var toggles = document.getElementsByClassName('js-toggle')
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', function (e) {
      var $target = closest(e.target, 'js-toggle')
      $target.classList.toggle('is-visible')
      if ($target.classList.contains('is-visible')) {
        $target.nextElementSibling.style.display = ''
      } else {
        $target.nextElementSibling.style.display = 'none'
      }
    }, true)
  }
}

var closest = function (el, target) {
  while (!el.classList.contains(target)) {
    el = el.parentNode
    if (!el) {
      return null
    }
  }
  return el
}

function createScore (score) {
  var $elem = document.createElement('span')
  $elem.classList.add('score-box')
  colourScore($elem, score)
  $elem.appendChild(document.createTextNode(score))

  return $elem
}

function colourScore ($elem, score) {
  if (score === 100) {
    $elem.classList.add('is-unicorn')
  }
  if (score > 75) {
    $elem.classList.add('is-good')
  } else if (score > 50) {
    $elem.classList.add('is-ok')
  } else {
    $elem.classList.add('is-bad')
  }
}
