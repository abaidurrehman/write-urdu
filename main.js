
        function WriteChar(item) {
            var input = document.getElementById('write');
            if (document.selection) {
                input.focus();
                range = document.selection.createRange();
                range.text = item;
                range.select();
            }
            else if (input.selectionStart || input.selectionStart == '0') {
                var startPos = input.selectionStart;
                var endPos = input.selectionEnd;
                var cursorPos = startPos;
                var scrollTop = input.scrollTop;
                var baselength = 0;
                input.value = input.value.substring(0, startPos)
                    + item
                    + input.value.substring(endPos, input.value.length);
                cursorPos += item.length;
                input.focus();
                input.selectionStart = cursorPos;
                input.selectionEnd = cursorPos;
                input.scrollTop = scrollTop;
            }
            else {
                input.value += item;
                input.focus();
            }
        }



        var car;
        function annuler() {
            car = document.conversion.saisie.value;
            car = car.replace(/\u200b/g, "");
            document.conversion.saisie.value = car;
        }
        function operation(el) {
            var input = document.getElementById('write');
            if (el == "back") {
                var target = document.getElementById('write');
                target.focus();
                if (target.setSelectionRange) {
                    var srt = target.selectionStart;
                    var len = target.selectionEnd;
                    if (srt < len) srt++;
                    target.value = target.value.substr(0, srt - 1) +
                    target.value.substr(len);
                    target.setSelectionRange(srt - 1, srt - 1);
                    target.focus();
                } else
                    if (target.createTextRange) {
                        self.VKI_range = document.selection.createRange();
                        try { self.VKI_range.select(); }
                        catch (e) { }
                        self.VKI_range = document.selection.createRange();
                        if (!self.VKI_range.text.length)
                            self.VKI_range.moveStart('character', -1);
                        self.VKI_range.text = "";
                        target.focus();
                    }
                    else target.value = target.value.substr(0, target.value.length - 1);
                target.focus();
                return true;

            }
        }
        function saveTextAsFile(control,fileNameControl) {
            var textToSave = document.getElementById(control).value;
            var textToSaveAsBlob = new Blob([textToSave], { type: "text/plain" });
            var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
            var fileNameToSaveAs = document.getElementById(fileNameControl).value;

            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            downloadLink.href = textToSaveAsURL;
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);

            downloadLink.click();
        }

        function destroyClickedElement(event) {
            document.body.removeChild(event.target);
        }

        function loadFileAsText() {
            var fileToLoad = document.getElementById("fileToLoad").files[0];

            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                var textFromFileLoaded = fileLoadedEvent.target.result;
                document.getElementById("inputTextToSave").value = textFromFileLoaded;
            };
            fileReader.readAsText(fileToLoad, "UTF-8");
        }
