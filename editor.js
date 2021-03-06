;(function() {
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
    window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

    // Because highlight.js is a bit awkward at times
    var languageOverrides = {
        js: 'javascript',
        html: 'xml'
    };

    emojify.setConfig({ img_dir: 'emoji' });

    var md = markdownit({
        html: true,
        highlight: function(code, lang){
            if(languageOverrides[lang]) lang = languageOverrides[lang];
            if(lang && hljs.getLanguage(lang)){
                try {
                    return hljs.highlight(lang, code).value;
                }catch(e){}
            }
            return '';
        }
    })
        .use(markdownitFootnote);


    var hashto;

    function update(e){
        setOutput(e.getValue());

        clearTimeout(hashto);
        hashto = setTimeout(updateHash, 1000);
    }

    function setOutput(val){
        val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function(a, b){
            return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
        });

        var out = document.getElementById('out');
        var old = out.cloneNode(true);
        out.innerHTML = md.render(val);
        emojify.run(out);

        var allold = old.getElementsByTagName("*");
        if (allold === undefined) return;

        var allnew = out.getElementsByTagName("*");
        if (allnew === undefined) return;

        for (var i = 0, max = Math.min(allold.length, allnew.length); i < max; i++) {
            if (!allold[i].isEqualNode(allnew[i])) {
                out.scrollTop = allnew[i].offsetTop;
                return;
            }
        }
    }

    var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'gfm',
        lineNumbers: false,
        matchBrackets: true,
        lineWrapping: true,
        theme: 'base16-light',
        extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
    });

    editor.on('change', update);


    document.addEventListener('drop', function(e){
        e.preventDefault();
        e.stopPropagation();

        var reader = new FileReader();
        reader.onload = function(e){
            editor.setValue(e.target.result);
        };

        reader.readAsText(e.dataTransfer.files[0]);
    }, false);

    function updateHash(){
        window.location.hash = btoa( // base64 so url-safe
            RawDeflate.deflate( // gzip
                unescape(encodeURIComponent( // convert to utf8
                    editor.getValue()
                ))
            )
        );
    }

    if(window.location.hash){
        var h = window.location.hash.replace(/^#/, '');
        if(h.slice(0,5) == 'view:'){
            setOutput(decodeURIComponent(escape(RawDeflate.inflate(atob(h.slice(5))))));
            document.body.className = 'view';
        }else{
            editor.setValue(
                decodeURIComponent(escape(
                    RawDeflate.inflate(
                        atob(
                            h
                        )
                    )
                ))
            );
            update(editor);
            editor.focus();
        }
    }else{
        update(editor);
        editor.focus();
    }

    require('electron').ipcRenderer.on('markdown-content', function(event, message) {
        editorData = JSON.parse(message);
        editor.setValue(editorData.contents);
        editor.fileName = editorData.isDefault ? 'untitled.md' : editorData.fileName;
        update(editor);

        Keybindings = require('./keybindings.js');
        Keys = new Keybindings(editor);
    });
})();