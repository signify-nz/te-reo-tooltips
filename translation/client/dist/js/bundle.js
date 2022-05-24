!function(e){function t(o){if(n[o])return n[o].exports;var s=n[o]={i:o,l:!1,exports:{}};return e[o].call(s.exports,s,s.exports,t),s.l=!0,s.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s="./TeReoPlugin/TeReoPlugin.js")}({"./TeReoPlugin/TeReoPlugin.js":function(e,t,n){"use strict";tinymce.PluginManager.add("TeReoPlugin",function(e,t){function n(t,n){var s,i=e.selection.getNode(),a=new tinymce.dom.TreeWalker(i),l=!1;do{s&&s.remove();var r=a.current();if(r.isEqualNode(t.startContainer)&&r.isEqualNode(t.endContainer)&&3==r.nodeType){l=!1,console.log(r.nodeValue.substr(0,t.startOffset)),console.log(c(r.nodeValue.substr(t.startOffset,t.endOffset),!1)),console.log(r.nodeValue.substr(t.endOffset));var u=r.nodeValue.substr(0,t.startOffset)+c(e.selection.getContent(),!1)+r.nodeValue.substr(t.endOffset);s=o(r,u)}else if(3==r.nodeType)if(r.isEqualNode(t.endContainer)){var u=c(r.nodeValue.substr(0,t.endOffset),!1)+r.nodeValue.substr(t.endOffset);s=o(r,u),console.log("finish"),l=!1}else if(l){var u=c(r.nodeValue,!1);s=o(r,u)}else if(r.isEqualNode(t.startContainer)){var u=r.nodeValue.substr(0,t.startOffset)+c(r.nodeValue.substr(t.startOffset),!1);s=o(r,u),l=!0}}while(a.next());s&&s.remove(),e.selection.moveToBookmark(0)}function o(e,t){var n=document.createElement("span");return e.parentNode.insertBefore(n,e),n.insertAdjacentHTML("beforebegin",t),n.remove(),e}function s(e,t){if(console.log(e+t),0==e||0==t)console.log("Cannot submit an empty field");else{var n=new XMLHttpRequest,o="/api/v1/dictionary/addWordPair/?base="+e+"&destination="+t;n.open("POST",o),n.send(),n.onreadystatechange=function(){4==this.readyState&&200==this.status&&(console.log("wordpair sent"),d.set(e,t))}}}function i(t){e.windowManager.open({layout:"flex",pack:"center",align:"center",onClose:function(){e.focus()},onSubmit:function(){},buttons:[{text:"Add",subtype:"primary",onclick:function(){s(document.getElementById("BaseInputTextBox").value,document.getElementById("DestinationInputTextBox").value)}},{type:"spacer",flex:1}],title:"Add to Dictionary",items:{type:"form",padding:20,labelGap:30,spacing:10,items:[{type:"textbox",name:"Base",size:40,label:"Base",value:t,id:"BaseInputTextBox"},{type:"textbox",name:"Destination",size:40,label:"Translation",id:"DestinationInputTextBox"}]}})}function a(t){var n=new XMLHttpRequest,o="/api/v1/dictionary/translateThroughInterface/?text="+encodeURIComponent(t);n.open("GET",o),n.send(),n.onreadystatechange=function(){4==this.readyState&&200==this.status&&(console.log(n.responseText),e.setContent(n.responseText,{format:"html"}))}}function l(e){var t=new XMLHttpRequest,n="/api/v1/dictionary/dictionaries/"+e;t.open("GET",n),t.send(),t.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var e=t.responseText;e=JSON.parse(e),console.log(e);for(var n=0;n<e.length;n++)d.set(e[n].Base,e[n].Destination),console.log("key = "+e[n].Base+", value = "+e[n].Destination)}}}function r(e){var t=null;return e.replace(/(<span class="TeReoTooltip" style="text-decoration: underline;">)(.+?)(<\/span>)/g,function(e){return d.has(e.slice(63,e.length-7))?t="[TT]"+e.slice(63,e.length-7)+"[/TT]":(console.log("Does not match a dictionary, looking deeper"),t=c(e.slice(63,e.length-7))),console.log("restoration = "+t),t})}function c(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n="",o="";if(!e)return e;t?(n="[TT]",o="[/TT]"):(n='<span class="TeReoTooltip" style="text-decoration: underline;">',o="</span>");for(var s=e.split(/\b/g),i=[],a=0;a<s.length;a++)d.has(s[a].trim())?i.push(n+s[a]+o):i.push(s[a]);return i.join("")}function u(e){return console.log("replaceShortcodes"),e.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g,function(e){return console.log(e+" sliced to "+e.slice(4,e.length-5)),d.has(e.slice(4,e.length-5))?(console.log("found = '"+e+"', replaced with span "+e.slice(4,e.length-5)+" span"),'<span class="TeReoTooltip" style="text-decoration: underline;">'+e.slice(4,e.length-5)+"</span>&#8203"):0==d.size?(console.log("empty"),'<span class="TeReoTooltip" style="text-decoration: underline;">'+e.slice(4,e.length-5)+"</span>&#8203"):e.slice(4,e.length-5)})}var d=new Map,f="";e.addButton("translate",{image:"public/_resources/vendor/signify-nz/translation/client/dist/img/globe-light.svg",tooltip:"Translate content",onclick:function(){a(e.getContent())}}),e.addMenuItem("contextTranslate",{text:"Translate",onclick:function(){console.log("Selection content = "+e.selection.getContent({format:"html"}));var t=e.selection.getRng(),o=e.selection.getSel();console.log(t),console.log(o),n(t,o)}}),e.addMenuItem("addToDictionary",{text:"Add to Dictionary",onclick:function(){console.log(e.selection.getContent()),f=e.selection.getContent({format:"text"}),i(f)}}),e.on("init",function(e){l(1)}),e.on("BeforeSetcontent",function(e){console.log("BeforeSetcontent"),e.content=u(e.content)}),e.on("GetContent",function(e){console.log("GetContent"),e.content=r(e.content)}),e.on("keyup",function(e){e.keyCode})})}});