!function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s="./te_reo_plugin/TeReoPlugin.js")}({"./te_reo_plugin/TeReoPlugin.js":function(e,t,n){"use strict";tinymce.PluginManager.add("TeReoPlugin",function(e,t){function n(t,n){var a,r=e.selection.getNode(),s=new tinymce.dom.TreeWalker(r),l=!1,c=!1;console.log("treewalk begins here");do{a&&(a.remove(),a=null);var d=s.current();if(d.isEqualNode(t.startContainer)&&d.isEqualNode(t.endContainer)&&3==d.nodeType){l=!1;var p=i(d.nodeValue.substr(0,t.startOffset))+u(e.selection.getContent(),!1)+i(d.nodeValue.substr(t.endOffset));a=o(d,p)}else if(3==d.nodeType)if(d.isEqualNode(t.endContainer)){var p=u(d.nodeValue.substr(0,t.endOffset),!1)+d.nodeValue.substr(t.endOffset);a=o(d,p),l=!1,c=!0}else if(l){var p=u(d.nodeValue,!1);a=o(d,p)}else if(d.isEqualNode(t.startContainer)){var p=d.nodeValue.substr(0,t.startOffset)+u(d.nodeValue.substr(t.startOffset),!1);a=o(d,p),l=!0}}while(s.next()&&!c);a&&a.remove(),e.selection.moveToBookmark(f)}function o(e,t){var n=document.createElement("span");return e.parentNode.insertBefore(n,e),n.insertAdjacentHTML("beforebegin",t),n.remove(),e}function i(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function a(e,t,n){if(0==e||0==t)tinymce.activeEditor.windowManager.alert("Cannot submit an empty field!");else if(g.has(e))tinymce.activeEditor.windowManager.alert("This word already has a translation! ("+g.get(e)+")");else{tinyMCE.activeEditor.windowManager.close();var o=new XMLHttpRequest,i="/api/v1/dictionary/addWordPair/"+n+"?base="+e+"&destination="+t;o.open("POST",i),o.send(),o.onreadystatechange=function(){4==this.readyState&&200==this.status&&g.set(e,t)}}}function r(t){e.windowManager.open({layout:"flex",pack:"center",align:"center",onClose:function(){e.focus()},onSubmit:function(){},buttons:[{text:"Add",subtype:"primary",onclick:function(){var e=y.find(function(e){return e.text==document.getElementById("DictionaryDisplayComboBox-inp").value}).id;a(document.getElementById("BaseInputTextBox").value,document.getElementById("DestinationInputTextBox").value,e)}},{type:"spacer",flex:1}],title:"Add to Dictionary",items:{type:"form",padding:20,labelGap:30,spacing:10,items:[{type:"textbox",name:"Base",size:40,label:"Base",value:t.trim(),id:"BaseInputTextBox",tooltip:"An untranslated word"},{type:"textbox",name:"Destination",size:40,label:"Translation",id:"DestinationInputTextBox",tooltip:"A translated word"},{type:"combobox",name:"Dictionary",size:40,label:"Dictionary",id:"DictionaryDisplayComboBox",tooltip:"Select which dictionary you want to add to",values:y,onPostRender:function(){this.value(y[0].value)}}]}})}function s(t){var n=new XMLHttpRequest;n.open("POST","/api/v1/dictionary/translateThroughInterface",!0),n.onreadystatechange=function(){this.readyState===XMLHttpRequest.DONE&&200===this.status&&(e.setContent(n.responseText,{format:"html"}),e.undoManager.add(),tinymce.activeEditor.selection.moveToBookmark(f))},n.send(t)}function l(e){var t=new XMLHttpRequest,n="/api/v1/dictionary/dictionaries/"+e;t.open("GET",n),t.send(),t.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var e=t.responseText;e=JSON.parse(e),console.log("Building local dictionary:");for(var n=0;n<e.length;n++)g.set(e[n].Base,e[n].Destination),console.log("key = "+e[n].Base+", value = "+e[n].Destination)}}}function c(){var e=new XMLHttpRequest;e.open("GET","/api/v1/dictionary/index/"),e.send(),e.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var t=e.responseText;t=JSON.parse(t),console.log("Building library:");for(var n=0;n<t.length;n++)y.push({text:t[n].Title,value:t[n].Title,id:t[n].ID}),console.log("added dictionary = "+t[n].Title)}}}function u(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n="",o="";if(!e)return e;t?(n="[TT]",o="[/TT]"):(n='<span class="TeReoTooltip" style="text-decoration: underline;">',o="</span>");for(var i=e.split(/\b/g),a=[],r=0;r<i.length;r++)g.has(i[r].trim())?a.push(n+i[r]+o):a.push(i[r]);return a.join("")}function d(e){var t=null;return e.replace(/(<span class="TeReoTooltip" style="text-decoration: underline;">)(.+?)(<\/span>)/g,function(e){return g.has(e.slice(63,e.length-7))?t="[TT]"+e.slice(63,e.length-7)+"[/TT]":(console.log("Does not match a dictionary, looking deeper"),t=u(e.slice(63,e.length-7))),t})}function p(e){return console.log("replaceShortcodes"),e.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g,function(e){return g.has(e.slice(4,e.length-5))?(console.log("found = '"+e+"', replaced with span "+e.slice(4,e.length-5)+" span"),'<span class="TeReoTooltip" style="text-decoration: underline;">'+e.slice(4,e.length-5)+"</span>&#8203"):0==g.size?(console.log("empty dictionary, you should only see this on init"),'<span class="TeReoTooltip" style="text-decoration: underline;">'+e.slice(4,e.length-5)+"</span>&#8203"):e.slice(4,e.length-5)})}var f,g=new Map,y=[];e.addButton("translate",{image:"/_resources/vendor/signify-nz/te_reo_tooltips/client/dist/img/globe-light.svg",tooltip:"Translate content",onclick:function(){f=tinymce.activeEditor.selection.getBookmark(2,!0),e.undoManager.add(),s(e.getContent()),tinymce.activeEditor.fire("change")}}),e.addMenuItem("contextTranslate",{text:"Translate",onclick:function(){console.log("Selection content = "+e.selection.getContent({format:"html"})),f=tinymce.activeEditor.selection.getBookmark(2,!0),n(e.selection.getRng(),e.selection.getSel()),tinymce.activeEditor.fire("change")}}),e.addMenuItem("addToDictionary",{text:"Add to Dictionary",onclick:function(){r(e.selection.getContent({format:"text"}))}}),e.on("init",function(e){l(),c()}),e.on("BeforeSetcontent",function(e){console.log("BeforeSetcontent"),e.content=p(e.content)}),e.on("GetContent",function(e){console.log("GetContent"),e.content=d(e.content)})})}});