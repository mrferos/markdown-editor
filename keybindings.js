;(function() {
    editor = null;

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
    }

    var saveAsMarkdown = function(){
        save(editor.getValue(), "untitled.md");
    }

    var saveAsHtml = function() {
        save(document.getElementById('out').innerHTML, "untitled.html");
    }

    var bindings = [
        {
            'shortcuts': ['ctrl+s', 'command+s'],
            'callback': function(e) {
                saveAsMarkdown();
            }
        },
        {
            'shortcuts': ['ctrl+shift+s', 'command+shift+s'],
            'callback': function(e) {
                saveAsHtml();
            }
        },
        {
            'shortcuts': ['ctrl+shift+d', 'command+alt+d'],
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
            'shortcuts': ['ctrl+h', 'command+h'],
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
            Mousetrap.bind(binding.shortcuts, binding.callback);
        });
    };

    var keybindings = function(windowEditor) {
        editor = windowEditor;
        bind();
    };

    module.exports = keybindings;
})();