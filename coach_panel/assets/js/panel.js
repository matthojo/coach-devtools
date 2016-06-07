"use strict";function outputResults(e){var t=document.getElementsByClassName("js-results")[0],n=document.getElementsByClassName("js-score")[0];t.innerHTML="",n.innerHTML="";var a=document.createDocumentFragment(),o=document.createDocumentFragment(),c=document.createDocumentFragment(),d=document.createTextNode("Score: "+e.advice.score+"/100");c.appendChild(d),n.appendChild(c),colourScore(n,e.advice.score),delete e.advice.score;var i=Object.keys(e.advice).sort();i.forEach(function(t){var n,c,d;if(e.advice[t].adviceList)n=document.createElement("h2"),n.appendChild(document.createTextNode(t+" ("+e.advice[t].score+"/100)")),colourScore(n,e.advice[t].score),n.classList.add("js-toggle","toggle"),a.appendChild(n),d=document.createElement("div"),d.classList.add("advice-section"),d.style.display="none",c=Object.keys(e.advice[t].adviceList).sort(),c.forEach(function(n){var a=e.advice[t].adviceList[n],o=document.createElement("h3");o.appendChild(document.createTextNode(a.title+" ("+a.score+"/100)")),colourScore(o,a.score),o.classList.add("js-toggle","toggle"),d.appendChild(o);var c=document.createElement("div");c.classList.add("advice-section","advice-sub-section"),c.style.display="none";var i=document.createElement("p");i.appendChild(document.createTextNode(a.advice)),c.appendChild(i);var s=document.createElement("p");if(s.classList.add("description"),s.appendChild(document.createTextNode(a.description)),c.appendChild(s),a.offending.length>0){var r=document.createElement("h4");r.appendChild(document.createTextNode("Offending Areas")),c.appendChild(r);var l=document.createElement("pre"),u=a.offending.join("\n");l.appendChild(document.createTextNode(u)),c.appendChild(l)}d.appendChild(c)}),a.appendChild(d);else{if(n=document.createElement("h2"),n.appendChild(document.createTextNode(t.toString())),n.classList.add("js-toggle","toggle"),o.appendChild(n),d=document.createElement("div"),d.classList.add("advice-section"),d.style.display="none","object"===_typeof(e.advice[t])){var i=document.createElement("pre");c=Object.keys(e.advice[t]).sort();var s=[];c.forEach(function(n){var a=e.advice[t][n];"object"===("undefined"==typeof a?"undefined":_typeof(a))?(c=Object.keys(e.advice[t][n]).sort(),c.forEach(function(a){var o=e.advice[t][n][a];Array.isArray(o)&&o.length>0?s.push(a+": "+o.join("\n")+"\n"):s.push(a+": "+o+"\n")})):s.push(n+": "+a+"\n")});var r=s.join("\n");i.appendChild(document.createTextNode(r)),d.appendChild(i)}else{var l=e.advice[t],u=document.createElement("h3");u.appendChild(document.createTextNode(t+": "+l)),d.appendChild(u)}o.appendChild(d)}}),a.appendChild(o),t.appendChild(a),unicornify();for(var s=document.getElementsByClassName("js-toggle"),r=0;r<s.length;r++)s[r].addEventListener("click",function(e){var t=closest(e.target,"js-toggle");t.classList.toggle("is-visible"),t.classList.contains("is-visible")?t.nextElementSibling.style.display="":t.nextElementSibling.style.display="none"},!0)}function colourScore(e,t){100===t?e.classList.add("is-amazing","is-unicorn"):t>75?e.classList.add("is-good"):t>50?e.classList.add("is-ok"):e.classList.add("is-bad")}function unicornify(){function e(t){t.forEach(function(e){var t=+e.getAttribute("style").split(",")[0].split("(")[1]-a%360;e.setAttribute("style","color:hsla("+t+", 100%, 50%, 1)")}),n=window.requestAnimationFrame(function(){e(t)})}function t(){window.cancelAnimationFrame(n)}for(var n,a=4,o=document.getElementsByClassName("is-unicorn"),c=0;c<o.length;c++){for(var d=o[c],i=d.innerHTML,s=i.length,r=360/s,l="",u=0;s>u;u++)l+="<span style='color:hsla("+u*r+", 100%, 50%, 1)'>"+i.charAt(u)+"</span>";d.innerHTML=l,d.addEventListener("mouseover",function(t){var n=t.target.parentNode.querySelectorAll("span");e(n)},!1),d.addEventListener("mouseout",function(e){t()},!1)}}var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};document.getElementsByClassName("js-analyse")[0].addEventListener("click",function(e){chrome.runtime.sendMessage({command:"init",tabId:chrome.devtools.tabId},function(t){e.target.innerText="Re-Analyse",outputResults(t)})},!1);var closest=function(e,t){for(;!e.classList.contains(t);)if(e=e.parentNode,!e)return null;return e};