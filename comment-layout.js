document.addEventListener('DOMContentLoaded', function(){
        document.body.insertAdjacentHTML('afterbegin', '<s id="toggle-comment-mode" class="not-selectable" style="border: 0 solid #CFCFCF; border-radius: 3px; display: block; position: fixed; background-color: #626f75; width: 100px; height: 40px; text-decoration: none; color: white; font-size: 1.1em; cursor: pointer; text-align: center; line-height: 38px; z-index: 999999; right:10px; bottom:5px;">Help</s>');
        
        var currentStep = 0; //saves current step for guide
        var commentMode = ''; //can be: add-comment, add-step, add-file
        var showCommentsModeFlag = false;
        var librariesLoadedFlag = false;
        var comments = []; //current comments object
        var intro = '';
        var myDropzone = false;
        var lastInsertedId = 0;
        if (!location.origin) location.origin = location.protocol + "//" + location.host;
        
        var toggleButton = document.getElementById('toggle-comment-mode');
        
        toggleButton.addEventListener('click', function(){
            if(librariesLoadedFlag){
                toggleCommentsMode();
            }else{
                loadLibraries();
                onLibrariesAvailable(toggleCommentsMode);
            }
        });
        
        function loadLibraries(){
            var jQuery = document.createElement('script'); 
            jQuery.type = 'text/javascript';
            jQuery.id = 'jQuery';
            jQuery.async = true;
            jQuery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js';
            document.head.appendChild(jQuery);
            
            var commentLayoutCSS = document.createElement('link');
            commentLayoutCSS.rel = 'stylesheet';
            commentLayoutCSS.id = 'commentLayoutCSS';
            commentLayoutCSS.async = true;
            commentLayoutCSS.href = 'http://oldtimers.me/comment-layout.css';
            document.head.appendChild(commentLayoutCSS);
            
            var introJS = document.createElement('script');
            introJS.type = 'text/javascript';
            introJS.id = 'introJS';
            introJS.async = true;
            introJS.src = 'http://oldtimers.me/intro.js';
            document.head.appendChild(introJS);
            
            var introJSCSS = document.createElement('link');
            introJSCSS.rel = 'stylesheet';
            introJSCSS.id = 'introJSCSS';
            introJSCSS.async = true;
            introJSCSS.href = 'http://oldtimers.me/introjs.css';
            document.head.appendChild(introJSCSS);

            var htmlSortable = document.createElement('script');
            htmlSortable.type = 'text/javascript';
            htmlSortable.id = 'htmlSortable';
            htmlSortable.async = true;
            htmlSortable.src = 'http://oldtimers.me/html.sortable.js';
            document.head.appendChild(htmlSortable);
            
            var dropZoneCSS = document.createElement('link');
            dropZoneCSS.rel = 'stylesheet';
            dropZoneCSS.id = 'dropZoneCSS';
            dropZoneCSS.async = true;
            dropZoneCSS.href = 'http://oldtimers.me/dropzone.css';
            document.head.appendChild(dropZoneCSS);
            
            var dropZone = document.createElement('script');
            dropZone.type = 'text/javascript';
            dropZone.id = 'dropZone';
            dropZone.async = true;
            dropZone.src = 'http://oldtimers.me/dropzone.js';
            document.head.appendChild(dropZone);
        }
        
        function onLibrariesAvailable(oCallback) {
            if (typeof(eval('jQuery')) === 'function' && typeof(eval('$().sortable')) === 'function') {
                librariesLoadedFlag = true;
                oCallback();
            } else {
            setTimeout(function () {
                onLibrariesAvailable(oCallback);
            }), 50
            }
        }
        
        // START Highlight mode code //
        var onmouseenter = function(){
                $(this).addClass('intro').css('box-shadow', 'inset 0 0 5px blue, 0 0 5px red').css('cursor', 'crosshair');
            }
        var onmouseout = function(){
                $(this).removeClass('intro').css('box-shadow', 'none').css('cursor', 'default');
            }
        var onclick = function(event){
                var element = event.target;
                $('*').removeAttr('data-intro');
                
                onElementsHighlightMode();
                
                switch(commentMode){
                    case 'add-comment':
                        addComment(element, event);
                        break;
                    case 'add-step':
                        addStep(element, event);
                        break;
                    case 'add-file':
                        addFile(element, event);
                        break;
                    default:
                        break;
                }
                
                offElementsHighlightMode(true);
                event.preventDefault();
                event.stopPropagation();
                return false;
        }
        
        function onElementsHighlightMode(){
            $("body *").not(".not-selectable").on('mouseenter', onmouseenter);
            $("body *").not(".not-selectable").on('mouseout', onmouseout);
            $("body *").not(".not-selectable").on('click', onclick);
        }
        
        function offElementsHighlightMode(switchOffButtons = false){
            if(switchOffButtons){
                $('#add-comment, #add-step, #add-file').css('opacity', '0.7');
            }
            $('.intro').removeAttr('data-intro').removeClass('intro').css('box-shadow', 'none').css('cursor', 'default');
            if(myDropzone){
                myDropzone.removeAllFiles();
            }
            $("body *").not(".not-selectable").off( "mouseenter", onmouseenter );
            $("body *").not(".not-selectable").off( "mouseout", onmouseout );
            $("body *").not(".not-selectable").off( "click", onclick );
        }
        // END Highlight mode code //
        
        function toggleCommentsMode(){
            
            if(showCommentsModeFlag){
                $('.introjs-hints, #add-comment, #add-step, #add-file, #run-guide, #guide-steps').remove();
                offElementsHighlightMode();
                showCommentsModeFlag = false;
                return false;
            }
            
            $.ajax({
                type: "POST",
                url: "http://oldtimers.me/server.php?action=getComments",
                data: {
                    'baseURL' :  location.origin
                }
            })
            .done(function( result ) {
                comments = JSON.parse(result);
                intro = introJs();
                intro.setOptions({
                    'showBullets': false,
                });
                intro.onexit(offElementsHighlightMode);
                    //Add comment button
                    $('#toggle-comment-mode').before($('<s>').text('Add comment').attr('id', 'add-comment').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-add-comment'));
                    //Add step button
                    $('#toggle-comment-mode').before($('<s>').text('Add guide step').attr('id', 'add-step').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-add-step'));
                    //Add File/Image button
                    $('#toggle-comment-mode').before($('<s>').text('Add file/image').attr('id', 'add-file').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-add-file'));
                    //Run guide button
                    $('#toggle-comment-mode').before($('<s>').text('Run guide').attr('id', 'run-guide').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-run-guide'));
                    //Guide steps list
                    $('#toggle-comment-mode').before($('<ul>').attr('id', 'guide-steps').addClass('not-selectable').addClass('toggle-menu-block toggle-menu-step-list'));
                    
                    $('body').on('click', '#add-comment, #add-step, #add-file',  function(){
                        $('#add-comment, #add-step, #add-file').css('opacity', '0.7');
                        $(this).css('opacity', '1');
                        offElementsHighlightMode();
                        onElementsHighlightMode();
                        commentMode = $(this).attr('id');
                    });
                    
                    $('body').on('click', '#run-guide',  function(){
                        offElementsHighlightMode();
                        intro.start();
                    });
                    
                    addHints(comments);
                    initJquerySortable();
                    intro.refresh();
                    
                    intro.onhintclose(function() {
                        addHints(comments);
                        initJquerySortable();
                        intro.refresh();
                    });
                    
                    showCommentsModeFlag = true;
            });
        }
        
        function addStep(element, event){
            $(element).attr('data-intro','');
            intro.start();
            $('.introjs-helperNumberLayer').html(parseInt(currentStep) + 1);
            
            //adding textarea
            $('.introjs-tooltiptext').html($('<textarea>').attr('id', 'comment-textarea').attr('rows', 3).focus());
            if(currentStep == 0){
                $('.introjs-tooltiptext').append(generatePathSelector());
            }
            
            //Done button event
            $('.introjs-skipbutton').on('click', function(e){
                comment = $(this).parent().parent().find('textarea').val();
                var pathes = []; 
                pathes = getPathes(this, pathes);
                var firstStep = comments.filter(function (comment) { return comment.stepNumber == '1' });
                if(firstStep.length){
                    pathes = ["fullURL"];
                }
                currentStep++;
                saveComment(element, comment, pathes)
            });
        }
        
        function addComment(element, event){
            $(element).attr('data-intro','');
            intro.start();
            $('.introjs-helperNumberLayer').remove();
            
            //adding textarea
            $('.introjs-tooltiptext').html($('<textarea>').attr('id', 'comment-textarea').attr('rows', 3).focus());
            $('.introjs-tooltiptext').append(generatePathSelector());

            $('.introjs-skipbutton').on('click', function(e){
                comment = $(this).parent().parent().find('textarea').val();
                var pathes = [];
                pathes = getPathes(this, pathes);
                saveComment(element, comment, pathes);
            });
        }
        
        function addFile(element, event){
            $(element).attr('data-intro','');
            intro.start();
            $('.introjs-helperNumberLayer').remove();
            $('.introjs-tooltiptext').html($('<textarea>').attr('id', 'comment-textarea').attr('rows', 3).focus());
            $('.introjs-tooltiptext').append(
                    $('<form>').attr('id', 'fileDropArea').addClass('dropzone-previews').html('Drop file here...'));
            
                    myDropzone = new Dropzone("#fileDropArea", { 
                                url: "/server.php?action=uploadFile",
                                autoProcessQueue: false,
                                maxFilesize: '2000',
                                uploadMultiple: false,
                                thumbnailWidth: 60,
                                thumbnailHeight: 60,
                                maxFiles: 1,
                                acceptedFiles: 'image/jpeg, image/png, image/gif, application/pdf',
                                addRemoveLinks: true,
                                init:function(){
                                    var self = this;
                                    self.on("processing", function (file, serverFileName) {
                                        if(lastInsertedId){
                                            self.options.url = '/server.php?action=uploadFile&lastId=' + lastInsertedId;
                                        }
                                    });
                                    
                                    self.on('maxfilesreached', function() {
                                        self.removeEventListeners();
                                    });
                                    
                                    self.on('removedfile', function (file) {
                                        self.setupEventListeners();
                                    });
                                    
                                    self.on('success', function() {
                                        refreshComments();
                                    });
                                }
                            });
            
            $('.introjs-tooltiptext').append(generatePathSelector());

            $('.introjs-skipbutton')[0].onclick = null;
            $('.introjs-skipbutton').on('click', function(e){
                e.stopPropagation();
                comment = $(this).parent().parent().find('textarea').val();
                var pathes = [];
                pathes = getPathes(this, pathes);
                saveComment(element, comment, pathes);
                $(this).css('visibility','hidden');
            });
        }
        
        function saveComment(element, comment, pathes){
            var selector = generate(element);
            var counter = comments.length;
            
            if(!pathes.length){
                pathes = ["fullURL"];
            }
            
            var data = {
                    'id' : counter,
                    'comment' : comment,
                    'namespace' :  JSON.stringify(pathes),
                    'baseURL' :  location.origin,
                    'position' : 'left',
                    'elementPath' : selector,
                    'stepNumber' : 0
                };
            
            if(commentMode === 'add-step'){
                data.stepNumber = currentStep;
            }
            
            if(commentMode === 'add-file'){
                data.fileName = currentStep;
            }
            
            //$(element).removeAttr('data-intro').removeClass('intro').css('box-shadow', 'none');
            
            $.ajax({
                method: "POST",
                url: "http://oldtimers.me/server.php?action=saveComment",
                data: data
            })
            .fail(function() {
                if(commentMode === 'add-step'){
                    currentStep--;
                }
            })
            .done(function( lastId ) {
                lastInsertedId = lastId;
                comments.push(data);
                
                if(myDropzone){
                    myDropzone.processQueue();
                }else{
                    refreshComments();
                }
                $(element).removeAttr('data-intro');
            });
            
            return true;
        }
        
        function refreshComments(){
            intro.exit();
            addHints(comments);
            initJquerySortable();
            onElementsHighlightMode();
            return true;
        }
        
        function fillInStepsList(stepsList){
            stepsList.sort(function(a, b) {
                return a['stepNumber'] - b['stepNumber'];
            });
            $(stepsList).each(function(key, value){
              //fill in steps list
                var node = document.createElement('li');
                var textnode = document.createTextNode('Guide Step: ' + value.comment);
                node.className = 'not-selectable guide-step-list-element';
                node.setAttribute('data-step-id', value.id);
                node.appendChild(textnode);
                document.getElementById('guide-steps').appendChild(node);   
            });
        }
        
        function addHints(comments){
            var hints = new Array();
            var stepsList = new Array();
            document.getElementById('guide-steps').innerHTML = "";
            
            $(comments).each(function(key, value){
                var element = document.querySelector(value.elementPath);
                value.isGuide = false;
                value.isFile = false;
                
                if(element === null){
                    return true;
                }

                //if it's guide step
                if(typeof value.stepNumber !== 'undefined' && value.stepNumber > 0){
                   element.setAttribute('data-step', value.stepNumber);
                   element.setAttribute('data-intro', value.comment);
                   currentStep = currentStep < value.stepNumber ? value.stepNumber : currentStep;
                   value.isGuide = true;
                   
                   //show guide buttons and steps list
                   document.getElementById('run-guide').style.display = 'block';
                   document.getElementById('guide-steps').style.display = 'block';
                   
                   stepsList.push({'comment' : value.comment, 'id' : value.id, 'stepNumber' : value.stepNumber})
                }
                
                if(value.fileName){
                    value.isFile = true;
                    value.comment = value.comment + ' ' + '<a target="_blank" href="/uploads/' + value.fileName + '">File</a>';
                }
                
                if($.inArray('fullURL', JSON.parse(value.namespace)) > -1){
                    pushHints(value, element, hints);
                }else{
                    var pathArray = window.location.pathname.split( '/' );
                    var pathes = new Array();
                    var path = '';
                    $(pathArray).each(function(path_key, path_value){
                        if(path_value.length){
                            path = path + '/' + path_value;
                            pathes.push(path);
                        }
                    });
                    
                    var counter = 0;
                    $(JSON.parse(value.namespace)).each(function(k, namespace){
                        if($.inArray(namespace, pathes) > -1){
                            counter++;
                        }
                    });
                    
                    if(counter > 0){
                        pushHints(value, document.querySelector(value.elementPath), hints);
                    }
                }
            });
            
            if(hints.length){
                fillInStepsList(stepsList);
                intro.setOptions({
                    'showBullets': false,
                    hints: hints
                    
                });
                
                intro.addHints();
                intro.refresh();
            }
            
            //forbind to select hints in add mode
            $('.introjs-hint, .introjs-hint > *').addClass('not-selectable');
        }
        
        function pushHints(value, element, hints){
            hints.push({
                element: element,
                hint: value.comment,
                hintPosition: value.position,
                isGuide : value.isGuide,
                isFile : value.isFile
            });
            return hints;
        }
        
        function initJquerySortable(stepsListUpdatingFlag) {
            $('#guide-steps').sortable({
                forcePlaceholderSize: true
            }).bind('sortupdate', function(e, ui) {
                var stepsOrder = new Array();
                $('#guide-steps > li').each(function(key, element){
                    stepsOrder.push({'id' : $(element).attr('data-step-id'), 'stepNumber' : key + 1})
                });

                $.ajax({
                    method: "POST",
                    url: "http://oldtimers.me/server.php?action=updateGuideSteps",
                    data: {
                        'data' : JSON.stringify(stepsOrder),
                        'baseURL' :  location.origin
                    }
                })
                .done(function( result ) {
                    if(result.length){
                        addHints(JSON.parse(result));
                        $('#guide-steps').sortable({forcePlaceholderSize: true});
                    }
                });
            });
        }
        
        function getPathes(element, pathes){
            $(element).parent().parent().find('select :selected').each(function(i, selected){ 
                pathes[i] = $(selected).val(); 
            });
            
            return pathes;
        }
        
        function generatePathSelector(){
            var pathSelector = $('<select>').attr('id', 'path-selector').attr('multiple', 'true').attr('name', 'path-selector');
            $(pathSelector).append($('<option>').text('Full URL').attr('value', 'fullURL'));
            var pathArray = window.location.pathname.split( '/' );
            var path = '';
            $(pathArray).each(function(key, value){
                if(value.length){
                    path = path + '/' + value;
                    $(pathSelector).append($('<option>').text(path).attr('value', path));
                }
            });
            return pathSelector;
        }
}, false);

// START Functions responsible for getting css selector for element //
function childNodeIndexOf(parentNode, childNode) {
    var childNodes = parentNode.childNodes;
    for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i] === childNode) { return i; }
    }
}

function computedNthIndex(childElement) {
    var childNodes = childElement.parentNode.childNodes,
        tagName = childElement.tagName,
        elementsWithSameTag = 0;

    for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i] === childElement) { return elementsWithSameTag + 1; }
        if (childNodes[i].tagName === tagName) { elementsWithSameTag++; }
    }
}

function generate(node) {
    var textNodeIndex = childNodeIndexOf(node.parentNode, node),
        currentNode = node,
        tagNames = [];

    while (currentNode) {
        var tagName = currentNode.tagName;

        if (tagName) {
            var nthIndex = computedNthIndex(currentNode);
            var selector = tagName;

            if (nthIndex > 1) {
                selector += ":nth-of-type(" + nthIndex + ")";
            }

            tagNames.push(selector);
        }

        currentNode = currentNode.parentNode;
    }

    //return {selector: tagNames.reverse().join(" > ").toLowerCase(), childNodeIndex: textNodeIndex};
    return tagNames.reverse().join(" > ").toLowerCase();
}

function find(result) {
    var element = document.querySelector(result.selector);
    if (!element) { throw new Error('Unable to find element with selector: ' + result.selector); }
    return element.childNodes[result.childNodeIndex];
}
// END functions responsible for getting css selector for element //