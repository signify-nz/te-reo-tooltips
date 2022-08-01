!function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s="./client/src/js/TeReoPlugin.js")}({"./client/src/js/TeReoPlugin.js":function(e,t,n){"use strict";tinymce.PluginManager.add("TeReoPlugin",function(e,t){function n(e,t){var n=document.createElement("span");return e.parentNode.insertBefore(n,e),n.insertAdjacentHTML("beforebegin",t),n.remove(),e}function o(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function i(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n="",o="";if(!e)return e;t?(n="[TT]",o="[/TT]"):(n='<span class="TeReoTooltip" style="text-decoration: underline 1px dashed;">',o="</span>");for(var i=e.split(/\b/g),a=[],r=0;r<i.length;r++)g.has(i[r].trim())?a.push(n+i[r]+o):a.push(i[r]);return a.join("")}function a(t){var a=e.selection.getNode(),r=new tinymce.dom.TreeWalker(a),s=!1,c=!1,d=void 0;do{d&&(d.remove(),d=null);var u=r.current();if(u.isEqualNode(t.startContainer)&&u.isEqualNode(t.endContainer)&&3===u.nodeType)s=!1,d=n(u,o(u.nodeValue.substr(0,t.startOffset))+i(e.selection.getContent(),!1)+o(u.nodeValue.substr(t.endOffset)));else if(3===u.nodeType)if(u.isEqualNode(t.endContainer)){var l=i(u.nodeValue.substr(0,t.endOffset),!1)+u.nodeValue.substr(t.endOffset);d=n(u,l),s=!1,c=!0}else if(s){var f=i(u.nodeValue,!1);d=n(u,f)}else if(u.isEqualNode(t.startContainer)){var p=u.nodeValue.substr(0,t.startOffset)+i(u.nodeValue.substr(t.startOffset),!1);d=n(u,p),s=!0}}while(r.next()&&!c);d&&d.remove(),e.selection.moveToBookmark(m)}function r(e,t,n){if(e&&t)if(g.has(e))tinymce.activeEditor.windowManager.alert("This word already has a translation! ("+g.get(e)+")");else{tinymce.activeEditor.windowManager.close();var o=new XMLHttpRequest,i="/api/v1/dictionary/addWordPair/"+n;o.open("POST",i);var a=document.getElementById("Form_EditForm_SecurityID"),r=a.getAttribute("value");o.setRequestHeader("X-SecurityID",r);var s=JSON.stringify({baseWord:e,destinationWord:t});o.send(s),o.onreadystatechange=function(){4===this.readyState&&200===this.status&&(g.set(e,t),tinymce.activeEditor.windowManager.alert('Successfully added wordpair "'+e+'", "'+t+'".')),4===this.readyState&&400===this.status&&(g.set(e,t),tinymce.activeEditor.windowManager.alert(this.response))}}else tinymce.activeEditor.windowManager.alert("Cannot submit an empty field!")}function s(t){var n=new XMLHttpRequest;n.open("POST","/api/v1/dictionary/translateThroughInterface",!0);var o=document.getElementById("Form_EditForm_SecurityID"),i=o.getAttribute("value");n.setRequestHeader("X-SecurityID",i),n.onreadystatechange=function(){4===this.readyState&&200===this.status&&(e.setContent(n.responseText,{format:"html"}),e.undoManager.add(),tinymce.activeEditor.selection.moveToBookmark(m))},n.send(t)}function c(e){var t=new XMLHttpRequest,n="/api/v1/dictionary/dictionaries/"+e;t.open("GET",n);var o=document.getElementById("Form_EditForm_SecurityID"),i=o.getAttribute("value");t.setRequestHeader("X-SecurityID",i),t.send(),t.onreadystatechange=function(){if(4===this.readyState&&200===this.status){var e=t.responseText;e=JSON.parse(e);for(var n=0;n<e.length;n++)g.set(e[n].Base,e[n].Destination)}}}function d(){var e=new XMLHttpRequest;e.open("GET","/api/v1/dictionary/index/");var t=document.getElementById("Form_EditForm_SecurityID"),n=t.getAttribute("value");e.setRequestHeader("X-SecurityID",n),e.send(),e.onreadystatechange=function(){if(4===this.readyState&&200===this.status){var t=e.responseText;if(t){t=JSON.parse(t);for(var n=0;n<t.length;n++)y.push({text:t[n].Title,value:t[n].Title,id:t[n].ID})}}}}function u(e){var t=null;return e.replace(/(<span class="TeReoTooltip" style="text-decoration: underline 1px dashed;">)(.+?)(<\/span>)/g,function(e){return t=g.has(e.slice(74,e.length-7))?"[TT]"+e.slice(74,e.length-7)+"[/TT]":i(e.slice(74,e.length-7))})}function l(e){var t='<span class="TeReoTooltip" style="text-decoration: underline 1px dashed;">';return e.replace(/\[TT([^\]]*)\]([^\]]*)\[\/TT\]/g,function(e){return g.has(e.slice(4,e.length-5))?t+e.slice(4,e.length-5)+"</span>&#8203":0===g.size?t+e.slice(4,e.length-5)+"</span>&#8203":e.slice(4,e.length-5)})}function f(t){e.windowManager.open({layout:"flex",pack:"center",align:"center",onClose:function(){e.focus()},onSubmit:function(){},buttons:[{text:"Add",subtype:"primary",onclick:function(){var e=y.find(function(e){return e.text===document.getElementById("DictionaryDisplayComboBox-inp").value}).id;r(document.getElementById("BaseInputTextBox").value,document.getElementById("DestinationInputTextBox").value,e)}},{type:"spacer",flex:1}],title:"Add to Dictionary",items:{type:"form",padding:20,labelGap:30,spacing:10,items:[{type:"textbox",name:"Base",size:40,label:"Base",value:t.trim(),id:"BaseInputTextBox",tooltip:"An untranslated word"},{type:"textbox",name:"Destination",size:40,label:"Translation",id:"DestinationInputTextBox",tooltip:"A translated word"},{type:"combobox",name:"Dictionary",size:40,label:"Dictionary",id:"DictionaryDisplayComboBox",tooltip:"Select which dictionary you want to add to",values:y,onPostRender:function(){this.value(y[0].value)}}]}})}function p(){var t=this;e.on("MouseMove",function(){t.disabled(0===y.length)})}var g=new Map,y=[],m=void 0;e.on("init",function(){c(),d()}),e.on("BeforeSetcontent",function(e){e.content=l(e.content)}),e.on("GetContent",function(e){e.content=u(e.content)}),e.addMenuItem("addToDictionary",{text:"Add to Dictionary",onclick:function(){f(e.selection.getContent({format:"text"}))},onPostRender:p}),e.addButton("translate",{image:"/_resources/vendor/signify-nz/te_reo_tooltips/client/dist/img/globe-light.svg",tooltip:"Translate content",onclick:function(){m=tinymce.activeEditor.selection.getBookmark(2,!0),e.undoManager.add(),s(e.getContent()),tinymce.activeEditor.fire("change")},onPostRender:p}),e.addMenuItem("contextTranslate",{text:"Translate",onclick:function(){m=tinymce.activeEditor.selection.getBookmark(2,!0),a(e.selection.getRng()),tinymce.activeEditor.fire("change")},onPostRender:p})})}});