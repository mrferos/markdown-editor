;(function() {
    var editor = null;
    var jwerty = require('./jwerty.js').jwerty;
    var htmlView = document.getElementById('out');
    var markdownView = document.getElementById('in');

    var save = function(code, name){
        var blob = new Blob([code], { type: 'text/plain' });
        if(window.saveAs){
            window.saveAs(blob, name);
        }else if(navigator.saveBlob){
            navigator.saveBlob(blob, name);
        }else{
            url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href",url);
            link.setAttribute("download",name);
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        }
    };

    var saveAsMarkdown = function(){
        save(editor.getValue(), "untitled.md");
    };

    var saveAsHtml = function() {
        save(htmlView.innerHTML, "untitled.html");
    };

    var showHtmlView = function() {
        markdownView.style.width = '50%';
        htmlView.style.display = 'block';
    };

    var hideHtmlView = function() {
        markdownView.style.width = '100%';
        htmlView.style.display = 'none';
    };

    var bindings = [
        {
            'shortcuts': ['ctrl+right'],
            'callback': function(e) {
                hideHtmlView();
            }
        },
        {
            'shortcuts': ['ctrl+left'],
            'callback': function(e) {
                showHtmlView();
            }
        },
        {
            'shortcuts': ['ctrl+s', 'cmd+s'],
            'callback': function(e) {
                saveAsMarkdown();
            }
        },
        {
            'shortcuts': ['ctrl+shift+s', 'cmd+shift+s'],
            'callback': function(e) {
                saveAsHtml();
            }
        },
        {
            'shortcuts': ['ctrl+shift+d', 'cmd+alt+d'],
            'callback': function(e) {
                data = {
                    'description': "untitled.md",
                    "public": true,
                    "files": {
                        "untitled.md": {
                            "content": editor.getValue()
                        }
                    }
                };

                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    response = JSON.parse(this.responseText);
                    alert("Gist URL: " + response.html_url);
                }

                xhr.open("POST", "https://api.github.com/gists", true);
                xhr.send(JSON.stringify(data));
            }
        },
        {
            'shortcuts': ['ctrl+h', 'cmd+h'],
            'callback': function(e) {
                alert("\
(GitHub-Flavored) Markdown Editor\n\
\n\
Basic useful feature list:\n\
\n\
* Ctrl+n / Cmd+n to open a new window\n\
* Ctrl+S / Cmd+S to save as markdown\n\
* Ctrl+Shift+S / Cmd+Shift+S to save as html\n\
* Ctrl+D / Cmd+D to create a gist\n\
* Drag and drop a file into here to load it\n\
");
            }
        }
    ];

    var bind = function() {
        bindings.forEach(function(binding) {
            for(var i = 0; i < binding.shortcuts.length; i++) {
                jwerty.key(binding.shortcuts[i], binding.callback);
            }
        });
    };

    var keybindings = function(windowEditor) {
        editor = windowEditor;
        bind();
    };

    module.exports = keybindings;
})();